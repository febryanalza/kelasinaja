import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialization with logging options
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });
};

// Use existing instance if available, otherwise create new one
const prisma = globalThis.prisma ?? prismaClientSingleton();

// Save reference in development to prevent multiple instances during hot-reload
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;