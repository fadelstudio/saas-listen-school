import axios from 'axios';

/**
 * SCÉNARIO DE TEST GLOBAL : AFI-LISTEN
 * Ce script valide chaque module de l'architecture backend.
 */

const API_URL = 'http://localhost:3000/api/v1';

async function runScenario() {
  console.log('🚀 Démarrage du scénario de test GLOBAL...');

  try {
    // 1. LOGIN (Admin)
    console.log('\n[1] Connexion Admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@afi.com',
      password: 'fadeldev'
    });
    const token = loginRes.data.data.token;
    console.log('✅ Connecté en tant qu\'Admin');
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 2. TEST RÉFÉRENTIELS & CAPTURE IDs
    console.log('\n[2] Validation des référentiels...');
    const refs = ['campuses', 'levels', 'classes', 'professors', 'academic-modules'];
    const store: Record<string, string> = {};

    for (const ref of refs) {
      const res = await axios.get(`${API_URL}/${ref}`, authHeaders);
      const items = res.data.data;
      console.log(`✅ ${ref}: ${items.length} éléments`);
      
      // Stockage pour usage ultérieur
      if (ref === 'classes' && items.length > 0) store.classId = items[0].id;
      if (ref === 'professors' && items.length > 0) store.profId = items[0].id;
      if (ref === 'academic-modules' && items.length > 0) store.modId = items[0].id;
    }

    if (!store.classId || !store.profId || !store.modId) {
      throw new Error('Données manquantes pour continuer le test (Vérifiez le seed)');
    }

    // 3. CAMPAGNE D'ÉVALUATION
    console.log('\n[3] Campagnes d\'évaluation...');
    await axios.post(`${API_URL}/evaluation-campaigns`, {
      title: 'Global Test Campaign',
      description: 'Validation automatisée',
      classId: store.classId,
      moduleId: store.modId,
      professorId: store.profId
    }, authHeaders);
    console.log('✅ Campagne créée');

    // 4. SIGNALEMENTS IA
    console.log('\n[4] Signalements & IA...');
    const reportRes = await axios.post(`${API_URL}/reports`, {
      title: 'Besoin de maintenance',
      content: 'Ce signalement teste l\'automatisation des jobs IA via BullMQ.',
      type: 'PROBLEM_MATERIAL',
      isAnonymous: true,
      deviceMetadata: { ip: '127.0.0.1', device: 'Scenario-Runner' }
    });
    console.log(`✅ Signalement anonyme créé (ID: ${reportRes.data.data.id})`);

    // 5. NOTIFICATIONS ÉTUDIANT
    console.log('\n[5] Notifications étudiant...');
    const stuLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'student1@afi.com',
      password: 'Student@123'
    });
    const stuToken = stuLogin.data.data.token;
    const stuHeaders = { headers: { Authorization: `Bearer ${stuToken}` } };
    
    const notifRes = await axios.get(`${API_URL}/notifications`, stuHeaders);
    console.log(`✅ Notifications: ${notifRes.data.data.length} récupérées`);

    // 6. SaaS & SYSTEM
    console.log('\n[6] SaaS & Paramètres Système...');
    const superLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'superadmin@saas.com',
      password: 'fadeldev'
    });
    const superHeaders = { headers: { Authorization: `Bearer ${superLogin.data.data.token}` } };
    
    const systRes = await axios.get(`${API_URL}/system`, superHeaders);
    console.log(`✅ Paramètres système ok: ${systRes.data.data.schoolName}`);

    console.log('\n✨ AUDIT GLOBAL TERMINÉ : TOUT EST FONCTIONNEL ✨');

  } catch (error: any) {
    const errorData = error.response?.data;
    console.error('\n❌ ÉCHEC DU TEST GLOBAL:', JSON.stringify(errorData || error.message, null, 2));
    process.exit(1);
  }
}

runScenario();
