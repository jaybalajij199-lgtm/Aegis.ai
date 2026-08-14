const fs = require('fs');
let file = fs.readFileSync('src/components/recon/DroneReconSimulator.tsx', 'utf8');
file = file.replace(/const \{ await assignRescueMission/, 'const { assignRescueMission');
fs.writeFileSync('src/components/recon/DroneReconSimulator.tsx', file);
