import TodoManager from './todo.js';

export class CLIHelper {
  private todoManager: TodoManager;

  constructor() {
    this.todoManager = new TodoManager();
  }

  async executeCommand<T>(command: () => Promise<T>): Promise<T> {
    try {
      await this.todoManager.initialize();
      return await command();
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      await this.todoManager.close();
    }
  }

  private handleError(error: unknown): void {
    if (error instanceof Error) {
      if (error.message === 'Todo not found') {
        console.error('❌ Todo not found. Please check the ID and try again.');
      } else if (error.message === 'No fields to update') {
        console.error('❌ No updates provided. Use --title or --description to specify what to update.');
      } else {
        console.error(`❌ Error: ${error.message}`);
      }
    } else {
      console.error('❌ An unexpected error occurred');
    }
    process.exit(1);
  }

  validateId(idString: string): number {
    const id = parseInt(idString, 10);
    if (isNaN(id) || id <= 0) {
      console.error('❌ Invalid ID. Please provide a positive number.');
      process.exit(1);
    }
    return id;
  }

  validateTitle(title: string): string {
    if (!title || title.trim().length === 0) {
      console.error('❌ Title cannot be empty.');
      process.exit(1);
    }
    if (title.length > 255) {
      console.error('❌ Title is too long. Maximum 255 characters.');
      process.exit(1);
    }
    return title.trim();
  }

  validateDescription(description: string): string {
    if (description && description.length > 1000) {
      console.error('❌ Description is too long. Maximum 1000 characters.');
      process.exit(1);
    }
    return description ? description.trim() : '';
  }

  get manager(): TodoManager {
    return this.todoManager;
  }
}