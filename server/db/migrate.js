
import { pool } from './pool.js';
import { seedData } from './seedData.js';

async function migrate() {
  try {
    for (const [collection, records] of Object.entries(seedData)) {
      for (const record of records) {
        const id = String(record.id ?? record._id);

        if (id === 'undefined') continue;

        await pool.query(
          `INSERT INTO app_records (collection, record_id, data)
           VALUES ($1, $2, $3::jsonb)
           ON CONFLICT (collection, record_id)
           DO NOTHING`,
          [collection, id, JSON.stringify({ ...record, id })]
        );
      }
    }

    console.log('Seed data migration completed.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
