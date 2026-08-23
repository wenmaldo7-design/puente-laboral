import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  async getMatchCursos(beneficiarioUserId: number) {
    // 1. Buscamos el perfil del beneficiario y sus habilidades asociadas
    const beneficiarioProfile = await this.prisma.beneficiaryProfile.findUnique({
      where: { userId: beneficiarioUserId },
      include: { skills: true },
    });

    if (!beneficiarioProfile) {
      return [];
    }

    const skillIds = beneficiarioProfile.skills.map((s) => s.id);

    // 2. Buscamos oportunidades de tipo 'Curso' que requieran alguna de esas habilidades
    return await this.prisma.opportunity.findMany({
      where: {
        type: 'Curso',
        requiredSkills: {
          some: {
            id: { in: skillIds },
          },
        },
      },
      include: {
        requiredSkills: true,
        organization: true,
      },
    });
  }
}