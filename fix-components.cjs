const fs = require('fs');

// Fix DroneReconSimulator
let drone = fs.readFileSync('src/components/recon/DroneReconSimulator.tsx', 'utf8');
drone = drone.replace(/const handleDispatchBoat = \(target: BoundingBoxTarget\) => \{/, 'const handleDispatchBoat = async (target: BoundingBoxTarget) => {');
drone = drone.replace(/const req = createEmergencyRequest/, 'const req = await createEmergencyRequest');
drone = drone.replace(/assignRescueMission/, 'await assignRescueMission');
fs.writeFileSync('src/components/recon/DroneReconSimulator.tsx', drone);

// Fix AcousticVoiceAnalyzer
let acoustic = fs.readFileSync('src/components/recon/AcousticVoiceAnalyzer.tsx', 'utf8');
acoustic = acoustic.replace(/const handleConvertVoiceToSOS = \(\) => \{/, 'const handleConvertVoiceToSOS = async () => {');
acoustic = acoustic.replace(/const req = createEmergencyRequest/, 'const req = await createEmergencyRequest');
fs.writeFileSync('src/components/recon/AcousticVoiceAnalyzer.tsx', acoustic);

// Fix CitizenSOS
let sos = fs.readFileSync('src/pages/citizen/CitizenSOS.tsx', 'utf8');
sos = sos.replace(/setTimeout\(\(\) => \{\n        const newReq/, 'setTimeout(async () => {\n        const newReq');
sos = sos.replace(/const newReq = createEmergencyRequest/, 'const newReq = await createEmergencyRequest');
fs.writeFileSync('src/pages/citizen/CitizenSOS.tsx', sos);

// Fix CitizenReport
let report = fs.readFileSync('src/pages/citizen/CitizenReport.tsx', 'utf8');
report = report.replace(/const handleSubmit = \(e: React.FormEvent\) => \{/, 'const handleSubmit = async (e: React.FormEvent) => {');
report = report.replace(/const createdReq = createEmergencyRequest/, 'const createdReq = await createEmergencyRequest');
fs.writeFileSync('src/pages/citizen/CitizenReport.tsx', report);

console.log("Components fixed");
