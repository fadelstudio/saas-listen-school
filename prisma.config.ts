import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Utilisé par `prisma migrate deploy` et `prisma db push` UNIQUEMENT.
    // Le trafic applicatif passe par le pg.Pool dans src/core/database/prisma.ts.
    // → On utilise DIRECT_URL (Session Mode, port 5432) pour les migrations,
    //   avec repli sur DATABASE_URL si DIRECT_URL n'est pas défini (dev local).
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
  migrations: {
    seed: "ts-node prisma/seed.ts",
  },
});

