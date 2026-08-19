import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { EmpresasDashboardService } from './empresas-dashboard.service';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('EmpresasDashboardService', () => {
  let service: EmpresasDashboardService;
  let prismaService: any;
  let notificacionesService: any;

  beforeEach(async () => {
    prismaService = {
      $transaction: jest.fn(async (cb) => cb(prismaService)),
      $queryRaw: jest.fn(),
      postulaciones_laborales: {
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      estados_postulaciones: {
        findFirst: jest.fn(),
      },
    };

    notificacionesService = {
      crear: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresasDashboardService,
        { provide: PrismaService, useValue: prismaService },
        { provide: NotificacionesService, useValue: notificacionesService },
      ],
    }).compile();

    service = module.get<EmpresasDashboardService>(EmpresasDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('actualizarEstadoPostulacion', () => {
    it('throws NotFoundException if postulacion not found', async () => {
      prismaService.postulaciones_laborales.findUnique.mockResolvedValue(null);
      await expect(
        service.actualizarEstadoPostulacion(1, 1, 'aceptada')
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if empresa does not own the postulacion', async () => {
      prismaService.postulaciones_laborales.findUnique.mockResolvedValue({
        ofertas_laborales: { servicios: { id_usuario_empresa: 2 } }
      });
      await expect(
        service.actualizarEstadoPostulacion(1, 1, 'aceptada')
      ).rejects.toThrow(ForbiddenException);
    });

    it('returns early if state is already the new state', async () => {
      prismaService.postulaciones_laborales.findUnique.mockResolvedValue({
        ofertas_laborales: { servicios: { id_usuario_empresa: 1 } },
        estados_postulaciones: { nombre: 'aceptada' }
      });
      await service.actualizarEstadoPostulacion(1, 1, 'aceptada');
      expect(prismaService.postulaciones_laborales.update).not.toHaveBeenCalled();
    });

    it('throws ConflictException if vacantes limit reached when accepting', async () => {
      prismaService.postulaciones_laborales.findUnique.mockResolvedValue({
        id_postulacion: 1,
        id_servicio: 10,
        ofertas_laborales: { 
          vacantes: 1,
          servicios: { id_usuario_empresa: 1 } 
        },
        estados_postulaciones: { nombre: 'pendiente' }
      });
      prismaService.estados_postulaciones.findFirst.mockResolvedValue({
        id_estado_postulacion: 2,
        nombre: 'aceptada',
      });
      prismaService.postulaciones_laborales.count.mockResolvedValue(1); // Already 1 accepted

      await expect(
        service.actualizarEstadoPostulacion(1, 1, 'aceptada')
      ).rejects.toThrow(ConflictException);

      expect(prismaService.$queryRaw).toHaveBeenCalled();
      expect(prismaService.postulaciones_laborales.count).toHaveBeenCalledWith({
        where: { id_servicio: 10, estados_postulaciones: { nombre: 'aceptada' } }
      });
    });

    it('updates state and dispatches notification', async () => {
      prismaService.postulaciones_laborales.findUnique.mockResolvedValue({
        id_postulacion: 1,
        id_servicio: 10,
        id_usuario_beneficiario: 5,
        ofertas_laborales: { 
          vacantes: 2,
          servicios: { 
            id_usuario_empresa: 1,
            titulo: 'Dev',
            empresas: { razon_social: 'Acme' }
          } 
        },
        estados_postulaciones: { nombre: 'pendiente' }
      });
      prismaService.estados_postulaciones.findFirst.mockResolvedValue({
        id_estado_postulacion: 2,
        nombre: 'aceptada',
      });
      prismaService.postulaciones_laborales.count.mockResolvedValue(1); // 1 < 2, ok!

      await service.actualizarEstadoPostulacion(1, 1, 'aceptada');

      expect(prismaService.postulaciones_laborales.update).toHaveBeenCalledWith({
        where: { id_postulacion: 1 },
        data: { id_estado_postulacion: 2 }
      });

      expect(notificacionesService.crear).toHaveBeenCalledWith({
        tipo: 'POSTULACION_CAMBIO_ESTADO',
        destinatario: { rol: 'beneficiario', idUsuario: 5 },
        datos: { oferta: 'Dev', empresa: 'Acme', estado: 'aceptada' }
      });
    });
  });
});
