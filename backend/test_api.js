async function test() {
  try {
    console.log("Testing GET /api/students...");
    const res1 = await fetch('http://localhost:4000/api/students');
    const students = await res1.json();
    console.log(`Found ${students.length} students. First student:`, students[0]);

    console.log("\nTesting POST /api/chat with keyword 'linear classifier'...");
    const res2 = await fetch('http://localhost:4000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "What is a linear classifier?" })
    });
    const chat = await res2.json();
    console.log("Chat reply:\n", chat.reply);

  } catch(e) {
    console.error("Test failed:", e);
  }
}
test();
