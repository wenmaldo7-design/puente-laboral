import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';
import { Mentoria, ModalidadMentoria } from '../models/mentoria.model';

/** Espeja MentoriaResponseDto del backend. */
interface MentoriaResponseDto {
  id_servicio: number;
  titulo: string;
  descripcion: string | null;
  area: string;
  fecha: string;
  hora_inicio: string;
  modalidad: string;
  provincia: string | null;
  link_o_canal: string | null;
  mentor: string;
  inscrito: boolean;
}

function iniciales(mentor: string): string {
  const partes = mentor.trim().split(/\s+/);
  const nombre = partes[0] ?? '';
  const apellido = partes[partes.length - 1] ?? '';
  return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();
}

function horaDesdeIso(iso: string): string {
  const fecha = new Date(iso);
  const horas = fecha.getUTCHours().toString().padStart(2, '0');
  const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
}

function aMentoria(dto: MentoriaResponseDto): Mentoria {
  return {
    id: dto.id_servicio,
    titulo: dto.titulo,
    descripcion: dto.descripcion ?? '',
    area: dto.area,
    mentorNombre: dto.mentor,
    mentorIniciales: iniciales(dto.mentor),
    fecha: dto.fecha,
    horaInicio: horaDesdeIso(dto.hora_inicio),
    modalidad: dto.modalidad as ModalidadMentoria,
    provincia: dto.provincia,
    linkOCanal: dto.link_o_canal ?? undefined,
    inscrito: dto.inscrito,
  };
}

@Injectable({ providedIn: 'root' })
export class Mentorias {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private readonly baseUrl = `${this.config.apiUrl}/beneficiarios`;

  getMentorias(): Observable<Mentoria[]> {
    return this.http
      .get<MentoriaResponseDto[]>(`${this.baseUrl}/mentorias`)
      .pipe(map((dtos) => dtos.map(aMentoria)));
  }

  getMentoriaPorId(id: number): Observable<Mentoria> {
    return this.http
      .get<MentoriaResponseDto>(`${this.baseUrl}/mentorias/${id}`)
      .pipe(map(aMentoria));
  }

  getMisMentorias(): Observable<Mentoria[]> {
    return this.http
      .get<MentoriaResponseDto[]>(`${this.baseUrl}/mis-mentorias`)
      .pipe(map((dtos) => dtos.map(aMentoria)));
  }
}
