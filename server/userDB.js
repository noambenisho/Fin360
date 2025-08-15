import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;

async function insertProfile() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB successfully!");

    const db = client.db("appdata");

    // Use the "Users" collection
    const collection = db.collection("Users");

    // Example document to insert
    const newProfile = {
      username: "johndoe",
      email: "john@example.com",
      createdAt: new Date(),
      isActive: true
    };

    const result = await collection.insertOne(newProfile);
    console.log(`✅ Inserted document with _id: ${result.insertedId}`);  // Fixed template literal
  } catch (error) {
    console.error("❌ Failed to insert profile:", error.message);
  } finally {
    if (client) {
      await client.close();
      console.log("🔌 Connection closed.");
    }
  }
}

// Self-invoking async function to handle the promise
(async () => {
  try {
    await insertProfile();
  } catch (error) {
    console.error("❌ Error running insertProfile:", error);
  }
})();