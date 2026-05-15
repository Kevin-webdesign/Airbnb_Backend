import { PrismaPg } from "@prisma/adapter-pg";
import * as PrismaClientModule from "@prisma/client";
declare const prisma: PrismaClientModule.PrismaClient<{
    adapter: PrismaPg;
}, never, import("@prisma/client/runtime/client").DefaultArgs>;
export declare function connectDB(): Promise<void>;
export default prisma;
//# sourceMappingURL=prisma.d.ts.map