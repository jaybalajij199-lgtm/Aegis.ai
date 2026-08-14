const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGODB_URI;
  console.log("URI in env:", uri ? uri.replace(/:([^:@]+)@/, ':****@') : "NONE");
  try {
    await mongoose.connect(uri);
    console.log("Connected successfully to DB");
    process.exit(0);
  } catch (e) {
    console.error("Connection failed:", e.message);
    process.exit(1);
  }
}
run();
