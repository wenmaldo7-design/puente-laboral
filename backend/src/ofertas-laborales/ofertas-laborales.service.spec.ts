import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../database/prisma.service';
import { OfertasLaboralesService } from './ofertas-laborales.service';
import { BadRequestException } from '@nestjs/common';
import { CrearOfertaLaboralDto } from './dto/crear-oferta-laboral.dto';

describe('OfertasLaboralesService', () => {
  let service: OfertasLaboralesService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      $transaction: jest.fn(async (cb) => cb(prismaService)),
      areas_interes: { findFirst: jest.fn() },
      habilidades: { findMany: jest.fn() },
      tipos_contrato: { findFirst: jest.fn() },
      provincias: { findFirst: jest.fn() },
      estados_publicacion_servicios: { findFirst: jest.fn() },
      servicios: { create: jest.fn() },
      ofertas_laborales: { create: jest.fn() },
      ofertas_habilidades: { createMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfertasLaboralesService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<OfertasLaboralesService>(OfertasLaboralesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crear', () => {
    it('links id_provincia on creation if provincia is provided in dto', async () => {
      const dto = new CrearOfertaLaboralDto();
      dto.titulo = 'Test';
      dto.area = 'Backend';
      dto.modalidad = 'presencial';
      dto.vacantes = 1;
      dto.fecha_limite = '2099-12-31';
      dto.provincia = 'Córdoba';

      prismaService.areas_interes.findFirst.mockResolvedValue({ id_area: 1, nombre: 'Backend' });
      prismaService.estados_publicacion_servicios.findFirst.mockResolvedValue({ id_estado_publicacion: 1, nombre: 'activa' });
      
      // Mock province catalog resolution
      prismaService.provincias.findFirst.mockResolvedValue({ id_provincia: 5, nombre: 'Córdoba' });

      prismaService.servicios.create.mockResolvedValue({
        id_servicio: 100,
        titulo: 'Test',
        fecha_publicacion: new Date(),
        descripcion: null,
      });

      prismaService.ofertas_laborales.create.mockResolvedValue({
        id_servicio: 100,
        modalidad: 'presencial',
        vacantes: 1,
        fecha_limite: new Date(),
      });

      await service.crear(1, dto);

      // Verify that findFirst was called for province
      expect(prismaService.provincias.findFirst).toHaveBeenCalledWith({
        where: { nombre: 'Córdoba' },
      });

      // Verify that servicios.create received id_provincia
      expect(prismaService.servicios.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id_provincia: 5,
        }),
      });
    });

    it('throws BadRequestException if province does not exist in catalog', async () => {
      const dto = new CrearOfertaLaboralDto();
      dto.titulo = 'Test';
      dto.area = 'Backend';
      dto.modalidad = 'presencial';
      dto.vacantes = 1;
      dto.fecha_limite = '2099-12-31';
      dto.provincia = 'Invalid';

      prismaService.areas_interes.findFirst.mockResolvedValue({ id_area: 1, nombre: 'Backend' });
      prismaService.estados_publicacion_servicios.findFirst.mockResolvedValue({ id_estado_publicacion: 1, nombre: 'activa' });
      
      // Mock not found
      prismaService.provincias.findFirst.mockResolvedValue(null);

      await expect(service.crear(1, dto)).rejects.toThrow(BadRequestException);
    });
  });
});
