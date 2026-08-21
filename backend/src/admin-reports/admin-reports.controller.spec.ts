import { Test, TestingModule } from '@nestjs/testing';
import { AdminReportsController } from './admin-reports.controller';
import { AdminReportsService } from './admin-reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Response } from 'express';

describe('AdminReportsController', () => {
  let controller: AdminReportsController;
  let service: AdminReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminReportsController],
      providers: [
        {
          provide: AdminReportsService,
          useValue: {
            getMetrics: jest.fn(),
            exportExcel: jest.fn(),
            exportPdf: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminReportsController>(AdminReportsController);
    service = module.get<AdminReportsService>(AdminReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exportExcel', () => {
    it('should set correct headers and return buffer', async () => {
      const mockBuffer = Buffer.from('excel-data');
      (service.exportExcel as jest.Mock).mockResolvedValue(mockBuffer);

      const mockRes: Partial<Response> = {
        set: jest.fn(),
        end: jest.fn(),
      };

      await controller.exportExcel('all', mockRes as Response);

      expect(service.exportExcel).toHaveBeenCalledWith('all');
      expect(mockRes.set).toHaveBeenCalledWith({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="reporte-metricas.xlsx"',
        'Content-Length': mockBuffer.length,
      });
      expect(mockRes.end).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe('exportPdf', () => {
    it('should set correct headers and return buffer', async () => {
      const mockBuffer = Buffer.from('pdf-data');
      (service.exportPdf as jest.Mock).mockResolvedValue(mockBuffer);

      const mockRes: Partial<Response> = {
        set: jest.fn(),
        end: jest.fn(),
      };

      await controller.exportPdf('all', mockRes as Response);

      expect(service.exportPdf).toHaveBeenCalledWith('all');
      expect(mockRes.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="reporte-metricas.pdf"',
        'Content-Length': mockBuffer.length,
      });
      expect(mockRes.end).toHaveBeenCalledWith(mockBuffer);
    });
  });
});
