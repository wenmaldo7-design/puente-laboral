/** Respuesta de GET /empresas/metricas. */
export interface EmpresaMetricasResponseDto {
  oportunidades_activas: number;
  postulaciones_totales: number;
  postulaciones_pendientes: number;
  /** Promedio de match_porcentaje entre todos los postulantes recibidos. null si todavía no hay postulaciones. */
  match_promedio: number | null;
}
