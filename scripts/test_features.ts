import 'dotenv/config';

const BASE_URL = process.env.PUBLIC_APP_URL || 'http://localhost:3001';

async function testFeatures() {
  console.log('🚀 Démarrage du test des nouvelles fonctionnalités...');

  // 1. Connexion en tant qu'Admin
  console.log('\n🔐 Connexion Admin (admin@afi.com)...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@afi.com', password: 'fadeldev' }),
  });

  if (!adminLoginRes.ok) {
    console.error('❌ Échec connexion Admin:', await adminLoginRes.text());
    return;
  }

  const adminData = await adminLoginRes.json();
  const adminToken = adminData.data.token;
  console.log('✅ Connecté en tant qu\'Admin');

  // 2. Créer une annonce
  console.log('\n📢 Création d\'une annonce...');
  const createAnnRes = await fetch(`${BASE_URL}/api/v1/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
      'x-school-slug': 'afi'
    },
    body: JSON.stringify({
      title: 'Alerte Hackathon 2026',
      description: 'Préparez vos projets pour le hackathon de fin d\'année !',
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
      isActive: true,
    }),
  });

  if (!createAnnRes.ok) {
    console.error('❌ Échec création annonce:', await createAnnRes.text());
  } else {
    const ann = await createAnnRes.json();
    console.log('✅ Annonce créée:', ann.data.title);
  }

  // 3. Connexion en tant qu'Étudiant
  console.log('\n🔐 Connexion Étudiant (petit.etudiant221@gmail.com)...');
  const studentLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'petit.etudiant221@gmail.com', password: 'Passer123@' }),
  });

  if (!studentLoginRes.ok) {
    console.error('❌ Échec connexion Étudiant:', await studentLoginRes.text());
    return;
  }

  const studentData = await studentLoginRes.json();
  const studentToken = studentData.data.token;
  console.log('✅ Connecté en tant qu\'Étudiant');

  // 4. Récupérer l'annonce active (par le student ou public)
  console.log('\n🔍 Récupération de l\'annonce active...');
  const activeAnnRes = await fetch(`${BASE_URL}/api/v1/announcements/active`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${studentToken}`,
      'x-school-slug': 'afi'
    },
  });

  if (!activeAnnRes.ok) {
    console.error('❌ Échec récup annonce active:', await activeAnnRes.text());
  } else {
    const activeAnn = await activeAnnRes.json();
    console.log('✅ Annonce active récupérée:', activeAnn.data?.title || 'Aucune annonce active');
  }

  // 5. Simuler un signalement avec pièces jointes (Mocké car l'upload nécessite un fichier réel)
  console.log('\n📝 Création d\'un signalement avec pièces jointes (Mocké)...');
  const reportRes = await fetch(`${BASE_URL}/api/v1/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`,
      'x-school-slug': 'afi'
    },
    body: JSON.stringify({
      title: 'Fuite d\'eau bloc B',
      content: 'Il y a une fuite importante dans les toilettes du bloc B au 2ème étage.',
      type: 'PROBLEM_MATERIAL',
      priority: 'HIGH',
      attachments: [
        {
          name: 'photo_fuite.jpg',
          url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
          type: 'image/jpeg',
          size: 102456
        },
        {
          name: 'vocal_explication.mp3',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          type: 'audio/mpeg',
          duration: 45
        }
      ]
    }),
  });

  if (!reportRes.ok) {
    console.error('❌ Échec création signalement:', await reportRes.text());
  } else {
    const report = await reportRes.json();
    console.log('✅ Signalement créé avec ID:', report.data.id);
    console.log('📎 Pièces jointes enregistrées:', report.data.attachments?.length || 0);
  }

  console.log('\n✨ Tests terminés !');
}

testFeatures().catch(console.error);
