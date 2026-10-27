import http from 'http';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runVoiceLetterTests() {
  console.log('[Smriti Phase 4 Voice & Letter Test] Starting verification...\n');

  // 1. Create a person to test
  console.log('1. Setting up profile for voice and letter tests...');
  const profileRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/profiles',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    name: 'Maya Lin',
    relationship: 'Beloved Architecture Professor',
  });

  const profileId = profileRes.body.profile._id;

  // Add 2 memory fragments
  await request({
    host: 'localhost',
    port: 3001,
    path: '/api/memories',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    profileId,
    type: 'text',
    content: 'Maya always said: "Light is the only material in architecture that costs nothing, yet shapes everything."',
    sourceLabel: 'Studio critique, 2016',
  });

  await request({
    host: 'localhost',
    port: 3001,
    path: '/api/memories',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    profileId,
    type: 'text',
    content: 'She wore black turtlenecks and brought fresh jasmine flowers to class every Monday morning.',
    sourceLabel: 'Monday morning rituals',
  });

  // 2. Test Voice Endpoint (POST /api/voice)
  console.log('2. Testing ElevenLabs Voice Endpoint (POST /api/voice)...');
  const voiceRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/voice',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    text: 'Maya always said: "Light is the only material in architecture that costs nothing, yet shapes everything." [Studio critique, 2016]',
  });

  console.log('   Voice status:', voiceRes.status);
  console.log('   Voice provider:', voiceRes.body?.provider || voiceRes.headers['content-type']);
  console.log('   Clean text for speech:', voiceRes.body?.text);

  if (voiceRes.status !== 200) {
    throw new Error(`Expected voice status 200, got ${voiceRes.status}`);
  }

  // Verify citation was stripped from speech text
  if (voiceRes.body?.text && voiceRes.body.text.includes('[Studio critique, 2016]')) {
    throw new Error('Citations should be stripped from spoken speech text');
  }

  // 3. Test Keepsake Letter Generation (GET /api/letter/:profileId)
  console.log(`\n3. Testing Keepsake Letter Generation (GET /api/letter/${profileId})...`);
  const letterRes = await request({
    host: 'localhost',
    port: 3001,
    path: `/api/letter/${profileId}`,
    method: 'GET',
  });

  console.log('   Letter status:', letterRes.status);
  const letter = letterRes.body.letter;
  console.log('   Letter Name:', letter.profile.name);
  console.log('   Featured Quote:\n   "', letter.featuredQuote, '"');
  console.log('   Passage:\n   ', letter.passage.slice(0, 180) + '...');
  console.log('   Closing:', letter.closing);
  console.log('   Date:', letter.date);

  if (letterRes.status !== 200) {
    throw new Error(`Expected letter status 200, got ${letterRes.status}`);
  }
  if (!letter.featuredQuote || !letter.passage) {
    throw new Error('Keepsake letter missing quote or passage');
  }

  console.log('\n[Smriti Phase 4 Voice & Letter Test] ALL TESTS PASSED (100% OK)');
}

runVoiceLetterTests().catch((err) => {
  console.error('[Phase 4 Test Error]', err);
  process.exit(1);
});
