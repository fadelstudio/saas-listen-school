import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const API_URL = 'http://localhost:3000/api';

async function testAcademicFlow() {
  console.log('🚀 Starting Academic Flow Validation with Fetch...');

  try {
    // 0. Get context (Campus, Class, Professor, Module)
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    const campus = await prisma.campus.findFirst();
    const cl = await prisma.class.findFirst();
    const prof = await prisma.professor.findFirst();
    const mod = await prisma.module.findFirst();

    if (!campus || !cl || !prof || !mod) {
      console.error('❌ Missing seeded data. Please run seed first.');
      return;
    }

    console.log(`Context: Campus=${campus.name}, Class=${cl.name}, Prof=${prof.firstName}, Module=${mod.name}`);

    // 1. Register a student
    const studentEmail = `student_flow_${Date.now()}@afi.com`;
    console.log('\n📝 1. Registering student...');
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: studentEmail,
        password: 'Password123!',
        firstName: 'Flow',
        lastName: 'Student',
        campusId: campus.id,
        classId: cl.id
      })
    });
    
    const regData = await regRes.json() as any;
    if (!regRes.ok) throw new Error(JSON.stringify(regData));
    
    const token = regData.data.token;
    console.log('✅ Student registered and linked to class');

    // 2. Create a report (Should auto-link to class)
    console.log('\n📝 2. Creating report (auto-linking class)...');
    const reportRes = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        title: 'Academic Flow Test Report',
        content: 'Testing the automatic class linkage in the new backend version.',
        type: 'OTHER'
      })
    });
    
    const reportData = await reportRes.json() as any;
    if (!reportRes.ok) throw new Error(JSON.stringify(reportData));
    
    const report = reportData.data;
    console.log('✅ Report created:', report.id);
    console.log('Linked Class:', report.class?.name || 'NONE');

    if (report.classId !== cl.id) {
       console.error(`❌ Class linkage Mismatch! Expected ${cl.id}, got ${report.classId}`);
    } else {
       console.log('✅ Class linkage is CORRECT');
    }

    // 3. Create an evaluation
    console.log('\n📝 3. Creating evaluation (linked to Prof & Module)...');
    const evalRes = await fetch(`${API_URL}/evaluations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        professorId: prof.id,
        moduleId: mod.id,
        classId: cl.id,
        score: 15,
        comment: 'Excellent module!'
      })
    });
    
    const evalData = await evalRes.json() as any;
    if (!evalRes.ok) throw new Error(JSON.stringify(evalData));
    
    const evaluation = evalData.data;
    console.log('✅ Evaluation created:', evaluation.id);
    console.log('Linked Prof:', evaluation.professor?.firstName || 'NONE');
    console.log('Linked Module:', evaluation.module?.name || 'NONE');

    await prisma.$disconnect();
    console.log('\n✨ Academic Flow Validated Successfully!');

  } catch (error: any) {
    console.error('❌ Error during validation:', error.message);
  }
}

testAcademicFlow();
