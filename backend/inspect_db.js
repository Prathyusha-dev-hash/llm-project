const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb+srv://prathyushachintha54_db_user:jVIuOoxAZaxK7UK9@cluster0.z5rysnq.mongodb.net/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected correctly to server");

    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log("Databases:");
    
    let targetDbName = "llm_data"; // assuming llm_data might be a db or collection
    for (let db of dbs.databases) {
      console.log(` - ${db.name}`);
    }

    // Checking collections in llm_data db
    const targetDb = client.db("llm_data");
    const collections = await targetDb.listCollections().toArray();
    console.log("\nCollections in 'llm_data':");
    for (let col of collections) {
      console.log(` - ${col.name}`);
      const sample = await targetDb.collection(col.name).findOne({});
      console.log(`   Sample doc: ${JSON.stringify(sample).substring(0, 200)}...`);
    }

    // Checking if llm_data is a collection in the default db
    const defaultDb = client.db();
    console.log(`\nDefault DB name: ${defaultDb.databaseName}`);
    const defaultCollections = await defaultDb.listCollections().toArray();
    console.log("\nCollections in default db:");
    for (let col of defaultCollections) {
      console.log(` - ${col.name}`);
      if (col.name === 'llm_data') {
        const sample = await defaultDb.collection(col.name).findOne({});
        console.log(`   Sample doc in llm_data collection: ${JSON.stringify(sample).substring(0, 200)}...`);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
