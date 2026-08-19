import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminReportsService, TimeRange } from './admin-reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

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
}

