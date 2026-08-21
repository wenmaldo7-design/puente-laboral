import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function main(): Promise<void> {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  // Contraseña común
  const password = 'password123';
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // Beneficiario
  const emailBeneficiario = 'beneficiario@puentelaboral.com';
  let usrBen = await prisma.usuarios.findFirst({ where: { email: emailBeneficiario } });
  if (!usrBen) {
    await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuarios.create({
        data: { email: emailBeneficiario, password_hash, activo: true },
      });
      await tx.beneficiarios.create({
        data: {
          id_usuario: usuario.id_usuario,
          nombre: 'Juan',
          apellido: 'Perez',
          dni: '12345678',
        },
      });
    });
    console.log(`Beneficiario creado: ${emailBeneficiario}`);
  } else {
    console.log(`Beneficiario ya existe: ${emailBeneficiario}`);
  }

  // Empresa
  const emailEmpresa = 'empresa@puentelaboral.com';
  let usrEmp = await prisma.usuarios.findFirst({ where: { email: emailEmpresa } });
  if (!usrEmp) {
    await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuarios.create({
        data: { email: emailEmpresa, password_hash, activo: true },
      });
      await tx.empresas.create({
        data: {
          id_usuario: usuario.id_usuario,
          razon_social: 'Empresa Mock SA',
          cuit: '30-12345678-9',
          habilitada_operativamente: true,
        },
      });
    });
    console.log(`Empresa creada: ${emailEmpresa}`);
  } else {
    console.log(`Empresa ya existe: ${emailEmpresa}`);
  }

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
