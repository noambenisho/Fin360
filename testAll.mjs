// seedAll.mjs
// Purpose: sanity-check DB connectivity and insert sample docs into all key collections.

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('❌ MONGO_URI is missing from .env');
  process.exit(1);
}

// ---------- Helpers ----------
function log(title, data) {
  console.log(`\n=== ${title} ===`);
  try {
    console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  } catch {
    console.log(data);
  }
}

function ensureModel(name, schemaFactory) {
  // Use an existing model if already registered, otherwise create a minimal fallback
  return mongoose.models[name] || mongoose.model(name, schemaFactory());
}

// ---------- Optional: try to import your real models (best case) ----------
let User, Profile;
try {
  // Adjust these paths if your models live elsewhere
  const userMod = await import('./models/User.js');
  User = userMod.default || userMod.User || userMod;
} catch {}
try {
  const profMod = await import('./models/Profile.js');
  Profile = profMod.default || profMod.Profile || profMod;
} catch {}

// ---------- Fallback minimal schemas (used only if import failed) ----------
if (!User) {
  User = ensureModel('User', () => {
    const { Schema } = mongoose;
    return new Schema(
      {
        email: { type: String, required: true, unique: true, index: true },
        password: { type: String, required: true },
        firstName: { type: String },
        lastName: { type: String },
        name: { type: String },
      },
      { timestamps: true, collection: 'users' }
    );
  });
}

if (!Profile) {
  Profile = ensureModel('Profile', () => {
    const { Schema } = mongoose;
    return new Schema(
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        monthlyIncome: { type: Number, default: 0 },
        monthlyExpenses: { type: Number, default: 0 },
        savings: { type: Number, default: 0 },
        monthlyInvestment: { type: Number, default: 0 },
        otherAssets: { type: Number, default: 0 },
        liabilities: { type: Number, default: 0 },
      },
      { timestamps: true, collection: 'profiles' }
    );
  });
}

async function main() {
  // 1) Connect
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  log('Mongo Connection', {
    host: conn.connection.host,
    db: conn.connection.name,
    readyState: conn.connection.readyState, // 1 = connected
  });

  // 2) Insert a test user (unique email each run)
  const email = `seed_${Date.now()}@example.com`;
  const passwordHash = await bcrypt.hash('DiagPass#12345', 10);

  let userDoc;
  try {
    userDoc = await User.create({
      email,
      password: passwordHash,
      firstName: 'Seed',
      lastName: 'User',
      name: 'Seed User',
    });
    log('User Inserted', { _id: userDoc._id.toString(), email: userDoc.email });
  } catch (e) {
    log('User Insert Error', e.message || e);
    // If duplicate/validation error, try to find the doc by email
    userDoc = await User.findOne({ email });
    if (!userDoc) throw e;
  }

  // 3) Insert a linked profile
  try {
    const profileDoc = await Profile.create({
      userId: userDoc._id,
      monthlyIncome: 12000,
      monthlyExpenses: 6500,
      savings: 20000,
      monthlyInvestment: 1500,
      otherAssets: 5000,
      liabilities: 10000,
    });
    log('Profile Inserted', { _id: profileDoc._id.toString(), userId: profileDoc.userId.toString() });
  } catch (e) {
    log('Profile Insert Error', e.message || e);
  }

  // 4) Report counts
  const [userCount, profileCount] = await Promise.all([
    User.countDocuments(),
    Profile.countDocuments(),
  ]);
  log('Collection Counts', { users: userCount, profiles: profileCount });

  // 5) (Optional) quick find to prove linkage
  const sample = await Profile.findOne().populate({ path: 'userId', select: 'email name' });
  if (sample) {
    log('Sample Joined Profile', {
      profileId: sample._id.toString(),
      user: sample.userId,
    });
  }

  await mongoose.disconnect();
  console.log('\n✅ Done.');
}

main().catch(async (err) => {
  console.error('\n💥 Fatal:', err?.message || err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
