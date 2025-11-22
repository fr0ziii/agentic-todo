import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export interface Todo {
    id: number;
    title: string;
    project: string;
    status: 'active' | 'completed' | 'archived';
    priority: 'urgent' | 'high' | 'medium' | 'low';
    created_at: number;
    completed_at: number | null;
}

export class TodoEngine {
    private static instance: TodoEngine | null = null;
    private db: Database.Database;

    constructor(dbPath: string = './data/todos.db') {
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        this.db = new Database(dbPath);
        this.seed();
    }

    seed() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        project TEXT DEFAULT 'Inbox',
        status TEXT CHECK(status IN ('active', 'completed', 'archived')) DEFAULT 'active',
        priority TEXT CHECK(priority IN ('urgent', 'high', 'medium', 'low')) DEFAULT 'medium',
        created_at INTEGER DEFAULT (unixepoch()),
        completed_at INTEGER
      )
    `);
    }

    sql(query: string, ...params: any[]): any {
        const stmt = this.db.prepare(query);
        if (query.trim().toLowerCase().startsWith('select')) {
            return stmt.all(...params);
        } else {
            return stmt.run(...params);
        }
    }

    getSmartList(): Todo[] {
        // Sort by Priority (Urgent -> Low) then by Age (Oldest -> Newest)
        // Urgent > High > Medium > Low
        const query = `
      SELECT * FROM todos
      WHERE status = 'active'
      ORDER BY 
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END ASC,
        created_at ASC
    `;
        return this.db.prepare(query).all() as Todo[];
    }

    /**
     * Get singleton instance of TodoEngine.
     * Ensures only one database connection is used across all tool calls.
     */
    static getInstance(dbPath: string = './data/todos.db'): TodoEngine {
        if (!TodoEngine.instance) {
            TodoEngine.instance = new TodoEngine(dbPath);
        }
        return TodoEngine.instance;
    }

    /**
     * Close the database connection.
     * Useful for graceful shutdown.
     */
    close(): void {
        this.db.close();
        TodoEngine.instance = null;
    }
}
