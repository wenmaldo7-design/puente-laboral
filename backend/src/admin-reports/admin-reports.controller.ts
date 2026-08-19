import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { AdminReportsService, TimeRange } from './admin-reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { Response } from 'express';

@Controller('admin-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get('metrics')
  async getMetrics(@Query('timeRange') timeRange?: string) {
    const validRange = ['30d', '1y', 'all'].includes(timeRange as string) ? (timeRange as TimeRange) : 'all';
    return this.adminReportsService.getMetrics(validRange);
  }

  @Get('export/excel')
  async exportExcel(@Query('timeRange') timeRange: string, @Res() res: Response) {
    const validRange = ['30d', '1y', 'all'].includes(timeRange as string) ? (timeRange as TimeRange) : 'all';
    const buffer = await this.adminReportsService.exportExcel(validRange);
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="reporte-metricas.xlsx"',
      'Content-Length': buffer.length,
    });
    
    res.end(buffer);
  }

  @Get('export/pdf')
  async exportPdf(@Query('timeRange') timeRange: string, @Res() res: Response) {
    const validRange = ['30d', '1y', 'all'].includes(timeRange as string) ? (timeRange as TimeRange) : 'all';
    const buffer = await this.adminReportsService.exportPdf(validRange);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte-metricas.pdf"',
      'Content-Length': buffer.length,
    });
    
    res.end(buffer);
  }
}

