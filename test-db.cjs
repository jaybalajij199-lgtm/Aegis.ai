const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log("No MONGODB_URI found in env");
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log("Connected to DB");
    const db = mongoose.connection.db;
    const count = await db.collection('users').countDocuments();
    console.log("Users in DB:", count);
    const users = await db.collection('users').find({}).toArray();
    console.log("Users:", users.map(u => u.email));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
