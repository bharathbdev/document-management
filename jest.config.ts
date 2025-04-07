import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
        prefix: '<rootDir>/',
    }),
    collectCoverage: true,
    coverageDirectory: './coverage',
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/main.ts',                    // exclude entry point
        '!src/**/*.module.ts',             // exclude modules if you want
        '!src/**/interfaces/**/*.ts',      // exclude interfaces
        '!src/**/dto/**/*.ts',             // exclude DTOs
        '!src/**/*.spec.ts'                // exclude tests themselves
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
};

