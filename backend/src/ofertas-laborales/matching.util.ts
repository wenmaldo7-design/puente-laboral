/** Habilidades y áreas de interés del beneficiario, por id (perfil real, sin pesos inventados). */
export interface PerfilMatching {
  idsHabilidades: ReadonlySet<number>;
  idsAreas: ReadonlySet<number>;
}

export interface OfertaMatching {
  idArea: number;
  idsHabilidadesRequeridas: readonly number[];
}

/**
 * Cada requisito de la oferta (el área + cada habilidad requerida) vale 1
 * punto por igual: no hay pesos arbitrarios entre área y habilidades.
 * match% = puntos que el beneficiario cumple / puntos totales de la oferta.
 */
export function calcularMatchPorcentaje(
  perfil: PerfilMatching,
  oferta: OfertaMatching,
): number {
  const puntosPosibles = 1 + oferta.idsHabilidadesRequeridas.length;
  const puntoArea = perfil.idsAreas.has(oferta.idArea) ? 1 : 0;
  const puntosHabilidades = oferta.idsHabilidadesRequeridas.filter((id) =>
    perfil.idsHabilidades.has(id),
  ).length;

  return Math.round(((puntoArea + puntosHabilidades) / puntosPosibles) * 100);
}
