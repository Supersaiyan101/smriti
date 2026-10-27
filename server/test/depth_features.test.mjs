import http from 'http';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
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

async function runDepthTests() {
  console.log('[Smriti Depth Features Test] Starting verification...\n');

  // 1. Create a person
  console.log('1. Creating test profile...');
  const profileRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/profiles',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    name: 'Kabir Das',
    relationship: 'Beloved grandfather',
  });

  const profileId = profileRes.body.profile._id;

  // 2. Add Memory with SENSORY ANCHORS (Rain, Scent, Song)
  console.log('2. Preserving memory with sensory anchors (weather, scent, song)...');
  const memoryRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/memories',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    profileId,
    type: 'text',
    content: 'Kabir always watered his tulsi plant at twilight before lighting the evening lamp.',
    sourceLabel: 'Evening veranda, 2019',
    sensory: {
      weather: 'Damp July monsoon',
      scent: 'Wet earth and tulsi leaves',
      song: 'Old radio playing classical sarod',
    },
  });

  console.log('   Saved memory status:', memoryRes.status);
  console.log('   Sensory Anchors:', memoryRes.body.memory.sensory);

  if (!memoryRes.body.memory.sensory || memoryRes.body.memory.sensory.weather !== 'Damp July monsoon') {
    throw new Error('Sensory anchors failed to persist correctly');
  }

  // 3. Write and Seal a "Letter to Them" (Unsent Letter)
  console.log('3. Writing and sealing a Letter to Them (Unsent letter)...');
  const letterRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/letters-to-them',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    profileId,
    title: 'It rained today, Dadu',
    content: 'Dear Dadu, It rained the whole afternoon just like July 2019. I made chai in your brass kettle and sat on the veranda. I felt you right beside me.',
  });

  console.log('   Sealed letter status:', letterRes.status);
  console.log('   Sealed Letter Title:', letterRes.body.letter.title);

  if (letterRes.status !== 201 || !letterRes.body.letter._id) {
    throw new Error('Failed to create letter to them');
  }

  // 4. Retrieve Letters to Them
  console.log('4. Retrieving all sealed letters on the altar...');
  const getLettersRes = await request({
    host: 'localhost',
    port: 3001,
    path: `/api/letters-to-them/${profileId}`,
    method: 'GET',
  });

  console.log('   Retrieved letters count:', getLettersRes.body.letters.length);
  console.log('   First letter title:', getLettersRes.body.letters[0]?.title);

  if (getLettersRes.body.letters.length === 0) {
    throw new Error('Could not retrieve sealed letters for profile');
  }

  console.log('\n[Smriti Depth Features Test] ALL DEPTH TESTS PASSED (100% OK)');
}

runDepthTests().catch((err) => {
  console.error('[Depth Test Error]', err);
  process.exit(1);
});
