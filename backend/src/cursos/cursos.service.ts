import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  async getMatchCursos(beneficiarioUserId: number) {
    // 1. Buscamos el perfil del beneficiario y sus habilidades en español
    const beneficiarioProfile = await this.prisma.beneficiario.findUnique({
      where: { id_usuario: beneficiarioUserId }, // Ajustado al campo real del schema
      include: { 
        beneficiarioHabilidades: {
          include: { habilidad: true }
        } 
      },
    });

    if (!beneficiarioProfile) {
      return [];
    }

    // Extraemos los IDs de las habilidades del beneficiario
    const userSkillIds = beneficiarioProfile.beneficiarioHabilidades.map(
      (s) => s.id_habilidad,
    );

    // 2. Buscamos los servicios/cursos registrados
    const cursos = await this.prisma.servicio.findMany({
      where: {
        tipo_servicio: 'Curso',
      },
    });

    // 3. Calculamos el porcentaje de match para cada curso en memoria
    const cursosConMatch = cursos.map((curso) => {
      // Ajusta esto si tus cursos tienen relación con habilidades específicas
      const requiredIds: number[] = []; 

      if (requiredIds.length === 0) {
        return { ...curso, matchPercentage: 100 };
      }

      const matchingSkills = requiredIds.filter((id) =>
        userSkillIds.includes(id),
      );
      const percentage = Math.round(
        (matchingSkills.length / requiredIds.length) * 100,
      );

      return {
        ...curso,
        matchPercentage: percentage,
      };
    });

    // 4. Ordenamos de mayor a menor porcentaje de match
    return cursosConMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }
}