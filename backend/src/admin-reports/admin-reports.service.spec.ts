import { Test, TestingModule } from '@nestjs/testing';
import { AdminReportsService } from './admin-reports.service';
import { PrismaService } from '../database/prisma.service';

describe('AdminReportsService', () => {
  let service: AdminReportsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminReportsService,
        {
          provide: PrismaService,
          useValue: {
            servicios: {
              count: jest.fn(),
            },
            postulaciones_laborales: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AdminReportsService>(AdminReportsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetrics', () => {
    it('should return metrics for all time range correctly', async () => {
      // Mock data
      (prisma.servicios.count as jest.Mock).mockResolvedValue(10);
      (prisma.postulaciones_laborales.count as jest.Mock).mockResolvedValue(5);
      
      const mockPostulations = [
        {
          ofertas_laborales: {
            ofertas_habilidades: [{ id_habilidad: 1 }, { id_habilidad: 2 }],
          },
          beneficiarios: {
            beneficiarios_habilidades: [{ id_habilidad: 1 }, { id_habilidad: 3 }],
          },
        },
        {
          ofertas_laborales: {
            ofertas_habilidades: [{ id_habilidad: 4 }],
          },
          beneficiarios: {
            beneficiarios_habilidades: [{ id_habilidad: 4 }],
          },
        },
        {
          ofertas_laborales: {
            ofertas_habilidades: [],
          },
          beneficiarios: {
            beneficiarios_habilidades: [{ id_habilidad: 5 }],
          },
        }
      ];

      (prisma.postulaciones_laborales.findMany as jest.Mock).mockResolvedValue(mockPostulations);

      const result = await service.getMetrics('all');

      expect(result.totalActiveJobOffers).toBe(10);
      expect(result.totalAcceptedCandidates).toBe(3);
      // Math:
      // P1: overlap 1 of 2 -> 50%
      // P2: overlap 1 of 1 -> 100%
      // P3: required 0 -> 100%
      // Average: (50 + 100 + 100) / 3 = 83.33
      expect(result.averageMatchPercentage).toBe(83.33);

      expect(prisma.servicios.count).toHaveBeenCalledWith({
        where: {
          tipo_servicio: 'oferta_laboral',
          estados_publicacion_servicios: { nombre: 'activa' },
        }
      });
    });

    it('should handle time ranges correctly', async () => {
      (prisma.servicios.count as jest.Mock).mockResolvedValue(0);
      (prisma.postulaciones_laborales.count as jest.Mock).mockResolvedValue(0);
      (prisma.postulaciones_laborales.findMany as jest.Mock).mockResolvedValue([]);

      await service.getMetrics('30d');
      expect(prisma.servicios.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fecha_publicacion: expect.objectContaining({
              gte: expect.any(Date),
            })
          })
        })
      );
    });

    it('should return null for averageMatchPercentage if no accepted candidates', async () => {
      (prisma.servicios.count as jest.Mock).mockResolvedValue(0);
      (prisma.postulaciones_laborales.count as jest.Mock).mockResolvedValue(0);
      (prisma.postulaciones_laborales.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getMetrics('all');
      expect(result.averageMatchPercentage).toBeNull();
    });
  });

  describe('exports', () => {
    it('should generate an Excel buffer', async () => {
      (prisma.servicios.count as jest.Mock).mockResolvedValue(10);
      (prisma.postulaciones_laborales.findMany as jest.Mock).mockResolvedValue([]);
      
      const buffer = await service.exportExcel('all');
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a PDF buffer', async () => {
      (prisma.servicios.count as jest.Mock).mockResolvedValue(10);
      (prisma.postulaciones_laborales.findMany as jest.Mock).mockResolvedValue([]);
      
      const buffer = await service.exportPdf('all');
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.toString('utf8', 0, 4)).toBe('%PDF');
    });
  });
});
