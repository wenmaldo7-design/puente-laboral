export interface Curso {
  id: string;
  titulo: string;
  modalidad: string;
  provincia: string;
  descripcion: string;
  cuposTotales: number;
  cuposDisponibles: number;
  estaInscripto: boolean;
  organizacionNombre: string;
}

export interface CursosFiltros {
  modalidad?: string;
  provincia?: string;
}