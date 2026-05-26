import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Seeder } from './seeder.interface';

/**
 * Super Admin Seeder
 * Creates the super admin user from environment variables
 * This seeder will only run if SUPER_ADMIN_EMAIL is set in .env
 */
export const superAdminSeeder: Seeder = {
    name: 'SuperAdminSeeder',
    order: 1, // Run first

    async shouldRun(prisma: PrismaClient): Promise<boolean> {
        const email = process.env.SUPER_ADMIN_EMAIL;

        // Skip if no super admin email configured
        if (!email) {
            console.log('Skipping SuperAdminSeeder: SUPER_ADMIN_EMAIL not set');
            return false;
        }

        // Skip if super admin already exists
        const existing = await prisma.user.findFirst({
            where: { role: UserRole.SUPER_ADMIN },
        });

        if (existing) {
            console.log(`Skipping SuperAdminSeeder: Super admin already exists (${existing.email})`);
            return false;
        }

        return true;
    },

    async run(prisma: PrismaClient): Promise<void> {
        const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@gmail.com';
        const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
        const firstName = process.env.SUPER_ADMIN_FIRST_NAME || 'Super';
        const lastName = process.env.SUPER_ADMIN_LAST_NAME || 'Admin';
        const phone = process.env.SUPER_ADMIN_PHONE || null;

        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Update existing user to super admin
            await prisma.user.update({
                where: { email },
                data: {
                    role: UserRole.SUPER_ADMIN,
                    status: UserStatus.ACTIVE,
                },
            });
            console.log(`Updated existing user to SUPER_ADMIN: ${email}`);
            return;
        }

        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create super admin
        const superAdmin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: UserRole.SUPER_ADMIN,
                status: UserStatus.ACTIVE,
            },
        });

        console.log(`Created SUPER_ADMIN: ${superAdmin.email}`);
    },
};
