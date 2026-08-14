const http = require('http');

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTest() {
  console.log('--- STARTING E2E ACTIVITY TEST ---');
  const issues = [];
  try {
    // 1. Citizen creates SOS
    console.log('1. Simulating Citizen SOS...');
    const emergencyPayload = {
      id: `EMG-TEST-${Date.now()}`,
      reporterName: 'Test Citizen',
      reporterRole: 'CITIZEN',
      disasterType: 'FLOOD',
      description: 'E2E Test SOS',
      status: 'AI_PRIORITIZED',
      location: { lat: 20.0, lng: 85.0, address: 'Test Loc', district: 'Test District' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await request('/emergencies', 'POST', emergencyPayload);
    console.log('   -> Citizen SOS created.');

    // 2. Control Room Queue Check
    console.log('2. Control Room Queue Validation...');
    let emergencies = await request('/emergencies');
    const created = emergencies.find(e => e.id === emergencyPayload.id);
    if (!created) {
      issues.push({ module: 'Control Room / DB', issue: 'SOS signal was not saved to DB or not retrieved in GET /emergencies.' });
    }

    // 3. Control Room Allocates Resources & Creates Mission
    console.log('3. Control Room Allocating Resources & Dispatching Mission...');
    await request(`/emergencies/${emergencyPayload.id}`, 'PUT', { ...emergencyPayload, status: 'TEAM_ASSIGNED' });
    
    const missionPayload = {
      id: `MSN-TEST-${Date.now()}`,
      requestId: emergencyPayload.id,
      teamId: 'TEAM-1',
      teamName: 'Test Squad',
      leaderName: 'Test Officer',
      status: 'DISPATCHED',
      location: emergencyPayload.location,
      logs: []
    };
    await request('/missions', 'POST', missionPayload);
    console.log('   -> Mission dispatched successfully.');

    // 4. Officer Dashboard Validation
    console.log('4. Officer Dashboard Update Validation...');
    let missions = await request('/missions');
    const assignedMission = missions.find(m => m.id === missionPayload.id);
    if (!assignedMission) {
      issues.push({ module: 'Officer Dashboard / DB', issue: 'Mission was not saved to DB or not retrieved in GET /missions.' });
    }

    // 5. Officer Completes Mission
    console.log('5. Officer resolving the mission...');
    await request(`/missions/${missionPayload.id}`, 'PUT', { ...missionPayload, status: 'MISSION_COMPLETE' });
    await request(`/emergencies/${emergencyPayload.id}`, 'PUT', { ...emergencyPayload, status: 'RESOLVED' });
    console.log('   -> Officer action completed.');

    // 6. Cleanup Validation
    console.log('6. Validating GIS Map & Queue Cleanup...');
    emergencies = await request('/emergencies');
    const resolvedSignal = emergencies.find(e => e.id === emergencyPayload.id);
    if (resolvedSignal && resolvedSignal.status !== 'RESOLVED') {
      issues.push({ module: 'Emergency State', issue: 'Emergency status in DB did not update to RESOLVED.' });
    }

    missions = await request('/missions');
    const completedMission = missions.find(m => m.id === missionPayload.id);
    if (completedMission && completedMission.status !== 'MISSION_COMPLETE') {
      issues.push({ module: 'Mission State', issue: 'Mission status in DB did not update to MISSION_COMPLETE.' });
    }

    console.log('--- TEST RESULTS ---');
    if (issues.length === 0) {
      console.log('✅ All core integrations (Citizen -> Control Room -> Officer -> GIS/Queue Resolution) working correctly.');
    } else {
      console.log('❌ Issues Found:');
      console.log(JSON.stringify(issues, null, 2));
    }
  } catch (e) {
    console.error('Test script crashed:', e.message);
  }
}

runTest();
