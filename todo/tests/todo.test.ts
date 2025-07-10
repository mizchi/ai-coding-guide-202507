import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Dynamic import for TodoManager to avoid SQLite issues during module loading
let TodoManager: any;

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DB_PATH = join(__dirname, '..', 'test_todos.db');

describe('TodoManager', () => {
  let todoManager: any;

  beforeEach(async () => {
    if (!TodoManager) {
      const module = await import('../src/todo.js');
      TodoManager = module.default;
    }
    todoManager = new TodoManager(TEST_DB_PATH);
    todoManager.initialize();
  });

  afterEach(async () => {
    if (todoManager) {
      todoManager.close();
    }
    try {
      await unlink(TEST_DB_PATH);
    } catch (err) {
      // Ignore if file doesn't exist
    }
  });

  describe('create', () => {
    it('should create a new todo', () => {
      const todo = todoManager.create('Test Todo', 'Test Description');
      
      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe('Test Todo');
      expect(todo.description).toBe('Test Description');
      expect(todo.completed).toBe(0);
      expect(todo.created_at).toBeDefined();
      expect(todo.updated_at).toBeDefined();
    });

    it('should create a todo without description', () => {
      const todo = todoManager.create('Test Todo');
      
      expect(todo.title).toBe('Test Todo');
      expect(todo.description).toBe('');
    });
  });

  describe('getAll', () => {
    it('should return empty array when no todos', () => {
      const todos = todoManager.getAll();
      expect(todos).toEqual([]);
    });

    it('should return all todos', () => {
      todoManager.create('Todo 1');
      todoManager.create('Todo 2');
      
      const todos = todoManager.getAll();
      expect(todos).toHaveLength(2);
      // Check that we have both todos regardless of order
      const titles = todos.map((t: any) => t.title);
      expect(titles).toContain('Todo 1');
      expect(titles).toContain('Todo 2');
    });
  });

  describe('getById', () => {
    it('should return todo by id', () => {
      const createdTodo = todoManager.create('Test Todo');
      const todo = todoManager.getById(createdTodo.id);
      
      expect(todo).toBeDefined();
      expect(todo!.id).toBe(createdTodo.id);
      expect(todo!.title).toBe('Test Todo');
    });

    it('should return undefined for non-existent id', () => {
      const todo = todoManager.getById(999);
      expect(todo).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update todo title', () => {
      const createdTodo = todoManager.create('Original Title');
      const updatedTodo = todoManager.update(createdTodo.id, { title: 'Updated Title' });
      
      expect(updatedTodo.title).toBe('Updated Title');
      expect(updatedTodo.id).toBe(createdTodo.id);
    });

    it('should update todo description', () => {
      const createdTodo = todoManager.create('Title', 'Original Description');
      const updatedTodo = todoManager.update(createdTodo.id, { description: 'Updated Description' });
      
      expect(updatedTodo.description).toBe('Updated Description');
    });

    it('should update todo completion status', () => {
      const createdTodo = todoManager.create('Title');
      const updatedTodo = todoManager.update(createdTodo.id, { completed: true });
      
      expect(updatedTodo.completed).toBe(1);
    });

    it('should throw error when no fields to update', () => {
      const createdTodo = todoManager.create('Title');
      
      expect(() => todoManager.update(createdTodo.id, {})).toThrow('No fields to update');
    });
  });

  describe('delete', () => {
    it('should delete todo', () => {
      const createdTodo = todoManager.create('Test Todo');
      const deletedTodo = todoManager.delete(createdTodo.id);
      
      expect(deletedTodo.id).toBe(createdTodo.id);
      
      const todo = todoManager.getById(createdTodo.id);
      expect(todo).toBeUndefined();
    });

    it('should throw error when todo not found', () => {
      expect(() => todoManager.delete(999)).toThrow('Todo not found');
    });
  });

  describe('markCompleted', () => {
    it('should mark todo as completed', () => {
      const createdTodo = todoManager.create('Test Todo');
      const completedTodo = todoManager.markCompleted(createdTodo.id);
      
      expect(completedTodo.completed).toBe(1);
    });
  });

  describe('markPending', () => {
    it('should mark todo as pending', () => {
      const createdTodo = todoManager.create('Test Todo');
      todoManager.markCompleted(createdTodo.id);
      const pendingTodo = todoManager.markPending(createdTodo.id);
      
      expect(pendingTodo.completed).toBe(0);
    });
  });
});