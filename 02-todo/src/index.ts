#!/usr/bin/env node

import { Command } from 'commander';
import { CLIHelper } from './cli-helpers.js';
import { AddOptions, ListOptions, UpdateOptions } from './types.js';

const program = new Command();
const cli = new CLIHelper();

program
  .name('todo')
  .description('A simple TODO CLI application')
  .version('1.0.0');

program
  .command('add')
  .description('Add a new todo')
  .argument('<title>', 'Todo title')
  .option('-d, --description <description>', 'Todo description', '')
  .action(async (titleInput: string, options: AddOptions) => {
    const title = cli.validateTitle(titleInput);
    const description = cli.validateDescription(options.description || '');
    
    await cli.executeCommand(async () => {
      const todo = await cli.manager.create(title, description);
      console.log(`✅ Created todo: ${todo.title} (ID: ${todo.id})`);
    });
  });

program
  .command('list')
  .description('List all todos')
  .option('-c, --completed', 'Show only completed todos')
  .option('-p, --pending', 'Show only pending todos')
  .action(async (options: ListOptions) => {
    await cli.executeCommand(async () => {
      let todos = await cli.manager.getAll();
      
      if (options.completed) {
        todos = todos.filter(todo => todo.completed === true);
      } else if (options.pending) {
        todos = todos.filter(todo => todo.completed === false);
      }
      
      if (todos.length === 0) {
        console.log('📭 No todos found.');
        return;
      }
      
      console.log('\n📝 Todos:');
      todos.forEach(todo => {
        const status = todo.completed ? '✅' : '⭕';
        const desc = todo.description ? ` - ${todo.description}` : '';
        console.log(`${status} [${todo.id}] ${todo.title}${desc}`);
      });
    });
  });

program
  .command('complete')
  .description('Mark a todo as completed')
  .argument('<id>', 'Todo ID')
  .action(async (idInput: string) => {
    const id = cli.validateId(idInput);
    
    await cli.executeCommand(async () => {
      const todo = await cli.manager.markCompleted(id);
      console.log(`✅ Completed: ${todo.title}`);
    });
  });

program
  .command('pending')
  .description('Mark a todo as pending')
  .argument('<id>', 'Todo ID')
  .action(async (idInput: string) => {
    const id = cli.validateId(idInput);
    
    await cli.executeCommand(async () => {
      const todo = await cli.manager.markPending(id);
      console.log(`⏳ Marked as pending: ${todo.title}`);
    });
  });

program
  .command('update')
  .description('Update a todo')
  .argument('<id>', 'Todo ID')
  .option('-t, --title <title>', 'New title')
  .option('-d, --description <description>', 'New description')
  .action(async (idInput: string, options: UpdateOptions) => {
    const id = cli.validateId(idInput);
    
    const updates: { title?: string; description?: string } = {};
    
    if (options.title) {
      updates.title = cli.validateTitle(options.title);
    }
    if (options.description !== undefined) {
      updates.description = cli.validateDescription(options.description);
    }
    
    if (Object.keys(updates).length === 0) {
      console.log('⚠️  No updates provided. Use --title or --description.');
      return;
    }
    
    await cli.executeCommand(async () => {
      const todo = await cli.manager.update(id, updates);
      console.log(`✅ Updated: ${todo.title}`);
    });
  });

program
  .command('delete')
  .description('Delete a todo')
  .argument('<id>', 'Todo ID')
  .action(async (idInput: string) => {
    const id = cli.validateId(idInput);
    
    await cli.executeCommand(async () => {
      const todo = await cli.manager.delete(id);
      console.log(`🗑️  Deleted: ${todo.title}`);
    });
  });

program
  .command('show')
  .description('Show details of a specific todo')
  .argument('<id>', 'Todo ID')
  .action(async (idInput: string) => {
    const id = cli.validateId(idInput);
    
    await cli.executeCommand(async () => {
      const todo = await cli.manager.getById(id);
      
      if (!todo) {
        console.log('🔍 Todo not found.');
        return;
      }
      
      const status = todo.completed ? '✅ Completed' : '⏳ Pending';
      const formatDate = (date: Date) => date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      
      console.log('\n📝 Todo Details:');
      console.log(`🏷️  ID: ${todo.id}`);
      console.log(`📜 Title: ${todo.title}`);
      console.log(`📝 Description: ${todo.description || 'None'}`);
      console.log(`🟢 Status: ${status}`);
      console.log(`📅 Created: ${formatDate(todo.createdAt)}`);
      console.log(`🔄 Updated: ${formatDate(todo.updatedAt)}`);
    });
  });

program.parse();