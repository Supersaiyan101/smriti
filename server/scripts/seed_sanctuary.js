import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'sanctuary_db.json');

const profiles = [
  {
    _id: 'p_arjun_mehta',
    name: 'Arjun Mehta',
    relationship: 'Best friend from college',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-27T10:00:00.000Z'
  },
  {
    _id: 'p_ananya_bose',
    name: 'Ananya Bose',
    relationship: 'Grandmother',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-27T11:00:00.000Z'
  },
  {
    _id: 'p_david_miller',
    name: 'David Miller',
    relationship: 'High school debate mentor',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-27T12:00:00.000Z'
  }
];

const memories = [
  // Arjun Mehta
  {
    _id: 'm_arjun_1',
    profileId: 'p_arjun_mehta',
    type: 'text',
    content: 'Whenever it rained, Arjun would order cutting chai and say "Everything works out in the end, bhai." He carried a dog-eared copy of Shantaram in his canvas satchel.',
    mediaUrl: null,
    sourceLabel: 'Chai stall memory, 2018',
    sensory: { weather: 'Heavy monsoon rain', scent: 'Cardamom & wet red earth', song: 'Tum Ho - Rockstar' },
    timePlace: { when: 'Monsoon 2018', where: 'Old Delhi Chai Stall' },
    isReelSlide: false,
    createdAt: '2026-10-27T10:10:00.000Z'
  },
  {
    _id: 'm_arjun_2',
    profileId: 'p_arjun_mehta',
    type: 'text',
    content: 'During our road trip to Himachal, when the tire punctured near Solan at 2 AM, he sat on the hood and looked at the Milky Way with absolute peace.',
    mediaUrl: null,
    sourceLabel: 'Solan highway breakdown',
    sensory: { weather: 'Crisp mountain night', scent: 'Pine needles & woodsmoke', song: null },
    timePlace: { when: 'October 2019', where: 'Solan Highway' },
    isReelSlide: false,
    createdAt: '2026-10-27T10:15:00.000Z'
  },
  {
    _id: 'm_arjun_reel_1',
    profileId: 'p_arjun_mehta',
    type: 'photo',
    content: 'We missed our midnight connection to Dehradun and had three hours to wait under the amber station lamps. You bought two earthen kulhads of steaming cardamom chai and said: "Someday we will laugh at this." I am laughing now, bhai, but I miss you dearly.',
    mediaUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    sourceLabel: 'The Midnight Chai at Old Delhi Station',
    sensory: { weather: 'Chilly autumn night', scent: 'Steaming cardamom chai', song: 'Tum Ho' },
    timePlace: { when: 'November 2018', where: 'Old Delhi Railway Station' },
    isReelSlide: true,
    order: 0,
    createdAt: '2026-10-27T10:20:00.000Z'
  },
  {
    _id: 'm_arjun_reel_2',
    profileId: 'p_arjun_mehta',
    type: 'photo',
    content: 'When the radiator steamed and our old hatchback gave up in the middle of nowhere, everyone was frantic except you. You leaned back against the hood, looked straight up at the stars, and whispered: "Look how lucky we are to break down right where the sky is this clear."',
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    sourceLabel: 'The Solan Mountain Night',
    sensory: { weather: 'Clear starlit night', scent: 'Pine breeze', song: null },
    timePlace: { when: 'October 2019', where: 'Solan, Himachal Pradesh' },
    isReelSlide: true,
    order: 1,
    createdAt: '2026-10-27T10:25:00.000Z'
  },
  {
    _id: 'm_arjun_reel_3',
    profileId: 'p_arjun_mehta',
    type: 'photo',
    content: 'You threw your black graduation cap into the wind before anyone else, completely unbothered that it got caught high in the banyan tree branches. You grinned that wide, untroubled smile that made all of us believe we were invincible.',
    mediaUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    sourceLabel: 'Graduation Morning Smile',
    sensory: { weather: 'Sunny afternoon breeze', scent: 'Old parchment & marigold garlands', song: null },
    timePlace: { when: 'May 2021', where: 'University Quadrangle' },
    isReelSlide: true,
    order: 2,
    createdAt: '2026-10-27T10:30:00.000Z'
  },

  // Ananya Bose
  {
    _id: 'm_ananya_1',
    profileId: 'p_ananya_bose',
    type: 'text',
    content: 'Ananya made cardamom sandesh every Sunday morning in her brass pot. The whole courtyard smelled of roasted milk and warm saffron.',
    mediaUrl: null,
    sourceLabel: 'Sunday kitchen, 2015',
    sensory: { weather: 'Warm Sunday morning', scent: 'Cardamom sandesh & roasted milk', song: null },
    timePlace: { when: 'Sundays 2015-2020', where: 'North Kolkata Kitchen' },
    isReelSlide: false,
    createdAt: '2026-10-27T11:10:00.000Z'
  },
  {
    _id: 'm_ananya_2',
    profileId: 'p_ananya_bose',
    type: 'text',
    content: 'She taught me how to read Tagore poetry sitting on the balcony as the evening crows flew back to the trees. "Patience is a tree whose roots are bitter, but the fruit is very sweet."',
    mediaUrl: null,
    sourceLabel: 'Balcony readings',
    sensory: { weather: 'Gentle dusk breeze', scent: 'Night-blooming jasmine', song: 'Rabindrasangeet on radio' },
    timePlace: { when: 'Spring 2019', where: 'Balcony garden' },
    isReelSlide: false,
    createdAt: '2026-10-27T11:15:00.000Z'
  },
  {
    _id: 'm_ananya_reel_1',
    profileId: 'p_ananya_bose',
    type: 'photo',
    content: 'Every afternoon when the sun dipped behind the red brick chimneys, Dida sat in her wooden cane chair with Tagore\'s Gitanjali. She didn\'t just read the verses; she hummed them like an old lullaby that kept the whole house sheltered.',
    mediaUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
    sourceLabel: 'Sunday Balcony & Gitanjali',
    sensory: { weather: 'Golden hour twilight', scent: 'Antique paper & jasmine incense', song: 'Ami Chini Go Chini' },
    timePlace: { when: 'April 2019', where: 'North Kolkata Balcony' },
    isReelSlide: true,
    order: 0,
    createdAt: '2026-10-27T11:20:00.000Z'
  },
  {
    _id: 'm_ananya_reel_2',
    profileId: 'p_ananya_bose',
    type: 'photo',
    content: 'Her hands were always steady and tender, stirring the sweetened curd over a low flame in the brass vessel that had belonged to her mother. She would slide a warm silver bowl toward me before anyone else woke up.',
    mediaUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    sourceLabel: 'The Hearth of Sandesh',
    sensory: { weather: 'Crisp Diwali morning', scent: 'Ghee, cardamom, roasted pistachio', song: null },
    timePlace: { when: 'November 2019', where: 'Family Kitchen Hearth' },
    isReelSlide: true,
    order: 1,
    createdAt: '2026-10-27T11:25:00.000Z'
  },

  // David Miller
  {
    _id: 'm_david_1',
    profileId: 'p_david_miller',
    type: 'text',
    content: 'David always tapped his pen twice on the oak podium before speaking: "Speak with clarity, not with volume. The truth has a quiet weight of its own."',
    mediaUrl: null,
    sourceLabel: 'Debate room memory, 2017',
    sensory: { weather: 'Rainy afternoon', scent: 'Old library paper & cedarwood', song: null },
    timePlace: { when: 'Fall 2017', where: 'Lincoln Hall Room 204' },
    isReelSlide: false,
    createdAt: '2026-10-27T12:10:00.000Z'
  },
  {
    _id: 'm_david_reel_1',
    profileId: 'p_david_miller',
    type: 'photo',
    content: 'Just before the state finals when my hands were shaking so hard I couldn\'t hold my index cards, Mr. Miller handed me an unsharpened yellow pencil and whispered: "Hold this. Breathe. The truth doesn\'t need to shout to be heard." That pencil stayed in my breast pocket through every trial of my life.',
    mediaUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    sourceLabel: 'The Unsharpened Pencil at Lincoln Hall',
    sensory: { weather: 'Chilly autumn evening', scent: 'Polished oak & typewriter ink', song: null },
    timePlace: { when: 'November 2017', where: 'Lincoln Hall Auditorium' },
    isReelSlide: true,
    order: 0,
    createdAt: '2026-10-27T12:20:00.000Z'
  }
];

const reelSoundtracks = {
  'p_arjun_mehta': { title: 'Peaceful Piano Dusk', trackId: 'dusk_piano' },
  'p_ananya_bose': { title: 'Twilight Sarod', trackId: 'twilight_sarod' },
  'p_david_miller': { title: 'Warm Acoustic Strings', trackId: 'acoustic_strings' }
};

const lettersToThem = [
  {
    _id: 'l_arjun_1',
    profileId: 'p_arjun_mehta',
    title: 'To the boy who believed in stars',
    createdAt: '2026-10-27T10:45:00.000Z'
  }
];

export function getSeedData() {
  return {
    profiles,
    memories,
    reelSoundtracks,
    lettersToThem,
  };
}

export function seed() {
  const data = getSeedData();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Sanctuary DB successfully cleaned to exactly 3 pristine profiles!');
}

if (process.argv[1] && process.argv[1].endsWith('seed_sanctuary.js')) {
  seed();
}
