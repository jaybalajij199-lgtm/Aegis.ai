const fs = require('fs');
let store = fs.readFileSync('src/store/useAegisStore.ts', 'utf8');
store = store.replace(/priorityScore: analysis\.priorityScore,/, 'priorityScore: analysis.score,');
store = store.replace(/priorityClassification: analysis\.priorityClassification,/, 'priorityClassification: analysis.classification,');
store = store.replace(/priorityAnalysis: analysis\.priorityAnalysis/, 'priorityAnalysis: analysis');
fs.writeFileSync('src/store/useAegisStore.ts', store);
console.log("Store fixed");
