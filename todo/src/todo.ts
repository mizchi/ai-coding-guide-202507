import Database from './database.js';

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}

export class TodoManager {
  private db: Database;

  constructor(dbPath?: string) {
    this.db = new Database(dbPath);
  }

  initialize(): void {
    this.db.initialize();
  }

  create(title: string, description: string = ''): Todo {
    const result = this.db.run(
      'INSERT INTO todos (title, description) VALUES (?, ?)',
      [title, description]
    );
    return this.getById(result.lastInsertRowid as number)!;
  }

  getAll(): Todo[] {
    return this.db.all('SELECT * FROM todos ORDER BY created_at DESC');
  }

  getById(id: number): Todo | undefined {
    return this.db.get('SELECT * FROM todos WHERE id = ?', [id]);
  }

  update(id: number, updates: TodoUpdate): Todo {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    
    if (updates.completed !== undefined) {
      fields.push('completed = ?');
      values.push(updates.completed ? 1 : 0);
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    this.db.run(
      `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.getById(id)!;
  }

  delete(id: number): Todo {
    const todo = this.getById(id);
    if (!todo) {
      throw new Error('Todo not found');
    }
    
    this.db.run('DELETE FROM todos WHERE id = ?', [id]);
    return todo;
  }

  markCompleted(id: number): Todo {
    return this.update(id, { completed: true });
  }

  markPending(id: number): Todo {
    return this.update(id, { completed: false });
  }

  close(): void {
    this.db.close();
  }
}

export default TodoManager;