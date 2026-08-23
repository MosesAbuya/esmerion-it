import dotenv from "dotenv";
dotenv.config();
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_l45aCcbZFAqu@ep-plain-frost-b2dxi9ds-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});
