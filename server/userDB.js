import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;

async function insertProfile() {
  if (!uri) {
    throw new Error("MongoDB URI is not defined in environment variables");
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB successfully!");

    const db = client.db("appdata");
    const collection = db.collection("Users");

    // Example document to insert
    const newProfile = {
      username: "johndoe",
      email: "john@example.com",
      createdAt: new Date(),
      isActive: true
    };

    // Validate required fields
    if (!newProfile.username || !newProfile.email) {
      throw new Error("Username and email are required fields");
    }

    const result = await collection.insertOne(newProfile);
    console.log(`✅ Inserted document with _id: ${result.insertedId}`);
  } catch (error) {
    console.error("❌ Failed to insert profile:", error.message);
  } finally {
    if (client) {
      await client.close();
      console.log("🔌 Connection closed.");
    }
  }
}

// Execute the function and handle any uncaught errors
insertProfile().catch(console.error);