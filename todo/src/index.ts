#!/usr/bin/env node

import { Command } from 'commander';
import TodoManager from './todo.js';

const program = new Command();
const todoManager = new TodoManager();

program
  .name('todo')
  .description('A simple TODO CLI application')
  .version('1.0.0');

program
  .command('add')
  .description('Add a new todo')
  .argument('<title>', 'Todo title')
  .option('-d, --description <description>', 'Todo description', '')
  .action((title, options) => {
    try {
      todoManager.initialize();
      const todo = todoManager.create(title, options.description);
      console.log(`✓ Created todo: ${todo.title} (ID: ${todo.id})`);
    } catch (error) {
      console.error('Error creating todo:', error);
      process.exit(1);
    } finally {
      todoManager.close();
    }
  });

program
  .command('list')
  .description('List all todos')
  .option('-c, --completed', 'Show only completed todos')
  .option('-p, --pending', 'Show only pending todos')
  .action((options) => {
    try {
      todoManager.initialize();
      let todos = todoManager.getAll();
      
      if (options.completed) {
        todos = todos.filter(todo => todo.completed === 1);
      } else if (options.pending) {
        todos = todos.filter(todo => todo.completed === 0);
      }
      
      if (todos.length === 0) {
        console.log('No todos found.');
        return;
      }
      
      console.log('\nTodos:');
      todos.forEach(todo => {
        const status = todo.completed ? '✓' : '○';
        const desc = todo.description ? ` - ${todo.description}` : '';
        console.log(`${status} [${todo.id}] ${todo.title}${desc}`);
      });
    } catch (error) {
      console.error('Error listing todos:', error);
      process.exit(1);
    } finally {
      todoManager.close();
    }
  });

program
  .command('complete')
  .description('Mark a todo as completed')
  .argument('<id>', 'Todo ID')
  .action((id) => {
    try {
      todoManager.initialize();
      const todo = todoManager.markCompleted(parseInt(id));
      console.log(`✓ Completed: ${todo.title}`);
    } catch (error) {
      console.error('Error completing todo:', error);
      process.exit(1);
    } finally {
      todoManager.close();
    }
  });

program
  .command('pending')
  .description('Mark a todo as pending')
  .argument('<id>', 'Todo ID')
  .action((id) => {
    try {
      todoManager.initialize();
      const todo = todoManager.markPending(parseInt(id));
      console.log(`○ Marked as pending: ${todo.title}`);
    } catch (error) {
      console.error('Error marking todo as pending:', error);
      process.exit(1);
    } finally {
      todoManager.close();
    }
  });

program
  .command('update')
  .description('Update a todo')
  .argument('<id>', 'Todo ID')
  .option('-t, --title <title>', 'New title')
  .option('-d, --description <description>', 'New description')
  .action((id, options) => {
    try {
      todoManager.initialize();
      const updates: any = {};
      
      if (options.title) updates.title = options.title;
      if (options.description) updates.description = options.description;
      
      if (Object.keys(updates).length === 0) {
        console.log('No updates provided. Use --title or --description.');
        return;
      }
      
      const todo = todoManager.update(parseInt(id), updates);
      console.log(`✓ Updated: ${todo.title}`);
    } catch (error) {
      console.error('Error updating todo:', error);
      process.exit(1);
    } finally {
      todoManager.close();
    }
  });

program
  .command('delete')
  .description('Delete a todo')
  .argument('<id>', 'Todo ID')
  .action((id) => {
    try {
      todoManager.initialize();
      const todo = todoManager.delete(parseInt(id));
      console.log(`✓ Deleted: ${todo.title}`);
    } catch (error) {
      console.error('Error deleting todo:', error);
      process.exit(1);
    } finally {
      todoManager.close();
    }
  });

program
  .command('show')
  .description('Show details of a specific todo')
  .argument('<id>', 'Todo ID')
  .action((id) => {
    try {
      todoManager.initialize();
      const todo = todoManager.getById(parseInt(id));
      
      if (!todo) {
        console.log('Todo not found.');
        return;
      }
      
      console.log('\nTodo Details:');
      console.log(`ID: ${todo.id}`);
      console.log(`Title: ${todo.title}`);
      console.log(`Description: ${todo.description || 'None'}`);
      console.log(`Status: ${todo.completed ? 'Completed' : 'Pending'}`);
      console.log(`Created: ${todo.created_at}`);
      console.log(`Updated: ${todo.updated_at}`);
    } catch (error) {
      console.error('Error showing todo:', error);
      process.exit(1);
    } finally {
      todoManager.close();
    }
  });

program.parse();