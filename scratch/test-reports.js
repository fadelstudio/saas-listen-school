const BASE_URL = 'http://localhost:3000';

async function testReports() {
  console.log('🚀 Démarrage des tests Reports...');

  let token = '';
  const testEmail = `report_tester_${Date.now()}@example.com`;

  try {
    // 1. Register & Login to get token
    console.log('\n🔐 Préparation de l\'utilisateur...');
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
        firstName: 'Report',
        lastName: 'Tester'
      })
    });
    const regData = await regRes.json();
    token = regData.data.token;

    // 2. Create Report
    console.log('\n📝 Test Création de Rapport...');
    const createRes = await fetch(`${BASE_URL}/api/reports`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Problème de climatisation',
        content: 'La climatisation dans la salle 204 ne fonctionne plus depuis ce matin.',
        type: 'PROBLEM_MATERIAL'
      })
    });
    const createData = await createRes.json();
    console.log('Res:', createData);
    const reportId = createData.data.id;

    // 3. Get All Reports
    console.log('\nlist Test Récupération des Rapports...');
    const listRes = await fetch(`${BASE_URL}/api/reports?page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listRes.json();
    console.log('List Res:', listData);
    if (listData.data) {
      console.log('Count:', listData.data.items.length);
    } else {
      console.log('❌ Erreur récupération liste:', listData.message);
    }

    // 4. Test Error: Update status as AGENT (Should fail)
    console.log('\n🚫 Test Droits (Update status as AGENT)...');
    const statusRes = await fetch(`${BASE_URL}/api/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'APPROVED' })
    });
    const statusData = await statusRes.json();
    console.log('Res (expected 403):', statusRes.status, statusData.message);

  } catch (error) {
    console.error('❌ Erreur pendant les tests:', error);
  }
}

testReports();
