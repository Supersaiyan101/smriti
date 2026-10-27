import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getEmbedding } from './embeddings.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'smriti';

let client = null;
let db = null;
let isConnectedToAtlas = false;

// Local JSON storage path for offline / zero-config fallback
const DATA_DIR = path.join(__dirname, 'data');
const LOCAL_DB_PATH = path.join(DATA_DIR, 'sanctuary_db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(
      LOCAL_DB_PATH,
      JSON.stringify({ profiles: [], memories: [] }, null, 2),
      'utf-8'
    );
  }
}

function readLocalDb() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    parsed.profiles = parsed.profiles || [];
    parsed.memories = parsed.memories || [];
    parsed.lettersToThem = parsed.lettersToThem || [];
    return parsed;
  } catch (err) {
    console.error('[Database Local Fallback] Read error, resetting:', err.message);
    return { profiles: [], memories: [], lettersToThem: [] };
  }
}

function writeLocalDb(data) {
  ensureDataDir();
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function connectDB() {
  if (db) return db;

  if (MONGODB_URI) {
    try {
      console.log('[Database] Connecting to MongoDB Atlas...');
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(DB_NAME);
      isConnectedToAtlas = true;
      console.log(`[Database] Connected successfully to MongoDB Atlas (${DB_NAME})`);
      return db;
    } catch (err) {
      console.warn(`[Database] MongoDB Atlas connection failed (${err.message}). Using local sanctuary storage.`);
    }
  } else {
    console.log('[Database] No MONGODB_URI set. Using local persistent sanctuary storage (server/data/sanctuary_db.json).');
  }

  ensureDataDir();
  return null;
}

export function isAtlas() {
  return isConnectedToAtlas;
}

// ----------------------------------------------------------------------
// Unified Database Operations (Works with MongoDB Atlas or Local Fallback)
// ----------------------------------------------------------------------

export const dbService = {
  // --- Profiles ---
  async createProfile({ name, relationship, photoUrl = null }) {
    await connectDB();
    const doc = {
      name,
      relationship,
      photoUrl,
      createdAt: new Date().toISOString(),
    };

    if (isConnectedToAtlas && db) {
      const res = await db.collection('profiles').insertOne(doc);
      return { _id: res.insertedId.toString(), ...doc };
    } else {
      const local = readLocalDb();
      const id = 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const record = { _id: id, ...doc };
      local.profiles.push(record);
      writeLocalDb(local);
      return record;
    }
  },

  async getProfiles() {
    await connectDB();
    if (isConnectedToAtlas && db) {
      const docs = await db.collection('profiles').find({}).sort({ createdAt: -1 }).toArray();
      return docs.map(d => ({ ...d, _id: d._id.toString() }));
    } else {
      const local = readLocalDb();
      return [...local.profiles].reverse();
    }
  },

  async getProfileById(id) {
    await connectDB();
    if (isConnectedToAtlas && db) {
      let query;
      try {
        query = { _id: new ObjectId(id) };
      } catch {
        query = { _id: id };
      }
      const doc = await db.collection('profiles').findOne(query);
      return doc ? { ...doc, _id: doc._id.toString() } : null;
    } else {
      const local = readLocalDb();
      return local.profiles.find(p => p._id === id) || null;
    }
  },

  // --- Memories ---
  async addMemory({ profileId, type, content, mediaUrl = null, sourceLabel = null, sensory = null }) {
    await connectDB();
    const embedding = await getEmbedding(content || sourceLabel || 'memory fragment');
    const doc = {
      profileId: profileId.toString(),
      type, // 'text' | 'voice' | 'photo'
      content, // text note or transcript
      mediaUrl, // audio or photo file path if uploaded
      sourceLabel: sourceLabel || (type === 'voice' ? 'Voice fragment' : 'Memory fragment'),
      sensory: sensory || null, // { weather, scent, song }
      embedding,
      createdAt: new Date().toISOString(),
    };

    if (isConnectedToAtlas && db) {
      const res = await db.collection('memories').insertOne(doc);
      return { _id: res.insertedId.toString(), ...doc };
    } else {
      const local = readLocalDb();
      const id = 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const record = { _id: id, ...doc };
      local.memories.push(record);
      writeLocalDb(local);
      return record;
    }
  },

  async getMemoriesByProfile(profileId) {
    await connectDB();
    const pid = profileId.toString();
    if (isConnectedToAtlas && db) {
      const docs = await db.collection('memories').find({ profileId: pid }).sort({ createdAt: -1 }).toArray();
      return docs.map(d => ({ ...d, _id: d._id.toString() }));
    } else {
      const local = readLocalDb();
      return local.memories.filter(m => m.profileId === pid);
    }
  },

  // --- Letters to Them (Unsent Letters Written by the User) ---
  async createLetterToThem({ profileId, content, title = 'Letter from the Heart' }) {
    await connectDB();
    const doc = {
      profileId: profileId.toString(),
      title: title || 'Letter from the Heart',
      content,
      createdAt: new Date().toISOString(),
    };

    if (isConnectedToAtlas && db) {
      const res = await db.collection('lettersToThem').insertOne(doc);
      return { _id: res.insertedId.toString(), ...doc };
    } else {
      const local = readLocalDb();
      const id = 'lt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const record = { _id: id, ...doc };
      local.lettersToThem.push(record);
      writeLocalDb(local);
      return record;
    }
  },

  async getLettersToThem(profileId) {
    await connectDB();
    const pid = profileId.toString();
    if (isConnectedToAtlas && db) {
      const docs = await db.collection('lettersToThem').find({ profileId: pid }).sort({ createdAt: -1 }).toArray();
      return docs.map(d => ({ ...d, _id: d._id.toString() }));
    } else {
      const local = readLocalDb();
      return (local.lettersToThem || []).filter(l => l.profileId === pid).reverse();
    }
  },
};
