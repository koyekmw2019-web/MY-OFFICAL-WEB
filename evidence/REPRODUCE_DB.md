# Disposable database reproduction

Install only in a temporary evidence directory, not the website repository:

```sh
npm install --prefix . @electric-sql/pglite@0.5.16
node isolated-migrations.mjs /absolute/path/to/MY-OFFICAL-WEB
```

The script uses a fresh in-memory database with synthetic attempts. It never connects to Netlify.
