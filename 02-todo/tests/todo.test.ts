import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

// Dynamic import for TodoManager to avoid SQLite issues during module loading
let TodoManager: any;

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DB_PATH = join(__dirname, '..', 'prisma', 'test.db');

describe('TodoManager', () => {
  let todoManager: any;
  let prisma: PrismaClient;

  beforeEach(async () => {
    if (!TodoManager) {
      const module = await import('../src/todo.js');
      TodoManager = module.default;
    }
    
    // Use separate test database
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${TEST_DB_PATH}`
        }
      }
    });
    
    // Create test schema matching Prisma schema
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Clear any existing data
    await prisma.$executeRawUnsafe('DELETE FROM todos');
    
    todoManager = new TodoManager(prisma); // Inject test client
    await todoManager.initialize();
  });

  afterEach(async () => {
    if (todoManager) {
      await todoManager.close();
    }
    if (prisma) {
      await prisma.$disconnect();
    }
    try {
      await unlink(TEST_DB_PATH);
    } catch (err) {
      // Ignore if file doesn't exist
    }
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const todo = await todoManager.create('Test Todo', 'Test Description');
      
      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe('Test Todo');
      expect(todo.description).toBe('Test Description');
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
    });

    it('should create a todo without description', async () => {
      const todo = await todoManager.create('Test Todo');
      
      expect(todo.title).toBe('Test Todo');
      expect(todo.description).toBe(null);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no todos', async () => {
      const todos = await todoManager.getAll();
      expect(todos).toEqual([]);
    });

    it('should return all todos', async () => {
      await todoManager.create('Todo 1');
      await todoManager.create('Todo 2');
      
      const todos = await todoManager.getAll();
      expect(todos).toHaveLength(2);
      // Check that we have both todos regardless of order
      const titles = todos.map((t: any) => t.title);
      expect(titles).toContain('Todo 1');
      expect(titles).toContain('Todo 2');
    });
  });

  describe('getById', () => {
    it('should return todo by id', async () => {
      const createdTodo = await todoManager.create('Test Todo');
      const todo = await todoManager.getById(createdTodo.id);
      
      expect(todo).toBeDefined();
      expect(todo!.id).toBe(createdTodo.id);
      expect(todo!.title).toBe('Test Todo');
    });

    it('should return null for non-existent id', async () => {
      const todo = await todoManager.getById(999);
      expect(todo).toBeNull();
    });
  });

  describe('update', () => {
    it('should update todo title', async () => {
      const createdTodo = await todoManager.create('Original Title');
      const updatedTodo = await todoManager.update(createdTodo.id, { title: 'Updated Title' });
      
      expect(updatedTodo.title).toBe('Updated Title');
      expect(updatedTodo.id).toBe(createdTodo.id);
    });

    it('should update todo description', async () => {
      const createdTodo = await todoManager.create('Title', 'Original Description');
      const updatedTodo = await todoManager.update(createdTodo.id, { description: 'Updated Description' });
      
      expect(updatedTodo.description).toBe('Updated Description');
    });

    it('should update todo completion status', async () => {
      const createdTodo = await todoManager.create('Title');
      const updatedTodo = await todoManager.update(createdTodo.id, { completed: true });
      
      expect(updatedTodo.completed).toBe(true);
    });

    it('should throw error when no fields to update', async () => {
      const createdTodo = await todoManager.create('Title');
      
      await expect(todoManager.update(createdTodo.id, {})).rejects.toThrow('No fields to update');
    });
  });

  describe('delete', () => {
    it('should delete todo', async () => {
      const createdTodo = await todoManager.create('Test Todo');
      const deletedTodo = await todoManager.delete(createdTodo.id);
      
      expect(deletedTodo.id).toBe(createdTodo.id);
      
      const todo = await todoManager.getById(createdTodo.id);
      expect(todo).toBeNull();
    });

    it('should throw error when todo not found', async () => {
      await expect(todoManager.delete(999)).rejects.toThrow('Todo not found');
    });
  });

  describe('markCompleted', () => {
    it('should mark todo as completed', async () => {
      const createdTodo = await todoManager.create('Test Todo');
      const completedTodo = await todoManager.markCompleted(createdTodo.id);
      
      expect(completedTodo.completed).toBe(true);
    });
  });

  describe('markPending', () => {
    it('should mark todo as pending', async () => {
      const createdTodo = await todoManager.create('Test Todo');
      await todoManager.markCompleted(createdTodo.id);
      const pendingTodo = await todoManager.markPending(createdTodo.id);
      
      expect(pendingTodo.completed).toBe(false);
    });
  });
});