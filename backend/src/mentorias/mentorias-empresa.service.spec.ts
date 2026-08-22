import { Test, TestingModule } from '@nestjs/testing';
import { MentoriasEmpresaService } from './mentorias-empresa.service';
import { PrismaService } from '../database/prisma.service';

describe('MentoriasEmpresaService', () => {
  let service: MentoriasEmpresaService;
  let prisma: PrismaService;

  const mockPrisma = {
    estados_publicacion_servicios: {
      findFirst: jest.fn().mockResolvedValue({ id_estado_publicacion: 1, nombre: 'Publicado' }),
    },
    $transaction: jest.fn().mockImplementation(async (cb) => {
      return cb({
        servicios: {
          create: jest.fn().mockResolvedValue({ id_servicio: 1 }),
        },
        mentorias: {
          create: jest.fn().mockResolvedValue({ id_servicio: 1 }),
        },
      });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentoriasEmpresaService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MentoriasEmpresaService>(MentoriasEmpresaService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a mentoria and map status correctly', async () => {
    const dto = {
      titulo: 'Mentoria test',
      descripcion: 'desc',
      requisitos: 'req',
      duracion_minutos: 60,
      id_area: 1,
      fecha: '2025-01-01',
      hora_inicio: '10:00',
      modalidad: 'virtual',
    };
    const result = await service.crearMentoria(1, dto);

    expect(prisma.estados_publicacion_servicios.findFirst).toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result.servicio.id_servicio).toBe(1);
    expect(result.mentoria.id_servicio).toBe(1);
  });
});
