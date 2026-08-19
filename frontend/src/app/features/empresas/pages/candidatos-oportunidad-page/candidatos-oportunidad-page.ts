import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../../../core/config/app-config';
import { EmpresaHomeService } from '../../services/empresa-home.service';
import { DatePipe } from '@angular/common';

export interface CandidatoOportunidad {
  id_postulacion: number;
  id_usuario_beneficiario: number;
  nombre: string;
  apellido: string;
  email: string;
  fecha_postulacion: string;
  estado_postulacion: string;
  cv_url?: string;
  carta_presentacion?: string;
}

@Component({
  selector: 'app-candidatos-oportunidad-page',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './candidatos-oportunidad-page.html',
  styleUrl: './candidatos-oportunidad-page.css',
})
export class CandidatosOportunidadPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private readonly empresaHomeService = inject(EmpresaHomeService);

  candidatos = signal<CandidatoOportunidad[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarCandidatos(Number(id));
    }
  }

  cargarCandidatos(idServicio: number) {
    this.http.get<CandidatoOportunidad[]>(`${this.config.apiUrl}/empresas/ofertas-laborales/${idServicio}/candidatos`)
      .subscribe({
        next: (data) => {
          this.candidatos.set(data);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los candidatos.');
          this.cargando.set(false);
        }
      });
  }

  onCambioEstado(idPostulacion: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    const nuevoEstado = select.value;
    const estadoAnterior = this.candidatos().find(c => c.id_postulacion === idPostulacion)?.estado_postulacion;

    this.empresaHomeService.actualizarEstadoPostulacion(idPostulacion, nuevoEstado).subscribe({
      next: () => {
        this.candidatos.update(cands => cands.map(c => 
          c.id_postulacion === idPostulacion ? { ...c, estado_postulacion: nuevoEstado } : c
        ));
      },
      error: (err) => {
        select.value = estadoAnterior || 'pendiente';
        const msg = err.error?.message || 'Error al actualizar el estado.';
        alert(Array.isArray(msg) ? msg.join('\n') : msg);
      }
    });
  }
}
