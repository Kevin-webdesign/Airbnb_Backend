import { z } from "zod";
export const createUserSchema = z.object({
    name: z.string().min(4, "Name must be at least 4 characters"),
    email: z.string().email("Invalid email format"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    phone: z.string().min(10, "Invalid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["HOST", "GUEST", "ADMIN"]).default("GUEST"),
});
export const updateUserSchema = createUserSchema.partial();
//# sourceMappingURL=users.validator.js.map