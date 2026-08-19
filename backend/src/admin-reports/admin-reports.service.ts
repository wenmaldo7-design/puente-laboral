import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

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
}
