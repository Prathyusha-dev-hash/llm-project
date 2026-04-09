const { MongoClient } = require('mongodb');
const fs = require('fs');

async function main() {
  const uri = "mongodb+srv://prathyushachintha54_db_user:jVIuOoxAZaxK7UK9@cluster0.z5rysnq.mongodb.net/";
  const client = new MongoClient(uri);
  const result = { llm_project_cols: [] };

  try {
    await client.connect();
    
    const targetDb = client.db("LLM_Project");
    try {
      const collections = await targetDb.listCollections().toArray();
      for (let col of collections) {
        // fetch up to 2 samples to understand schema
        const samples = await targetDb.collection(col.name).find({}).limit(2).toArray();
        result.llm_project_cols.push({ name: col.name, samples });
      }
    } catch(e) { result.error = e.message; }
    
  } catch (err) {
    result.error = err.message;
  } finally {
    await client.close();
    fs.writeFileSync('db_output3.json', JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
