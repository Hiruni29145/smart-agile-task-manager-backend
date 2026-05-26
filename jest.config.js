module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        '**/*.(t|j)s',
        // Exclude test files
        '!**/*.spec.ts',
        '!**/*.test.ts',
        // Exclude bootstrap
        '!main.ts',
        // Exclude module files (just imports)
        '!**/*.module.ts',
        // Exclude index files (re-exports)
        '!**/index.ts',
        // Exclude DTOs (data classes)
        '!**/dto/**',
        // Exclude interfaces
        '!**/interfaces/**',
        // Exclude config (simple exports, tested via integration)
        '!**/config/**',
        // Exclude filters (tested via integration/e2e)
        '!**/filters/**',
        // Exclude interceptors (tested via integration/e2e)
        '!**/interceptors/**',
        // Exclude database module (tested via integration)
        '!**/database/**',
        // Exclude constants (static values)
        '!**/constants/**',
        // Exclude decorators (tested via integration)
        '!**/decorators/**',
        // Exclude enums (static type definitions)
        '!**/enums/**',
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    // Adjusted coverage thresholds for unit tests
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 60,
            functions: 80,
            lines: 80,
        },
    },
};
