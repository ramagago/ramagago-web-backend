import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const password1 = await bcrypt.hash('1234', salt); // Reemplaza con la contraseña deseada
  const password2 = await bcrypt.hash('1234', salt); // Reemplaza con la contraseña deseada

  await prisma.user.upsert({
    where: { username: 'rama' },
    update: {},
    create: {
      username: 'rama',
      password: password1,
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { username: 'katy' },
    update: {},
    create: {
      username: 'katy',
      password: password2,
      role: 'admin',
    },
  });

  console.log('Admin users initialized');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
