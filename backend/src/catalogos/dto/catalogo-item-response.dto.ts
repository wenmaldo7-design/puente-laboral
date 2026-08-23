/** Item plano de un catálogo (HABILIDADES / AREAS_INTERES no tienen más columnas que el nombre). */
export interface CatalogoItemResponseDto {
  nombre: string;
}

/** Área de interés con su id: la necesitan formularios que envían el id (ej. cursos), no solo el nombre. */
export interface AreaInteresResponseDto extends CatalogoItemResponseDto {
  id_area: number;
}
