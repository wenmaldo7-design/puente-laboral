import { Module } from '@nestjs/common';
import { EmpresasDashboardController } from './empresas-dashboard.controller';
import { EmpresasDashboardService } from './empresas-dashboard.service';
import { OfertasLaboralesBeneficiarioController } from './ofertas-laborales-beneficiario.controller';
import { OfertasLaboralesBeneficiarioService } from './ofertas-laborales-beneficiario.service';
import { OfertasLaboralesController } from './ofertas-laborales.controller';
import { OfertasLaboralesService } from './ofertas-laborales.service';
import { PostulacionesController } from './postulaciones.controller';
import { PostulacionesService } from './postulaciones.service';

@Module({
  controllers: [
    OfertasLaboralesController,
    OfertasLaboralesBeneficiarioController,
    PostulacionesController,
    EmpresasDashboardController,
  ],
  providers: [
    OfertasLaboralesService,
    OfertasLaboralesBeneficiarioService,
    PostulacionesService,
    EmpresasDashboardService,
  ],
})
export class OfertasLaboralesModule {}
