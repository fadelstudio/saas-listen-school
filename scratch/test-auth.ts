const BASE_URL = 'http://localhost:3000';

async function testAuth() {
  console.log('🚀 Démarrage des tests Auth...');

  let token = '';
  const testEmail = `testuser_${Date.now()}@example.com`;

  try {
    // 1. Health check
    const health = await fetch(`${BASE_URL}/health`);
    console.log('✅ Health check:', await health.json());

    // 2. Register
    console.log('\n📝 Test Inscription...');
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
        name: 'Test User'
      })
    });
    const regData = await regRes.json();
    console.log('Res:', regData);
    if (regRes.ok) console.log('✅ Inscription réussie');

    // 3. Login
    console.log('\n🔑 Test Connexion...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!'
      })
    });
    const loginData = await loginRes.json();
    console.log('Res:', loginData);
    if (loginRes.ok) {
      token = loginData.data; // Le token est dans 'data'
      console.log('✅ Connexion réussie, Token reçu');
    }

    // 4. Me (Profile)
    if (token) {
      console.log('\n👤 Test Profil (/me)...');
      const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const meData = await meRes.json();
      console.log('Res:', meData);
      if (meRes.ok) console.log('✅ Récupération profil réussie');
    }

  } catch (error) {
    console.error('❌ Erreur pendant les tests:', error);
  }
}

testAuth();
