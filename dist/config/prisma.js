import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env["DATABASE_URL"],
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export async function connectDB() {
    await prisma.$connect();
    console.log("Database connected successfully");
}
export default prisma;
//# sourceMappingURL=prisma.js.map