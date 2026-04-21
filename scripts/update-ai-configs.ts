import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const DEFAULT_SCHOOL_ID = 'afi-default-school';
  const groqKey = process.env.GROQ_API_KEY || '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';
  const geminiKey = process.env.GEMINI_API_KEY || 'dummy';

  console.log('Update AI configs for school...');

  await prisma.systemSettings.upsert({
    where: { schoolId: DEFAULT_SCHOOL_ID },
    update: {
      aiEnabled: true,
      aiConfigs: [
        { id: 'config-gemini', name: 'Gemini Pro', provider: 'GEMINI', model: 'gemini-pro', apiKey: geminiKey, priority: 1, isFree: false },
        { id: 'config-groq', name: 'Groq Llama', provider: 'GROQ', model: 'llama-3.3-70b-versatile', apiKey: groqKey, priority: 2, isFree: false }
      ]
    },
    create: {
      schoolId: DEFAULT_SCHOOL_ID,
      schoolName: "AFI L'UE",
      aiEnabled: true,
      aiConfigs: [
        { id: 'config-gemini', name: 'Gemini Pro', provider: 'GEMINI', model: 'gemini-pro', apiKey: geminiKey, priority: 1, isFree: false },
        { id: 'config-groq', name: 'Groq Llama', provider: 'GROQ', model: 'llama-3.3-70b-versatile', apiKey: groqKey, priority: 2, isFree: false }
      ]
    }
  });

  console.log('✅ AI configs updated!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
