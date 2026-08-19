import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { EstadoSolicitud } from '../src/auth/empresas/interfaces/estado-solicitud.enum';

const ESTADOS_SOLICITUD: readonly EstadoSolicitud[] = [
  EstadoSolicitud.PENDIENTE,
  EstadoSolicitud.APROBADA,
  EstadoSolicitud.RECHAZADA,
];

/**
 * HABILIDADES no tiene columna de categoría en el schema (solo nombre):
 * esta lista viene del catálogo agrupado que armó el equipo de
 * feat/homePerfilBeneficiario para el mock, aplanada.
 */
const HABILIDADES: readonly string[] = [
  'Albañilería', 'Electricidad básica', 'Plomería', 'Carpintería', 'Pintura de obra',
  'Soldadura', 'Colocación de pisos y cerámicos', 'Techista', 'Yesero / durlock',
  'Cocina', 'Panadería y pastelería', 'Manejo de alimentos', 'Mozo/moza / atención en salón',
  'Bartender', 'Cocina en food truck / ambulante',
  'Recepción de hotel', 'Camarera de pisos', 'Guía turístico', 'Atención en eventos',
  'Cuidado de niños', 'Cuidado de adultos mayores', 'Primeros auxilios',
  'Acompañamiento terapéutico', 'Enfermería / auxiliar de enfermería', 'Cuidados paliativos',
  'Paseador de perros', 'Cuidado y adiestramiento de mascotas', 'Auxiliar veterinario',
  'Costura', 'Tejido', 'Manualidades y artesanías', 'Marroquinería / trabajo en cuero',
  'Manejo de autoelevador', 'Carnet de conducir', 'Logística y depósito', 'Reparto y delivery',
  'Manejo de camiones (carnet profesional)',
  'Trabajo en línea de producción', 'Control de calidad', 'Empaque y embalaje',
  'Manejo de maquinaria industrial',
  'Limpieza general', 'Limpieza industrial', 'Mantenimiento de espacios verdes', 'Jardinería',
  'Ventas', 'Manejo de caja', 'Atención al cliente', 'Merchandising / exhibición de productos',
  'Vendedor ambulante / ferias',
  'Excel', 'Manejo de PC básico', 'Gestión de trámites', 'Contabilidad básica',
  'Atención telefónica / call center',
  'HTML/CSS', 'Soporte técnico IT', 'Diseño gráfico', 'Edición de video',
  'Redes sociales / community management',
  'Peluquería', 'Manicuría', 'Maquillaje', 'Barbería',
  'Trabajo rural / agropecuario', 'Manejo de maquinaria agrícola', 'Viveros y producción vegetal',
  'Apicultura',
  'Vigilancia y seguridad', 'Manejo de alarmas y cámaras',
  'Mecánica automotriz', 'Reparación de electrodomésticos',
  'Reparación de celulares y computadoras', 'Gasista / instalaciones de gas',
  'Refrigeración y aire acondicionado',
  'Inglés básico', 'Inglés intermedio', 'Portugués',
  'Apoyo escolar', 'Capacitación a adultos',
  'Fotografía', 'Música / instrumentos', 'Cerámica', 'Carpintería artística',
  'Entrenamiento físico / personal trainer', 'Instructor de yoga', 'Salvavidas',
  'Trabajo social', 'Mediación de conflictos', 'Promotor comunitario / de salud',
  'Trabajo en equipo', 'Comunicación efectiva', 'Organización y puntualidad',
  'Resolución de problemas', 'Liderazgo',
];

/**
 * ESTADOS_PUBLICACION_SERVICIOS no tenía seed. Se usan los mismos 3 valores
 * que ya consume el mock de home-empresa-page (activa/pausada/cerrada);
 * 'activa' queda como default al crear un servicio.
 */
const ESTADOS_PUBLICACION_SERVICIOS: readonly string[] = ['activa', 'pausada', 'cerrada'];

/**
 * ESTADOS_POSTULACIONES tampoco tenía seed. 'pendiente' queda como default
 * al crear una postulación; aceptada/rechazada quedan listas para cuando
 * la empresa pueda revisar postulaciones (todavía no implementado).
 */
const ESTADOS_POSTULACIONES: readonly string[] = ['pendiente', 'en_proceso', 'entrevistado', 'aceptada', 'rechazada'];

/** TIPOS_CONTRATO tampoco tenía seed: catálogo estándar para ofertas laborales. */
const TIPOS_CONTRATO: readonly string[] = [
  'Tiempo indeterminado',
  'Plazo fijo',
  'Pasantía',
  'Por temporada',
  'Changa / Freelance',
];

const AREAS_INTERES: readonly string[] = [
  'Construcción y oficios', 'Gastronomía', 'Hotelería y turismo', 'Cuidado de personas',
  'Salud y bienestar', 'Cuidado de animales', 'Textil y costura', 'Logística y transporte',
  'Producción y fábrica', 'Limpieza y mantenimiento', 'Comercio y ventas',
  'Administración y oficina', 'Desarrollo web / Tecnología', 'Belleza y estética',
  'Agro y producción', 'Seguridad', 'Idiomas', 'Educación', 'Arte y diseño',
  'Mecánica y reparación', 'Deportes y actividad física', 'Trabajo social', 'Primer empleo',
  'Mentorías', 'Capacitación y formación',
];

/** Idempotente: solo inserta lo que todavía no existe por nombre. */
async function main(): Promise<void> {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  for (const nombre of ESTADOS_SOLICITUD) {
    const existente = await prisma.estados_solicitudes.findFirst({
      where: { nombre },
    });
    if (!existente) {
      await prisma.estados_solicitudes.create({ data: { nombre } });
    }
  }

  for (const nombre of HABILIDADES) {
    const existente = await prisma.habilidades.findFirst({ where: { nombre } });
    if (!existente) {
      await prisma.habilidades.create({ data: { nombre } });
    }
  }

  for (const nombre of AREAS_INTERES) {
    const existente = await prisma.areas_interes.findFirst({ where: { nombre } });
    if (!existente) {
      await prisma.areas_interes.create({ data: { nombre } });
    }
  }

  for (const nombre of ESTADOS_PUBLICACION_SERVICIOS) {
    const existente = await prisma.estados_publicacion_servicios.findFirst({ where: { nombre } });
    if (!existente) {
      await prisma.estados_publicacion_servicios.create({ data: { nombre } });
    }
  }

  for (const nombre of TIPOS_CONTRATO) {
    const existente = await prisma.tipos_contrato.findFirst({ where: { nombre } });
    if (!existente) {
      await prisma.tipos_contrato.create({ data: { nombre } });
    }
  }

  for (const nombre of ESTADOS_POSTULACIONES) {
    const existente = await prisma.estados_postulaciones.findFirst({ where: { nombre } });
    if (!existente) {
      await prisma.estados_postulaciones.create({ data: { nombre } });
    }
  }

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
