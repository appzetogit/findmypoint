# Workspace Rules for FindmyPoint

- **Database Preservation**: DO NOT delete database collections or individual documents automatically, nor in seed/migration scripts.
- **Wiping Data**: Operations such as `.deleteMany({})`, `.dropDatabase()`, or delete queries without filters are strictly forbidden unless the user explicitly requests a database wipe or deletion.
- **Seeding/Migrations**: Always check for the existence of documents first, or use safe update/upsert operations to avoid overwriting or causing duplicate key issues on pre-existing data.
