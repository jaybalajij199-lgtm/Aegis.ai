require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  const db = mongoose.connection.db;
  await db.collection('emergencies').deleteMany({});
  console.log('All emergencies deleted');
  process.exit(0);
}

run();
