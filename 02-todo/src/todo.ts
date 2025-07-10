import { PrismaClient, Todo, Prisma } from '@prisma/client';
import { TodoUpdateInput } from './types.js';

export { TodoUpdateInput };

export class TodoManager {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  async initialize(): Promise<void> {
    await this.prisma.$connect();
  }

  async create(title: string, description: string = ''): Promise<Todo> {
    return await this.prisma.todo.create({
      data: {
        title,
        description: description || null,
      },
    });
  }

  async getAll(): Promise<Todo[]> {
    return await this.prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getById(id: number): Promise<Todo | null> {
    return await this.prisma.todo.findUnique({
      where: { id },
    });
  }

  async update(id: number, updates: TodoUpdateInput): Promise<Todo> {
    const updateData: Prisma.TodoUpdateInput = {};
    
    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }
    
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    
    if (updates.completed !== undefined) {
      updateData.completed = updates.completed;
    }
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }
    
    try {
      return await this.prisma.todo.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('Todo not found');
      }
      throw error;
    }
  }

  async delete(id: number): Promise<Todo> {
    try {
      return await this.prisma.todo.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('Todo not found');
      }
      throw error;
    }
  }

  async markCompleted(id: number): Promise<Todo> {
    return await this.update(id, { completed: true });
  }

  async markPending(id: number): Promise<Todo> {
    return await this.update(id, { completed: false });
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export default TodoManager;