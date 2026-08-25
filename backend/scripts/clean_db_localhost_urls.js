require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  let totalReplacements = 0;

  for (const col of collections) {
    const name = col.name;
    const docs = await db.collection(name).find({}).toArray();
    let colModified = 0;

    for (const doc of docs) {
      const docStr = JSON.stringify(doc);
      if (docStr.includes('http://localhost:5000')) {
        // Replace all http://localhost:5000 with empty (to make it relative /uploads/...) or with empty string
        // e.g. "http://localhost:5000/uploads/..." -> "/uploads/..."
        const newDocStr = docStr.replace(/http:\/\/localhost:5000/g, '');
        const updatedDoc = JSON.parse(newDocStr);
        delete updatedDoc._id; // avoid immutable field update error

        await db.collection(name).updateOne(
          { _id: doc._id },
          { $set: updatedDoc }
        );
        colModified++;
        totalReplacements++;
      }
    }

    if (colModified > 0) {
      console.log(`✅ Collection "${name}": Cleaned ${colModified} documents`);
    }
  }

  console.log(`\n🎉 Total documents cleaned in MongoDB: ${totalReplacements}`);
  await mongoose.disconnect();
}

run().catch(console.error);
