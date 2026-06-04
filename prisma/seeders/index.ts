/**
 * Seeders Index
 * Register all your seeders here in the order they should run
 *
 * To add a new seeder:
 * 1. Create a new file in prisma/seeders/ (e.g., my-data.seeder.ts)
 * 2. Implement the Seeder interface
 * 3. Import and add it to the seeders array below
 */

import { Seeder } from './seeder.interface';
import { superAdminSeeder } from './super-admin.seeder';

/**
 * All registered seeders
 * They will be sorted by order and executed sequentially
 */
export const seeders: Seeder[] = [
    superAdminSeeder,
    // Add more seeders here as needed:
];

export type { Seeder, SeederResult } from './seeder.interface';
