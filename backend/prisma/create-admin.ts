import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * No hay ningún flujo de la app que cree administradores (es un rol que
 * hoy solo se asigna a mano). Uso: desde backend/
 *   npx ts-node prisma/create-admin.ts <email> <password> <nombre> <apellido>
 */
async function main(): Promise<void> {
  const [email, password, nombre, apellido] = process.argv.slice(2);
  if (!email || !password || !nombre || !apellido) {
    console.error(
      'Uso: npx ts-node prisma/create-admin.ts <email> <password> <nombre> <apellido>',
    );
    process.exitCode = 1;
    return;
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const emailNormalizado = email.trim().toLowerCase();
  const existente = await prisma.usuarios.findFirst({
    where: { email: { equals: emailNormalizado, mode: 'insensitive' } },
  });
  if (existente) {
    console.error(`Ya existe un usuario con el email ${emailNormalizado}`);
    process.exitCode = 1;
    await prisma.$disconnect();
    return;
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuarios.create({
      data: { email: emailNormalizado, password_hash, activo: true },
    });
    await tx.administradores.create({
      data: { id_usuario: usuario.id_usuario, nombre, apellido },
    });
  });

  console.log(`Administrador creado: ${emailNormalizado}`);
  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
