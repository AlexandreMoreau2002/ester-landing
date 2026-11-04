import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('build configuration', () => {
  it('exposes the default test command with coverage', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

    expect(pkg.scripts.test).toBe('vitest run --coverage');
    expect(pkg.devDependencies.vitest).toBeTruthy();
    expect(pkg.devDependencies['@vitest/coverage-v8']).toBeTruthy();
  });

  it('allows a wider desktop hero heading while preserving the mobile override', () => {
    const css = readFileSync('style.css', 'utf8');
    const desktopHeading = css.match(/^\.hero-heading \{([^}]+)\}/m)?.[1];
    const width = desktopHeading?.match(/max-width:\s*([\d.]+)ch/);

    expect(Number(width?.[1])).toBeGreaterThan(16);
    expect(css).toMatch(/@media \(max-width: 768px\) \{[^]*?\.hero-heading \{ max-width: none; \}/);
  });
});
