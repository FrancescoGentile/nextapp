import type { Config } from '@jest/types';

// Or async function
export default async (): Promise<Config.InitialOptions> => ({
  preset: 'ts-jest',
  roots: ['./tests'],
  setupFiles: ['./.jest/setenv.ts'],
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'src',
  coverageReporters: ['json-summary'],
  testTimeout: 10000,
  silent: false,
});
