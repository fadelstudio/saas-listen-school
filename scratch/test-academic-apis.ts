import "dotenv/config";

const API_URL = 'http://localhost:3000/api';

async function testAcademicApis() {
  console.log('🚀 Testing New Academic APIs...');

  try {
    // 1. Get Token (using existing test user if possible, or just login admin)
    // For simplicity, we'll use the student we registered in the flow test
    // or just registered another one quickly
    console.log('\n📝 Logging in as Admin to test APIs...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@afi.com',
        password: 'fadeldev'
      })
    });
    const loginData = await loginRes.json() as any;
    const token = loginData.data.token;

    const headers = { 'Authorization': `Bearer ${token}` };

    // 2. Test Campuses
    console.log('\n🏥 Testing /campuses...');
    const campRes = await fetch(`${API_URL}/campuses`, { headers });
    const campData = await campRes.json() as any;
    console.log(`Found ${campData.data.items.length} campuses`);

    // 3. Test Classes
    console.log('\n🏫 Testing /classes...');
    const classRes = await fetch(`${API_URL}/classes`, { headers });
    const classData = await classRes.json() as any;
    console.log(`Found ${classData.data.items.length} classes`);

    // 4. Test Professors
    console.log('\n👨‍🏫 Testing /professors...');
    const profRes = await fetch(`${API_URL}/professors`, { headers });
    const profData = await profRes.json() as any;
    console.log(`Found ${profData.data.items.length} professors`);

    // 5. Test Academic Modules
    console.log('\n📚 Testing /academic-modules...');
    const modRes = await fetch(`${API_URL}/academic-modules`, { headers });
    const modData = await modRes.json() as any;
    console.log(`Found ${modData.data.items.length} modules`);

    console.log('\n✨ All Academic APIs are WORKING!');

  } catch (error: any) {
    console.error('❌ Error during API testing:', error.message);
  }
}

testAcademicApis();
