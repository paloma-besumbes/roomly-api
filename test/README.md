# Test scope and commands

- `npm test -- --runInBand`: unit tests and Swagger/HTTP contract tests in `src`.
- `npm run test:e2e -- --runInBand`: HTTP integration tests using real feature
  modules, services, validation, bcrypt, JWT signing, Passport and guards, with
  repository doubles. No database connection or persistent data is used.
- `npm run typecheck`: full-project TypeScript checking, including tests. Jest
  uses ts-jest with the project's isolated-module compilation; passing Jest alone
  is not a substitute for this semantic type check.
- `npm run build`: production build, which excludes test files.

The HTTP suite deliberately does not import `AppModule` (which configures a real
PostgreSQL connection) or `main.ts` (which starts the application). It supplies
test-only configuration, ignores `.env` and process environment lookups, and
overrides all feature-module repositories. It reproduces `main.ts`'s global
prefix, validation pipe, CORS and Swagger setup, and closes the app after testing.
Keep this test setup aligned if the bootstrap configuration changes.

These tests verify HTTP integration, not PostgreSQL persistence. A future suite
with an isolated, disposable database should exercise the real `AppModule`,
TypeORM queries, constraints and persistence behavior. It must not reuse a
production database or a developer's persistent local database.
