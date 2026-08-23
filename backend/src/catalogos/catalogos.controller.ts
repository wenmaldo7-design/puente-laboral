import { Controller, Get } from '@nestjs/common';
import { CatalogosService } from './catalogos.service';
import {
  AreaInteresResponseDto,
  CatalogoItemResponseDto,
} from './dto/catalogo-item-response.dto';

/** Públicos, sin auth: catálogos de referencia usados en varios formularios. */
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Get('habilidades')
  async habilidades(): Promise<CatalogoItemResponseDto[]> {
    return this.catalogosService.listarHabilidades();
  }

  @Get('areas-interes')
  async areasInteres(): Promise<AreaInteresResponseDto[]> {
    return this.catalogosService.listarAreasInteres();
  }

  @Get('tipos-contrato')
  async tiposContrato(): Promise<CatalogoItemResponseDto[]> {
    return this.catalogosService.listarTiposContrato();
  }

  @Get('provincias')
  async provincias(): Promise<CatalogoItemResponseDto[]> {
    return this.catalogosService.listarProvincias();
  }
}
