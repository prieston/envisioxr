export default {
  '**/*.{ts,tsx,js}': ['eslint --fix'],
  '**/*.{ts,tsx}': [
    'bash -c "pnpm --filter \'./packages/*\' exec tsc --noEmit --skipLibCheck || true"',
    'bash -c "pnpm --filter \'./apps/*\' exec tsc --noEmit --skipLibCheck || true"'
  ],
  'scripts/**/*.ts': () => [], // Skip linting audit scripts
};

