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

async function runBrainTests() {
  console.log('[Smriti Phase 3 Brain Test] Starting verification...\n');
  let sparseProfileId = null;
  let denseProfileId = null;

  try {
    // 1. Create a person with SPARSE memories (1 single fragment)
    console.log('1. Testing Sparse Memory Scenario (The Solitary Flame)...');
    const sparseProfileRes = await request({
      host: 'localhost',
      port: 3001,
      path: '/api/profiles',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'David Miller',
      relationship: 'High school debate mentor',
    });
    sparseProfileId = sparseProfileRes.body.profile._id;

  // Add exactly 1 short memory fragment
  await request({
    host: 'localhost',
    port: 3001,
    path: '/api/memories',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    profileId: sparseProfileId,
    type: 'text',
    content: 'David always tapped his pen on the table and said: "Speak with clarity, not with volume."',
    sourceLabel: 'Debate room memory, 2017',
  });

  // Call /api/converse on sparse profile
  const sparseConverseRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/converse',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    profileId: sparseProfileId,
    query: 'What advice did David have when I feel nervous?',
  });

  console.log('   Response status:', sparseConverseRes.status);
  console.log('   Selected Mode:', sparseConverseRes.body.mode);
  console.log('   Is Sparse:', sparseConverseRes.body.isSparse);
  console.log('   Synthesized Message:\n', sparseConverseRes.body.message);
  console.log('   Citations:\n', sparseConverseRes.body.citations);

  if (sparseConverseRes.body.mode !== 'reflection') {
    throw new Error(`Expected mode to be 'reflection', got ${sparseConverseRes.body.mode}`);
  }
  if (!sparseConverseRes.body.isSparse) {
    throw new Error('Expected isSparse to be true');
  }

  console.log('\n2. Testing Dense Memory Scenario (The Sanctuary Conversation)...');
  const denseProfileRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/profiles',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    name: 'Ananya Bose',
    relationship: 'Grandmother',
  });
    denseProfileId = denseProfileRes.body.profile._id;

    const memoriesList = [
      { content: 'Ananya made cardamom sandesh every Sunday morning in her brass pot.', label: 'Sunday kitchen, 2015' },
      { content: 'She taught me how to read Tagore poetry sitting on the balcony.', label: 'Balcony readings' },
      { content: 'Her favorite advice: "Patience is a tree whose roots are bitter, but the fruit is very sweet."', label: 'Tagore notebook quote' },
      { content: 'She wore a white cotton sari with a thin red border on festival days.', label: 'Diwali 2019 photo' },
    ];

    for (const m of memoriesList) {
      await request({
        host: 'localhost',
        port: 3001,
        path: '/api/memories',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, {
        profileId: denseProfileId,
        type: 'text',
        content: m.content,
        sourceLabel: m.label,
      });
    }

    // Call /api/converse on dense profile
    const denseConverseRes = await request({
      host: 'localhost',
      port: 3001,
      path: '/api/converse',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      profileId: denseProfileId,
      query: 'What did grandmother tell me about patience and cooking?',
    });

    console.log('   Response status:', denseConverseRes.status);
    console.log('   Selected Mode:', denseConverseRes.body.mode);
    console.log('   Retrieved chunks:', denseConverseRes.body.sourceChunks.length);
    console.log('   Synthesized Message:\n', denseConverseRes.body.message);
    console.log('   Citations:\n', denseConverseRes.body.citations);

    if (denseConverseRes.body.mode !== 'conversational') {
      throw new Error(`Expected mode to be 'conversational', got ${denseConverseRes.body.mode}`);
    }

    console.log('\n[Smriti Phase 3 Brain Test] ALL TESTS PASSED (100% OK)');
  } finally {
    if (sparseProfileId) {
      await request({ host: 'localhost', port: 3001, path: `/api/profiles/${sparseProfileId}`, method: 'DELETE' });
    }
    if (denseProfileId) {
      await request({ host: 'localhost', port: 3001, path: `/api/profiles/${denseProfileId}`, method: 'DELETE' });
    }
    console.log('✔ Phase 3 test profiles cleaned up successfully.');
  }
}

runBrainTests().catch((err) => {
  console.error('[Brain Test Error]', err);
  process.exit(1);
});
