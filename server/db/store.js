import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

class DataStore {
  constructor() {
    this.data = {};
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = JSON.parse(JSON.stringify(seedData));
        this.save();
      }
    } catch (err) {
      console.error('Error loading db.json, falling back to seed data', err);
      this.data = JSON.parse(JSON.stringify(seedData));
      this.save();
    }
  }

  save() {
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

  resetToSeed() {
    this.data = JSON.parse(JSON.stringify(seedData));
    this.save();
    return this.data;
  }

  collection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
      this.save();
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
        self.save();
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
        self.save();
        return items[idx];
      },

      deleteById(id) {
        const idx = items.findIndex(item => String(item.id) === String(id) || String(item._id) === String(id));
        if (idx === -1) return false;
        items.splice(idx, 1);
        self.save();
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
