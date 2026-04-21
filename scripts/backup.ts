import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Backing up data...');
  
  const tables = [
    'school',
    'systemSettings',
    'campus',
    'academicLevel',
    'class',
    'user',
    'professor',
    'module',
    'classModule',
    'report',
    'evaluation',
    'evaluationCampaign',
    'decision',
    'notification',
    'aiJob'
  ];

  const backupData: any = {};

  for (const table of tables) {
    try {
      backupData[table] = await (prisma as any)[table].findMany();
      console.log(`✅ Backed up ${table}: ${backupData[table]?.length || 0} records`);
    } catch (e: any) {
      console.log(`⚠️ Failed to backup ${table}: ${e.message}`);
    }
  }

  const backupPath = path.join(__dirname, '..', 'backup-pre-seed.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`🎉 Backup saved to ${backupPath}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
