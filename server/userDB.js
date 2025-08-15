// seedAll.mjs
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ MONGO_URI is not set in .env');
  process.exit(1);
}

// Optional: allow overriding DB via CLI:  node seedAll.mjs --db fin360
const argDb = process.argv.find(a => a.startsWith('--db='))?.split('=')[1];

// Extract db name from connection string if present (mongodb or mongodb+srv)
function extractDbName(cs) {
  // Examples:
  // mongodb+srv://user:pass@host/dbname?opts...
  // mongodb://user:pass@host:27017/dbname?opts...
  // mongodb+srv://user:pass@host/  (no db -> undefined)
  const match = cs.match(/^mongodb(\+srv)?:\/\/[^/]+\/([^?/]*)/i);
  if (!match) return undefined;
  const db = match[2];
  return db && db.length ? db : undefined;
}

const fromUri = extractDbName(uri);
const dbName = argDb || fromUri || 'test';

if (dbName === 'test') {
  console.warn('⚠️  No DB specified in --db or in the URI; using "test". If this is unintentional, run with --db=fin360 or add the db name to your URI.');
}

function tsId() {
  return `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Basic ping
    const ping = await client.db('admin').command({ ping: 1 });
    console.log('✅ Ping:', ping);

    const db = client.db(dbName);
    console.log(`📦 Using database: ${db.databaseName}`);

    // ---- Ensure collections & indexes ----
    const users = db.collection('users');
    const profiles = db.collection('profiles');
    const appdataProfile = db.collection('appdata.profile');
    const testProfiles = db.collection('test_profiles');

    // Unique index on users.email
    try {
      await users.createIndex({ email: 1 }, { unique: true, name: 'uniq_email' });
      console.log('✅ users: ensured unique index on email');
    } catch (e) {
      console.warn('⚠️  users: index creation warning:', e.message);
    }

    // ---- Insert sample docs ----
    const seedSuffix = tsId();
    const demoEmail = `demo_${seedSuffix}@example.com`;

    // 1) users
    let userId;
    try {
      const userDoc = {
        email: demoEmail,
        // IMPORTANT: this is just a seed; your real app hashes on the server
        password: 'hashed-password-placeholder',
        name: 'Demo User',
        createdAt: new Date(),
      };
      const { insertedId } = await users.insertOne(userDoc);
      userId = insertedId;
      console.log(`✅ users: inserted _id=${insertedId.toHexString()} email=${demoEmail}`);
    } catch (e) {
      if (e.code === 11000) {
        // duplicate (shouldn’t happen with unique suffix, but handle anyway)
        console.warn('⚠️  users: duplicate email, generating a new one…');
        const { insertedId } = await users.insertOne({
          email: `demo_${tsId()}@example.com`,
          password: 'hashed-password-placeholder',
          name: 'Demo User',
          createdAt: new Date(),
        });
        userId = insertedId;
        console.log(`✅ users: inserted _id=${insertedId.toHexString()} (duplicate handled)`);
      } else {
        throw e;
      }
    }

    // 2) profiles (link to users via userId)
    try {
      const prof = {
        userId: new ObjectId(userId),
        monthlyIncome: 12000,
        monthlyExpenses: 7000,
        savings: 20000,
        monthlyInvestment: 1500,
        otherAssets: [{ type: 'Stocks', value: 5000 }],
        liabilities: [{ type: 'Credit Card', value: 1200 }],
        createdAt: new Date(),
      };
      const { insertedId } = await profiles.insertOne(prof);
      console.log(`✅ profiles: inserted _id=${insertedId.toHexString()} linkedTo=${userId.toHexString()}`);
    } catch (e) {
      console.error('❌ profiles: insert failed:', e.message);
    }

    // 3) appdata.profile (arbitrary “app data” style doc)
    try {
      const doc = {
        username: `user_${seedSuffix}`,
        email: `user_${seedSuffix}@example.com`,
        createdAt: new Date(),
        isActive: true,
        notes: 'Seed record for connectivity test',
      };
      const { insertedId } = await appdataProfile.insertOne(doc);
      console.log(`✅ appdata.profile: inserted _id=${insertedId.toHexString()}`);
    } catch (e) {
      console.error('❌ appdata.profile: insert failed:', e.message);
    }

    // 4) test_profiles (simple doc)
    try {
      const doc = {
        label: `test_profile_${seedSuffix}`,
        metrics: { a: 1, b: 2, c: 3 },
        createdAt: new Date(),
      };
      const { insertedId } = await testProfiles.insertOne(doc);
      console.log(`✅ test_profiles: inserted _id=${insertedId.toHexString()}`);
    } catch (e) {
      console.error('❌ test_profiles: insert failed:', e.message);
    }

    // ---- Counts summary ----
    const [usersCount, profilesCount, appdataCount, testProfilesCount] = await Promise.all([
      users.countDocuments(),
      profiles.countDocuments(),
      appdataProfile.countDocuments(),
      testProfiles.countDocuments(),
    ]);

    console.log('\n📊 Collection counts:');
    console.log('  users           :', usersCount);
    console.log('  profiles        :', profilesCount);
    console.log('  appdata.profile :', appdataCount);
    console.log('  test_profiles   :', testProfilesCount);

    console.log('\n✅ Seeding complete.');
  } catch (err) {
    console.error('💥 Seed error:', err.message);
    process.exitCode = 1;
  } finally {
    try {
      await new Promise(r => setTimeout(r, 50)); // tiny delay for logs to flush
      await MongoClient.prototype?.close?.call?.(undefined); // noop safeguard
    } catch {}
  }
}

// We keep client in local scope, so handle close explicitly:
(async () => {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    // Rebind global so main() can reuse a single client if desired
    MongoClient.prototype.close = async function close() {
      return client.close();
    };
    await client.db('admin').command({ ping: 1 }); // sanity
  } catch (e) {
    console.error('❌ Initial connect failed:', e.message);
    process.exit(1);
  } finally {
    // continue to main using the same client by shadowing close (above)
  }
  await main();
})();
