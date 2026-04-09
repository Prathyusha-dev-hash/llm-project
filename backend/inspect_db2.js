const { MongoClient } = require('mongodb');
const fs = require('fs');

async function main() {
  const uri = "mongodb+srv://prathyushachintha54_db_user:jVIuOoxAZaxK7UK9@cluster0.z5rysnq.mongodb.net/";
  const client = new MongoClient(uri);
  const result = { dbs: [], llm_data_cols: [], default_cols: [] };

  try {
    await client.connect();
    
    const dbs = await client.db().admin().listDatabases();
    result.dbs = dbs.databases.map(db => db.name);

    const targetDb = client.db("llm_data");
    try {
      const collections = await targetDb.listCollections().toArray();
      for (let col of collections) {
        const sample = await targetDb.collection(col.name).findOne({});
        result.llm_data_cols.push({ name: col.name, sample });
      }
    } catch(e) { result.llm_data_cols_error = e.message; }

    const defaultDb = client.db('test'); // Or just client.db()
    result.defaultDbName = defaultDb.databaseName;
    try {
      const defaultCollections = await defaultDb.listCollections().toArray();
      for (let col of defaultCollections) {
        if (col.name === 'llm_data') {
          const sample = await defaultDb.collection(col.name).findOne({});
          result.default_cols.push({ name: col.name, sample });
        }
      }
    } catch(e) { result.default_cols_error = e.message; }
    console.log("Connected successfully");
    
  } catch (err) {
    result.error = err.message;
  } finally {
    await client.close();
    fs.writeFileSync('db_output.json', JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
