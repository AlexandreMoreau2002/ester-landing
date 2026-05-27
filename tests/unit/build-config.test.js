import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('build configuration', () => {
  it('exposes the default test command with coverage', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

    expect(pkg.scripts.test).toBe('vitest run --coverage');
    expect(pkg.devDependencies.vitest).toBeTruthy();
    expect(pkg.devDependencies['@vitest/coverage-v8']).toBeTruthy();
  });
});
