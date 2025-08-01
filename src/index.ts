import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';

const fastify = Fastify();
const prisma = new PrismaClient();

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
  const body = request.body as {
    userId: number;
    field: 'firstName' | 'lastName' | 'email';
    newValue: string;
    requestedBy: string;
  };

  const user = await prisma.user.findUnique({ where: { id: body.userId } });
  if (!user) return reply.code(404).send({ error: 'User not found' });

  const oldValue = user[body.field];
  if (oldValue === body.newValue) return reply.send({ message: 'No change' });

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

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

fastify.listen({ port: PORT, host: HOST }, (err) => {
  if (err) throw err;
  console.log(`Server is running on http://${HOST}:${PORT}`);
});