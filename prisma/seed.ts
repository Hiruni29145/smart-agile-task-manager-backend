import { PrismaClient } from '@prisma/client';
import { seeders } from './seeders';
import type { SeederResult } from './seeders';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    console.log('\n Starting database seeding...\n');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('─'.repeat(50));

    const results: SeederResult[] = [];
    const sortedSeeders = [...seeders].sort((a, b) => a.order - b.order);

    for (const seeder of sortedSeeders) {
        console.log(`\n Running: ${seeder.name}`);

        try {
            if (seeder.shouldRun) {
                const shouldRun = await seeder.shouldRun(prisma);
                if (!shouldRun) {
                    results.push({
                        name: seeder.name,
                        success: true,
                        message: 'Skipped (condition not met)',
                    });
                    continue;
                }
            }
            await seeder.run(prisma);
            results.push({
                name: seeder.name,
                success: true,
                message: 'Completed successfully',
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Error in ${seeder.name}: ${errorMessage}`);

            results.push({
                name: seeder.name,
                success: false,
                message: errorMessage,
            });
            break;
        }
    }

    console.log('\n' + '─'.repeat(50));
    console.log('Seeding Summary:');
    console.log('─'.repeat(50));

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    for (const result of results) {
        const icon = result.success ? 'sucsesss' : 'failed';
        console.log(`  ${icon} ${result.name}: ${result.message}`);
    }

    console.log('─'.repeat(50));
    console.log(`Total: ${results.length} | Success: ${successful} | Failed: ${failed}`);
    console.log('\n Seeding complete!\n');

    if (failed > 0) {
        process.exit(1);
    }
}

(async () => {
    try {
        await main();
    } catch (e) {
        console.error(' Seeding failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
})();
