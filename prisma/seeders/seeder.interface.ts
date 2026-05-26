import { PrismaClient } from '@prisma/client';

/**
 * Base interface for all seeders
 * Each seeder must implement this interface
 */
export interface Seeder {
    /** Name of the seeder for logging */
    name: string;

    /** Order of execution (lower = first) */
    order: number;

    /** Run the seeder */
    run(prisma: PrismaClient): Promise<void>;

    /** Optional: Check if seeder should run */
    shouldRun?(prisma: PrismaClient): Promise<boolean>;
}

/**
 * Seeder result for reporting
 */
export interface SeederResult {
    name: string;
    success: boolean;
    message: string;
    recordsCreated?: number;
}
