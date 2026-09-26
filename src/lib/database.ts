import Database from 'better-sqlite3';

const dbPath = process.env.DATABASE_URL || './email_logs.db';
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT UNIQUE,
    recipient TEXT NOT NULL,
    name TEXT NOT NULL,
    amount TEXT NOT NULL,
    crypto_type TEXT NOT NULL,
    network TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_status ON email_logs(status);
  CREATE INDEX IF NOT EXISTS idx_reference_id ON email_logs(reference_id);
  CREATE INDEX IF NOT EXISTS idx_created_at ON email_logs(created_at);
`);

export interface EmailLog {
  id?: number;
  message_id?: string;
  recipient: string;
  name: string;
  amount: string;
  crypto_type: string;
  network: string;
  reference_id: string;
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  attempt_count: number;
  max_attempts: number;
  error_message?: string;
  sent_at?: string;
  created_at?: string;
  updated_at?: string;
}

export function insertEmailLog(log: EmailLog): number {
  const stmt = db.prepare(`
    INSERT INTO email_logs (
      recipient, name, amount, crypto_type, network,
      reference_id, status, attempt_count, max_attempts, error_message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    log.recipient,
    log.name,
    log.amount,
    log.crypto_type,
    log.network,
    log.reference_id,
    log.status,
    log.attempt_count,
    log.max_attempts,
    log.error_message || null
  );

  return result.lastInsertRowid as number;
}

export function updateEmailLog(id: number, updates: Partial<EmailLog>): void {
  const valid = Object.entries(updates).filter(([_, value]) => value !== undefined);
  if (!valid.length) return;

  const fields = valid.map(([key]) => `${key} = ?`).join(', ');
  const values = valid.map(([_, value]) => value);

  db.prepare(
    `UPDATE email_logs SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(...values, id);
}

export function getEmailLogByReferenceId(referenceId: string): EmailLog | undefined {
  return db
    .prepare('SELECT * FROM email_logs WHERE reference_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(referenceId) as EmailLog | undefined;
}

export function getFailedEmailLogs(limit = 10): EmailLog[] {
  return db
    .prepare('SELECT * FROM email_logs WHERE status IN (?, ?) ORDER BY created_at DESC LIMIT ?')
    .all('failed', 'retrying', limit) as EmailLog[];
}

export function getAllEmailLogs(limit = 50): EmailLog[] {
  return db
    .prepare('SELECT * FROM email_logs ORDER BY created_at DESC LIMIT ?')
    .all(limit) as EmailLog[];
}

export default db;
