import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: "ts-node prisma/seed.ts",
  },
});
