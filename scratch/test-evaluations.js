const BASE_URL = 'http://localhost:3000';

async function testEvaluations() {
  console.log('🚀 Démarrage des tests Evaluations...');

  let token = '';
  const testEmail = `eval_tester_${Date.now()}@example.com`;

  try {
    // 1. Setup User & Report
    console.log('\n🔐 Préparation...');
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
        firstName: 'Eval',
        lastName: 'Tester'
      })
    });
    const regData = await regRes.json();
    token = regData.data.token;

    const reportRes = await fetch(`${BASE_URL}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: 'Rapport pour Eval', content: 'Contenu du rapport à évaluer.' })
    });
    const reportData = await reportRes.json();
    const reportId = reportData.data.id;

    // 2. Create Evaluation
    console.log('\n⭐ Test Création d\'Évaluation...');
    const evalRes = await fetch(`${BASE_URL}/api/evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        reportId,
        score: 4.5,
        comments: 'Très bon rapport, clair et précis.'
      })
    });
    const evalData = await evalRes.json();
    console.log('Res:', evalData);
    if (evalRes.ok) console.log('✅ Évaluation créée');

    // 3. Get Stats
    console.log('\n📊 Test des Statistiques...');
    const statsRes = await fetch(`${BASE_URL}/api/evaluations/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    console.log('Res:', statsData.success ? 'OK' : 'FAIL', statsData.data);

  } catch (error) {
    console.error('❌ Erreur pendant les tests:', error);
  }
}

testEvaluations();
