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

async function runTests() {
  console.log('[Smriti Test Suite] Starting integration verification...');

  // 1. Health check
  console.log('✔ Pinging /api/health ...');
  const health = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET',
  });
  if (health.status !== 200) throw new Error(`Health status ${health.status}`);

  let profileId = null;
  try {
    // 2. Create Profile
    console.log('✔ Creating memorial profile ...');
    const createRes = await request({
      host: 'localhost',
      port: 3001,
      path: '/api/profiles',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Priya Sen',
      relationship: 'Sister & mentor',
    });
    if (createRes.status !== 201) throw new Error(`Create profile status ${createRes.status}`);

    profileId = createRes.body.profile._id;

    // 3. Add Memory Fragment
    console.log('✔ Adding memory fragment ...');
    const memoryRes = await request({
      host: 'localhost',
      port: 3001,
      path: '/api/memories',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      profileId,
      type: 'text',
      content: 'Priya always kept a sketchbook with pressed bougainvillea flowers.',
      sourceLabel: 'Sketchbook memory',
    });
    if (memoryRes.status !== 201) throw new Error(`Memory status ${memoryRes.status}`);

    // 4. Retrieve Profile & Memories
    console.log('✔ Retrieving profile and memory hierarchy ...');
    const getOneRes = await request({
      host: 'localhost',
      port: 3001,
      path: `/api/profiles/${profileId}`,
      method: 'GET',
    });
    if (getOneRes.status !== 200 || !getOneRes.body.memories.length) {
      throw new Error('Could not retrieve memory hierarchy');
    }

    console.log('\n[Smriti Test Suite] ALL INTEGRATION TESTS PASSED (100% OK)');
  } finally {
    if (profileId) {
      await request({
        host: 'localhost',
        port: 3001,
        path: `/api/profiles/${profileId}`,
        method: 'DELETE',
      });
      console.log('✔ Test profile cleaned up successfully.');
    }
  }
}

runTests().catch(err => {
  console.error('[Smriti Test Suite Error]', err);
  process.exit(1);
});
