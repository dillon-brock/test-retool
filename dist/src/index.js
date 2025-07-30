"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const client_1 = require("@prisma/client");
const fastify = (0, fastify_1.default)();
const prisma = new client_1.PrismaClient();
// GET /users - return all users
fastify.get('/users', async (_request, reply) => {
    const users = await prisma.user.findMany();
    return reply.send(users);
});
// GET /change-history - return all change history records with user info
fastify.get('/change-history', async (_request, reply) => {
    const history = await prisma.changeHistory.findMany({
        orderBy: { timestamp: 'desc' },
        include: { User: true },
    });
    return reply.send(history);
});
// POST /update-user - update a user and log the change
fastify.post('/update-user', async (request, reply) => {
    const body = request.body;
    const user = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!user)
        return reply.code(404).send({ error: 'User not found' });
    const oldValue = user[body.field];
    if (oldValue === body.newValue)
        return reply.send({ message: 'No change' });
    const updatedUser = await prisma.user.update({
        where: { id: body.userId },
        data: { [body.field]: body.newValue },
    });
    await prisma.changeHistory.create({
        data: {
            userId: body.userId,
            field: body.field,
            oldValue: String(oldValue),
            newValue: body.newValue,
            requestedBy: body.requestedBy,
        },
    });
    return { updatedUser };
});
// Start the Fastify server
fastify.listen({ port: 3000 }, (err) => {
    if (err)
        throw err;
    console.log('Server is running on http://localhost:3000');
});
