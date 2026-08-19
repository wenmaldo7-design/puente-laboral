import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export type TimeRange = '30d' | '1y' | 'all';

export interface AdminMetricsResponse {
  totalActiveJobOffers: number;
  totalAcceptedCandidates: number;
  averageMatchPercentage: number | null;
}

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private getDateFromTimeRange(timeRange: TimeRange): Date | null {
    if (timeRange === 'all') return null;
    const date = new Date();
    if (timeRange === '30d') {
      date.setDate(date.getDate() - 30);
    } else if (timeRange === '1y') {
      date.setFullYear(date.getFullYear() - 1);
    }
    return date;
  }

  async getMetrics(timeRange: TimeRange = 'all'): Promise<AdminMetricsResponse> {
    const fromDate = this.getDateFromTimeRange(timeRange);
    
    const offersWhere: any = {
      tipo_servicio: 'oferta_laboral',
      estados_publicacion_servicios: { nombre: 'activa' },
    };
    if (fromDate) {
      offersWhere.fecha_publicacion = { gte: fromDate };
    }
    
    const totalActiveJobOffers = await this.prisma.servicios.count({
      where: offersWhere,
    });

    const postulationsWhere: any = {
      estados_postulaciones: { nombre: 'aceptada' }
    };
    if (fromDate) {
      postulationsWhere.fecha_postulacion = { gte: fromDate };
    }

    const totalAcceptedCandidates = await this.prisma.postulaciones_laborales.count({
      where: postulationsWhere,
    });

    const acceptedPostulations = await this.prisma.postulaciones_laborales.findMany({
      where: postulationsWhere,
      include: {
        ofertas_laborales: {
          include: { ofertas_habilidades: true },
        },
        beneficiarios: {
          include: { beneficiarios_habilidades: true },
        },
      }
    });

    let totalMatchPercentage = 0;
    let matchCount = 0;

    for (const postulation of acceptedPostulations) {
      const requiredSkills = postulation.ofertas_laborales?.ofertas_habilidades.map(h => h.id_habilidad) || [];
      const userSkills = postulation.beneficiarios?.beneficiarios_habilidades.map(h => h.id_habilidad) || [];
      
      if (requiredSkills.length > 0) {
        const overlap = requiredSkills.filter(id => userSkills.includes(id)).length;
        const match = (overlap / requiredSkills.length) * 100;
        totalMatchPercentage += match;
        matchCount++;
      } else {
        totalMatchPercentage += 100;
        matchCount++;
      }
    }

    const averageMatchPercentage = matchCount > 0 ? totalMatchPercentage / matchCount : null;

    return {
      totalActiveJobOffers,
      totalAcceptedCandidates,
      averageMatchPercentage: averageMatchPercentage !== null ? Math.round(averageMatchPercentage * 100) / 100 : null,
    };
  }

  async exportExcel(timeRange: TimeRange = 'all'): Promise<Buffer> {
    const metrics = await this.getMetrics(timeRange);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Metricas');

    worksheet.columns = [
      { header: 'Metrica', key: 'metric', width: 40 },
      { header: 'Valor', key: 'value', width: 20 },
    ];

    const timeRangeLabel = timeRange === '30d' ? 'Ultimos 30 dias' : timeRange === '1y' ? 'Ultimo ano' : 'Toda la vida';

    worksheet.addRow({ metric: 'Periodo', value: timeRangeLabel });
    worksheet.addRow({ metric: 'Total de Ofertas Laborales Activas', value: metrics.totalActiveJobOffers });
    worksheet.addRow({ metric: 'Total de Candidatos Aceptados', value: metrics.totalAcceptedCandidates });
    worksheet.addRow({ metric: 'Porcentaje Promedio de Match', value: metrics.averageMatchPercentage !== null ? `${metrics.averageMatchPercentage}%` : 'N/A' });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }

  async exportPdf(timeRange: TimeRange = 'all'): Promise<Buffer> {
    const metrics = await this.getMetrics(timeRange);
    const timeRangeLabel = timeRange === '30d' ? 'Ultimos 30 dias' : timeRange === '1y' ? 'Ultimo ano' : 'Toda la vida';

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', reject);

      doc.fontSize(20).text('Reporte de Metricas del Dashboard', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Periodo: ${timeRangeLabel}`);
      doc.moveDown();

      doc.fontSize(12).text(`Total de Ofertas Laborales Activas: ${metrics.totalActiveJobOffers}`);
      doc.moveDown(0.5);
      doc.text(`Total de Candidatos Aceptados: ${metrics.totalAcceptedCandidates}`);
      doc.moveDown(0.5);
      doc.text(`Porcentaje Promedio de Match: ${metrics.averageMatchPercentage !== null ? `${metrics.averageMatchPercentage}%` : 'N/A'}`);

      doc.end();
    });
  }
}
