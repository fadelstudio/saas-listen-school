import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const campus = await prisma.campus.findFirst();
  const cl = await prisma.class.findFirst();

  console.log(JSON.stringify({
    campusId: campus?.id,
    classId: cl?.id
  }, null, 2));

  await prisma.$disconnect();
}

main();
