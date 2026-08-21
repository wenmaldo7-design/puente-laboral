import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { calcularMatchPorcentaje } from '../ofertas-laborales/matching.util';

export type TimeRange = '30d' | '1y' | 'all';

export interface AdminMetricsResponse {
  totalActiveJobOffers: number;
  totalAcceptedCandidates: number;
  averageMatchPercentage: number | null;
  totalOrganizations: number;
  totalBeneficiaries: number;
  servicesBreakdown: {
    offers: number;
    courses: number;
    mentorships: number;
  };
  pendingCompanies: number;
  topSkills: { name: string; count: number }[];
  postulationsFunnel: { state: string; count: number }[];
  geographicDistribution: { city: string; count: number }[];
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
    
    // Total Ofertas Activas
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

    // Organizaciones Aliadas (Empresas aprobadas/habilitadas)
    const orgsWhere: any = { habilitada_operativamente: true };
    if (fromDate) {
      orgsWhere.fecha_habilitacion = { gte: fromDate };
    }
    const totalOrganizations = await this.prisma.empresas.count({
      where: orgsWhere
    });

    // Empresas pendientes de revisión
    const pendingCompaniesWhere: any = {
      estados_solicitudes: { nombre: 'pendiente' }
    };
    if (fromDate) {
      pendingCompaniesWhere.fecha_solicitud = { gte: fromDate };
    }
    const pendingCompanies = await this.prisma.solicitudes_habilitacion_empresas.count({
      where: pendingCompaniesWhere
    });

    // Total Beneficiarios
    const totalBeneficiaries = await this.prisma.beneficiarios.count();

    // Breakdown de servicios
    const servicesWhere: any = {};
    if (fromDate) {
      servicesWhere.fecha_publicacion = { gte: fromDate };
    }
    const services = await this.prisma.servicios.groupBy({
      by: ['tipo_servicio'],
      where: servicesWhere,
      _count: true,
    });

    const servicesBreakdown = {
      offers: services.find(s => s.tipo_servicio === 'oferta_laboral')?._count || 0,
      courses: services.find(s => s.tipo_servicio === 'curso')?._count || 0,
      mentorships: services.find(s => s.tipo_servicio === 'mentoria')?._count || 0,
    };

    // Ranking Top Habilidades Demandadas
    const skillsGroup = await this.prisma.ofertas_habilidades.groupBy({
      by: ['id_habilidad'],
      _count: { id_habilidad: true },
      orderBy: { _count: { id_habilidad: 'desc' } },
      take: 5
    });
    const skillsList = await this.prisma.habilidades.findMany({
      where: { id_habilidad: { in: skillsGroup.map(s => s.id_habilidad) } }
    });
    const topSkills = skillsGroup.map(g => ({
      name: skillsList.find(s => s.id_habilidad === g.id_habilidad)?.nombre || 'Desconocida',
      count: g._count.id_habilidad
    }));

    // Embudo de postulaciones
    const postulationGroups = await this.prisma.postulaciones_laborales.groupBy({
      by: ['id_estado_postulacion'],
      _count: { id_estado_postulacion: true },
      where: fromDate ? { fecha_postulacion: { gte: fromDate } } : undefined
    });
    const postulationStates = await this.prisma.estados_postulaciones.findMany();
    const postulationsFunnel = postulationGroups.map(g => ({
      state: postulationStates.find(s => s.id_estado_postulacion === g.id_estado_postulacion)?.nombre || 'Otro',
      count: g._count.id_estado_postulacion
    }));

    // Distribución Geográfica (Beneficiarios)
    const geoGroups = await this.prisma.beneficiarios.groupBy({
      by: ['id_ciudad'],
      _count: { id_ciudad: true },
      orderBy: { _count: { id_ciudad: 'desc' } },
      take: 5
    });
    const validGeoGroups = geoGroups.filter(g => g.id_ciudad !== null);
    const citiesList = await this.prisma.ciudades.findMany({
      where: { id_ciudad: { in: validGeoGroups.map(g => g.id_ciudad as number) } }
    });
    const geographicDistribution = validGeoGroups.map(g => ({
      city: citiesList.find(c => c.id_ciudad === g.id_ciudad)?.nombre || 'Desconocida',
      count: g._count.id_ciudad
    }));

    // Candidatos aceptados y Match
    const postulationsWhere: any = {
      estados_postulaciones: { nombre: 'aceptada' }
    };
    if (fromDate) {
      postulationsWhere.fecha_postulacion = { gte: fromDate };
    }

    const acceptedPostulations = await this.prisma.postulaciones_laborales.findMany({
      where: postulationsWhere,
      select: {
        ofertas_laborales: {
          select: { 
            ofertas_habilidades: { select: { id_habilidad: true } },
            servicios: { select: { id_area: true } }
          },
        },
        beneficiarios: {
          select: { 
            beneficiarios_habilidades: { select: { id_habilidad: true } },
            beneficiarios_areas: { select: { id_area: true } }
          },
        },
      }
    });

    const totalAcceptedCandidates = acceptedPostulations.length;

    let totalMatchPercentage = 0;
    let matchCount = 0;

    for (const postulation of acceptedPostulations) {
      const idArea = postulation.ofertas_laborales?.servicios?.id_area;
      if (!idArea) continue;

      const requiredSkills = postulation.ofertas_laborales?.ofertas_habilidades.map(h => h.id_habilidad) || [];
      const userSkills = postulation.beneficiarios?.beneficiarios_habilidades.map(h => h.id_habilidad) || [];
      const userAreas = postulation.beneficiarios?.beneficiarios_areas.map(a => a.id_area) || [];
      
      const match = calcularMatchPorcentaje(
        { idsHabilidades: new Set(userSkills), idsAreas: new Set(userAreas) },
        { idArea, idsHabilidadesRequeridas: requiredSkills }
      );

      totalMatchPercentage += match;
      matchCount++;
    }

    const averageMatchPercentage = matchCount > 0 ? totalMatchPercentage / matchCount : null;

    return {
      totalActiveJobOffers,
      totalAcceptedCandidates,
      averageMatchPercentage: averageMatchPercentage !== null ? Math.round(averageMatchPercentage * 100) / 100 : null,
      totalOrganizations,
      totalBeneficiaries,
      servicesBreakdown,
      pendingCompanies,
      topSkills,
      postulationsFunnel,
      geographicDistribution
    };
  }

  async exportExcel(timeRange: TimeRange = 'all'): Promise<Buffer> {
    const metrics = await this.getMetrics(timeRange);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Métricas');

    // Estilos globales de la hoja
    worksheet.views = [{ showGridLines: false }];

    // Título Principal
    worksheet.mergeCells('A1:B2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Puente Laboral - Reporte de Métricas';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.addRow([]); // Espacio en fila 3

    // Configurar columnas
    worksheet.columns = [
      { key: 'metric', width: 45 },
      { key: 'value', width: 25 },
    ];

    const timeRangeLabel = timeRange === '30d' ? 'Últimos 30 días' : timeRange === '1y' ? 'Último año' : 'Histórico Completo';

    // Headers de la tabla en fila 4
    const headerRow = worksheet.addRow({ metric: 'Métrica', value: 'Valor' });
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // Datos
    const data = [
      { metric: 'Período analizado', value: timeRangeLabel },
      { metric: 'Organizaciones Aliadas (Aprobadas)', value: metrics.totalOrganizations },
      { metric: 'Beneficiarios Totales', value: metrics.totalBeneficiaries },
      { metric: 'Total de Ofertas Laborales Activas', value: metrics.totalActiveJobOffers },
      { metric: 'Total de Candidatos Aceptados', value: metrics.totalAcceptedCandidates },
      { metric: 'Porcentaje Promedio de Match', value: metrics.averageMatchPercentage !== null ? `${metrics.averageMatchPercentage}%` : 'N/A' },
      { metric: 'Desglose: Ofertas', value: metrics.servicesBreakdown.offers },
      { metric: 'Desglose: Cursos', value: metrics.servicesBreakdown.courses },
      { metric: 'Desglose: Mentorías', value: metrics.servicesBreakdown.mentorships },
    ];

    data.forEach((row, index) => {
      const dataRow = worksheet.addRow(row);
      dataRow.eachCell((cell, colNumber) => {
        cell.font = { color: { argb: 'FF0F172A' } };
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        // Alternar colores de fila
        if (index % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF1F6' } };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }

  async exportPdf(timeRange: TimeRange = 'all'): Promise<Buffer> {
    const metrics = await this.getMetrics(timeRange);
    const timeRangeLabel = timeRange === '30d' ? 'Últimos 30 días' : timeRange === '1y' ? 'Último año' : 'Histórico Completo';

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 0 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', reject);

      // Header background
      doc.rect(0, 0, doc.page.width, 120).fill('#1976d2');
      
      // Header Text
      doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold');
      doc.text('Puente Laboral', 50, 40);
      doc.fontSize(14).font('Helvetica');
      doc.text('Reporte de Métricas del Dashboard', 50, 75);

      // Reset margins for body
      doc.x = 50;
      doc.y = 160;

      // Periodo
      doc.fillColor('#1565c0').fontSize(16).font('Helvetica-Bold');
      doc.text('Resumen del Período', 50, doc.y);
      doc.moveDown(0.5);
      doc.fillColor('#64748b').fontSize(12).font('Helvetica');
      doc.text(`Filtro aplicado: ${timeRangeLabel}`, 50, doc.y);
      doc.moveDown(2);

      // Metrics block helper
      const drawMetric = (label: string, value: string | number) => {
        // Linea separadora
        doc.rect(50, doc.y, doc.page.width - 100, 1).fill('#e2e8f0');
        doc.moveDown(1);
        
        doc.fillColor('#0f172a').font('Helvetica').fontSize(12);
        doc.text(label, 50, doc.y);
        
        doc.fillColor('#1976d2').font('Helvetica-Bold').fontSize(14);
        doc.text(String(value), 50, doc.y - 14, { align: 'right', width: doc.page.width - 100 });
        doc.moveDown(1);
      };

      drawMetric('Organizaciones Aliadas (Aprobadas)', metrics.totalOrganizations);
      drawMetric('Beneficiarios Totales', metrics.totalBeneficiaries);
      drawMetric('Total de Ofertas Laborales Activas', metrics.totalActiveJobOffers);
      drawMetric('Total de Candidatos Aceptados', metrics.totalAcceptedCandidates);
      drawMetric('Porcentaje Promedio de Match', metrics.averageMatchPercentage !== null ? `${metrics.averageMatchPercentage}%` : 'N/A');
      
      // Breakdown section
      doc.moveDown(1);
      doc.fillColor('#1565c0').fontSize(14).font('Helvetica-Bold');
      doc.text('Desglose de Servicios Publicados', 50, doc.y);
      doc.moveDown(1);
      
      drawMetric('Ofertas Laborales', metrics.servicesBreakdown.offers);
      drawMetric('Cursos', metrics.servicesBreakdown.courses);
      drawMetric('Mentorías', metrics.servicesBreakdown.mentorships);

      // Footer
      doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill('#eef1f6');
      doc.fillColor('#94a3b8').fontSize(10).font('Helvetica');
      doc.text(`Generado el ${new Date().toLocaleDateString('es-AR')}`, 50, doc.page.height - 30, { align: 'center' });

      doc.end();
    });
  }
}
