const fs = require('fs');
let store = fs.readFileSync('src/store/useAegisStore.ts', 'utf8');

store = store.replace(
  /const triggerDemoScenarioNextStep = \(\) => \{/,
  'const triggerDemoScenarioNextStep = async () => {'
);
store = store.replace(
  /createEmergencyRequest\(\{/,
  'await createEmergencyRequest({'
);
store = store.replace(
  /allocateResources\(/,
  'await allocateResources('
);
store = store.replace(
  /assignRescueMission\(/,
  'await assignRescueMission('
);

fs.writeFileSync('src/store/useAegisStore.ts', store);
console.log("Demo step fixed");
