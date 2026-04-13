"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const API_URL = 'http://localhost:3000/api';
function isApiResponse(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'success' in value &&
        'message' in value &&
        'data' in value);
}
async function testAcademicApis() {
    console.log('🚀 Testing New Academic APIs...');
    const performFetch = async (url, options) => {
        const res = await fetch(url, options);
        const data = (await res.json());
        if (!res.ok) {
            throw new Error(`API Error [${res.status}] at ${url}: ${JSON.stringify(data)}`);
        }
        if (!isApiResponse(data)) {
            throw new Error(`Unexpected API response shape at ${url}: ${JSON.stringify(data)}`);
        }
        return data;
    };
    try {
        console.log('\n📝 Logging in as Admin to test APIs...');
        const loginData = await performFetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@afi.com',
                password: 'fadeldev'
            })
        });
        const token = loginData.data.token;
        const headers = { 'Authorization': `Bearer ${token}` };
        // 2. Test Campuses
        console.log('\n🏥 Testing /campuses...');
        const campData = await performFetch(`${API_URL}/campuses`, { headers });
        console.log(`Found ${campData.data.items.length} campuses`);
        // 3. Test Classes
        console.log('\n🏫 Testing /classes...');
        const classData = await performFetch(`${API_URL}/classes`, { headers });
        console.log(`Found ${classData.data.items.length} classes`);
        // 4. Test Professors
        console.log('\n👨‍🏫 Testing /professors...');
        const profData = await performFetch(`${API_URL}/professors`, { headers });
        console.log(`Found ${profData.data.items.length} professors`);
        // 5. Test Academic Modules
        console.log('\n📚 Testing /academic-modules...');
        const modData = await performFetch(`${API_URL}/academic-modules`, { headers });
        console.log(`Found ${modData.data.items.length} modules`);
        console.log('\n✨ All Academic APIs are WORKING!');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('❌ Error during API testing:', message);
    }
}
testAcademicApis();
//# sourceMappingURL=test-academic-apis.js.map