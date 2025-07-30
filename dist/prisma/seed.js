"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.user.createMany({
        data: [
            { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
            { firstName: 'Bob', lastName: 'Brown', email: 'bob@example.com' }
        ]
    });
}
main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(() => prisma.$disconnect());
