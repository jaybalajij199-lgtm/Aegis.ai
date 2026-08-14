const fs = require('fs');
let code = fs.readFileSync('src/components/emergency/EmergencyQueue.tsx', 'utf8');

// Also filter out resolved in the component itself just in case new real-time changes come in
code = code.replace(
  /const filtered = activeList\.filter\(\(e\) => \{/,
  `const filtered = activeList.filter((e) => {
    if (e.status === 'RESOLVED' || e.status === 'COMPLETED') return false;`
);

fs.writeFileSync('src/components/emergency/EmergencyQueue.tsx', code);
console.log("Queue filter updated");
