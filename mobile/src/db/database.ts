import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

const SCHEMA = `
${Platform.OS === 'web' ? '' : 'PRAGMA journal_mode = WAL;'}
CREATE TABLE IF NOT EXISTS pets (
  local_id TEXT PRIMARY KEY,
  server_id TEXT,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT 'unknown',
  date_of_birth TEXT,
  photo_uri TEXT,
  photo_url TEXT,
  photo_dirty INTEGER NOT NULL DEFAULT 0,
  microchip_id TEXT NOT NULL DEFAULT '',
  allergies_json TEXT NOT NULL DEFAULT '[]',
  medications_json TEXT NOT NULL DEFAULT '[]',
  emergency_json TEXT NOT NULL DEFAULT '[]',
  sync_status TEXT NOT NULL DEFAULT 'pending',
  sync_error TEXT,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS vaccinations (
  local_id TEXT PRIMARY KEY,
  server_id TEXT,
  pet_local_id TEXT NOT NULL,
  vaccine_name TEXT NOT NULL,
  administration_date TEXT NOT NULL,
  next_due_date TEXT NOT NULL,
  veterinarian TEXT NOT NULL DEFAULT '',
  clinic TEXT NOT NULL DEFAULT '',
  batch_number TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  sync_status TEXT NOT NULL DEFAULT 'pending',
  sync_error TEXT,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS weights (
  local_id TEXT PRIMARY KEY,
  server_id TEXT,
  pet_local_id TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  recorded_at TEXT NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  sync_error TEXT,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS appointments (
  local_id TEXT PRIMARY KEY,
  server_id TEXT,
  pet_local_id TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  clinic_address TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'scheduled',
  sync_status TEXT NOT NULL DEFAULT 'pending',
  sync_error TEXT,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS documents (
  local_id TEXT PRIMARY KEY,
  server_id TEXT,
  pet_local_id TEXT NOT NULL,
  category TEXT NOT NULL,
  local_uri TEXT,
  file_url TEXT,
  original_name TEXT NOT NULL DEFAULT '',
  mime_type TEXT NOT NULL DEFAULT '',
  sync_status TEXT NOT NULL DEFAULT 'pending',
  sync_error TEXT,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
`;

function isFileLock(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('Access Handle') || message.includes('createSyncAccessHandle');
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const db = await SQLite.openDatabaseAsync('pawprint.db');
      await db.execAsync(SCHEMA);
      return db;
    } catch (error) {
      lastError = error;
      if (!isFileLock(error) || attempt === 2) break;
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  throw lastError;
}

export async function getDb() {
  if (!databasePromise) {
    databasePromise = openDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

export async function clearAllRecords() {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM documents;
    DELETE FROM appointments;
    DELETE FROM weights;
    DELETE FROM vaccinations;
    DELETE FROM pets;
  `);
}
