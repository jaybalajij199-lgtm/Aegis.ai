const fs = require('fs');
let store = fs.readFileSync('src/store/useAegisStore.ts', 'utf8');

// Filter emergencies directly when fetching from the database
store = store.replace(
  /globalState\.emergencies = emergencies;/,
  `globalState.emergencies = emergencies.filter((e: EmergencyRequest) => e.status !== 'RESOLVED' && e.status !== 'COMPLETED');`
);

fs.writeFileSync('src/store/useAegisStore.ts', store);
console.log("Store filter updated");
