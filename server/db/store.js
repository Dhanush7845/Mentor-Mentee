import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { seedData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

class DataStore {
  constructor() {
    this.data = {};
    this.pgPool = null;
    this.isPg = false;
    this.init();
  }

  init() {
    // 1. Load from local cache or seedData first (instant bootstrap)
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = JSON.parse(JSON.stringify(seedData));
        this.saveLocal();
      }
    } catch (err) {
      console.error('Error loading db.json, falling back to seed data:', err.message);
      this.data = JSON.parse(JSON.stringify(seedData));
      this.saveLocal();
    }

    // 2. Connect to Supabase PostgreSQL if DATABASE_URL or SUPABASE_DATABASE_URL is provided
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
    if (dbUrl) {
      this.initPostgres(dbUrl);
    }
  }

  async initPostgres(connectionString) {
    try {
      this.pgPool = new pg.Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
      });

      const client = await this.pgPool.connect();
      console.log('✓ Connected to Supabase PostgreSQL database');

      // Ensure storage table exists in Supabase
      await client.query(`
        CREATE TABLE IF NOT EXISTS mentorconnect_data (
          collection_name VARCHAR(100) PRIMARY KEY,
          records JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Load collections from Supabase
      const res = await client.query('SELECT collection_name, records FROM mentorconnect_data');
      if (res.rows && res.rows.length > 0) {
        res.rows.forEach(row => {
          this.data[row.collection_name] = row.records;
        });
        console.log(`✓ Synchronized ${res.rows.length} collections from Supabase PostgreSQL`);
        this.saveLocal();
      } else {
        // First-time initialization in Supabase: push initial dataset
        console.log('Initializing Supabase database with seed data...');
        for (const [colName, items] of Object.entries(this.data)) {
          await client.query(
            `INSERT INTO mentorconnect_data (collection_name, records, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (collection_name)
             DO UPDATE SET records = $2, updated_at = NOW()`,
            [colName, JSON.stringify(items)]
          );
        }
        console.log('✓ Supabase database seeded successfully');
      }

      client.release();
      this.isPg = true;
    } catch (err) {
      console.error('Notice: Could not connect to Supabase PostgreSQL, operating with local JSON store:', err.message);
    }
  }

  saveLocal() {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save to db.json', err);
    }
  }

  save(collectionName) {
    this.saveLocal();
    if (this.pgPool && collectionName) {
      const records = this.data[collectionName] || [];
      this.pgPool.query(
        `INSERT INTO mentorconnect_data (collection_name, records, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (collection_name)
         DO UPDATE SET records = $2, updated_at = NOW()`,
        [collectionName, JSON.stringify(records)]
      ).catch(err => {
        console.error(`Error saving ${collectionName} to Supabase:`, err.message);
      });
    }
  }

  resetToSeed() {
    this.data = JSON.parse(JSON.stringify(seedData));
    this.saveLocal();
    if (this.pgPool) {
      for (const [colName, items] of Object.entries(this.data)) {
        this.pgPool.query(
          `INSERT INTO mentorconnect_data (collection_name, records, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (collection_name)
           DO UPDATE SET records = $2, updated_at = NOW()`,
          [colName, JSON.stringify(items)]
        ).catch(() => {});
      }
    }
    return this.data;
  }

  collection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
      this.save(name);
    }
    const items = this.data[name];
    const self = this;

    return {
      find(predicate) {
        if (!predicate) return [...items];
        if (typeof predicate === 'function') return items.filter(predicate);
        return items.filter(item => {
          return Object.keys(predicate).every(k => item[k] === predicate[k]);
        });
      },

      findOne(predicate) {
        if (typeof predicate === 'function') return items.find(predicate) || null;
        return items.find(item => {
          return Object.keys(predicate).every(k => item[k] === predicate[k]);
        }) || null;
      },

      findById(id) {
        return items.find(item => String(item.id) === String(id) || String(item._id) === String(id)) || null;
      },

      insert(doc) {
        const newDoc = {
          id: doc.id || ('id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
          createdAt: new Date().toISOString(),
          ...doc
        };
        items.push(newDoc);
        self.save(name);
        return newDoc;
      },

      updateById(id, updates) {
        const idx = items.findIndex(item => String(item.id) === String(id) || String(item._id) === String(id));
        if (idx === -1) return null;
        items[idx] = {
          ...items[idx],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        self.save(name);
        return items[idx];
      },

      deleteById(id) {
        const idx = items.findIndex(item => String(item.id) === String(id) || String(item._id) === String(id));
        if (idx === -1) return false;
        items.splice(idx, 1);
        self.save(name);
        return true;
      },

      count(predicate) {
        if (!predicate) return items.length;
        return this.find(predicate).length;
      }
    };
  }
}

export const db = new DataStore();
