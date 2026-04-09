const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://prathyushachintha54_db_user:jVIuOoxAZaxK7UK9@cluster0.z5rysnq.mongodb.net/";
const client = new MongoClient(uri);

async function inspect() {
  try {
    await client.connect();
    const db = client.db('LLM_Project');
    const cols = await db.collection('Student_details').find({}).limit(2).toArray();
    console.log(JSON.stringify(cols, null, 2));
  } finally {
    await client.close();
  }
}
inspect().catch(console.error);
