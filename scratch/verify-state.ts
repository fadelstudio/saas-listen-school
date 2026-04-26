import { prisma } from "../src/core/database/prisma";

async function main() {
  console.log("--- VÉRIFICATION DES ÉCOLES ---");
  const schools = await prisma.school.findMany();
  console.table(schools);

  console.log("\n--- VÉRIFICATION DES RÉGLAGES ---");
  const settings = await prisma.systemSettings.findMany();
  console.table(settings);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
