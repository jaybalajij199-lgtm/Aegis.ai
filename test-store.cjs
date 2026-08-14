const fs = require('fs');
let store = fs.readFileSync('src/store/useAegisStore.ts', 'utf8');
if (store.includes("e.status !== 'RESOLVED' && e.status !== 'COMPLETED'")) {
    console.log("Filter is present");
} else {
    console.log("Filter NOT present");
}
