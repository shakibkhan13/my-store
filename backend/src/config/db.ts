// import { PrismaClient } from "@prisma/client";
// // import PrismaClient from "@prisma/client"
// import { PrismaPg } from "@prisma/adapter-pg";
// import "dotenv/config";

// const connectionString = process.env.DATABASE_URL;

// if (!connectionString) {
//   throw new Error("DATABASE_URL is not defined");
// }

// const adapter = new PrismaPg({
//   connectionString,
// });

// const prisma = new PrismaClient({
//   adapter,
// });

// export const connectDB = async (): Promise<void> => {
//   try {
//     await prisma.$connect();

//     console.log(`PostgreSQL Database connected successfully.`);
//   } catch (error) {
//     console.error(`database connection failed, ${error}`);

//     process.exit(1);
//   }
// };

// export const disconnectDB = async (): Promise<void> => {
//   await prisma.$disconnect();

//   console.log(`postgreSql Disconnected`);
// };

// export default prisma;

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

// Use a type assertion to avoid TypeScript error if adapter is not recognized
const prisma = new PrismaClient({
  adapter: adapter,
} as any); // Or cast: as Parameters<typeof PrismaClient>[0]

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log(`PostgreSQL Database connected successfully.`);
  } catch (error) {
    console.error(`database connection failed, ${error}`);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log(`postgreSql Disconnected`);
};

export default prisma;