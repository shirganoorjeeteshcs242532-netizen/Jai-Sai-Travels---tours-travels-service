const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://localhost:27017/jai-sai-travels';
const ATLAS_URI = 'mongodb+srv://jeeteshshirganoor1829_db_user:NoMWgWzxFsHiT9Sp@jaisaitravels-db.zfovx7d.mongodb.net/jaisaitravels?appName=jaisaitravels-db';

async function migrate() {
  console.log('🔄 Connecting to Local MongoDB...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('✅ Connected to Local MongoDB');

  console.log('🔄 Connecting to MongoDB Atlas...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('✅ Connected to MongoDB Atlas');

  const collections = ['settings', 'services', 'teammembers', 'galleries', 'admins', 'bookings'];

  for (const colName of collections) {
    console.log(`\n📦 Processing collection: ${colName}`);
    const localDocs = await localConn.collection(colName).find().toArray();
    console.log(`   Found ${localDocs.length} documents in local DB.`);

    if (localDocs.length > 0) {
      // Clear atlas collection first to avoid duplicates
      await atlasConn.collection(colName).deleteMany({});
      console.log(`   Cleared Atlas ${colName}`);

      // Insert local docs to Atlas
      await atlasConn.collection(colName).insertMany(localDocs);
      console.log(`   ✅ Transferred ${localDocs.length} documents to Atlas.`);
    } else {
      console.log(`   No documents to transfer for ${colName}`);
    }
  }

  console.log('\n🎉 ALL DATA HAS BEEN SUCCESSFULLY RESTORED & SYNCED TO MONGODB ATLAS!');

  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
