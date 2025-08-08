const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

async function testConnection() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Connected to MongoDB successfully!");
    await client.close();
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
  }
}

testConnection();