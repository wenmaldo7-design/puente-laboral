import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { extraerMensajeDeError } from '../../../../core/http/api-error';
import {
  EstadoSolicitud,
  SolicitudEmpresaResponseDto,
} from '../../models/solicitud-habilitacion.model';
import { SolicitudesHabilitacion } from '../../services/solicitudes-habilitacion';

const MS_ANTES_DE_VOLVER = 1500;

/** Panel admin: detalle de una solicitud, con acciones de aprobar/rechazar. */
@Component({
  selector: 'app-revision-solicitud-page',
  imports: [RouterLink, ReactiveFormsModule, DatePipe],
  templateUrl: './revision-solicitud-page.html',
  styleUrl: './revision-solicitud-page.css',
})
export class RevisionSolicitudPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly solicitudesService = inject(SolicitudesHabilitacion);

  protected readonly EstadoSolicitud = EstadoSolicitud;

  readonly solicitud = signal<SolicitudEmpresaResponseDto | null>(null);
  readonly cargando = signal(true);
  readonly procesando = signal(false);
  readonly error = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly mostrarModalRechazo = signal(false);

  readonly formRechazo = this.fb.nonNullable.group({
    motivo_rechazo: ['', [Validators.required]],
  });

  ngOnInit(): void {
    void this.cargar();
  }

  async aprobar(): Promise<void> {
    this.procesando.set(true);
    this.error.set(null);
    try {
      await this.solicitudesService.aprobar(this.idDeRuta());
      this.mensajeExito.set(
        'Solicitud aprobada. La empresa ya puede iniciar sesión con el email y la contraseña que ingresó en la solicitud.',
      );
      await this.volverAlListado();
    } catch (err) {
      this.error.set(this.mensajeDeError(err, 'No pudimos aprobar la solicitud.'));
    } finally {
      this.procesando.set(false);
    }
  }

  abrirModalRechazo(): void {
    this.formRechazo.reset();
    this.mostrarModalRechazo.set(true);
  }

  cerrarModalRechazo(): void {
    this.mostrarModalRechazo.set(false);
  }

  async confirmarRechazo(): Promise<void> {
    if (this.formRechazo.invalid) {
      this.formRechazo.markAllAsTouched();
      return;
    }

    this.procesando.set(true);
    this.error.set(null);
    try {
      await this.solicitudesService.rechazar(
        this.idDeRuta(),
        this.formRechazo.getRawValue(),
      );
      this.mostrarModalRechazo.set(false);
      this.mensajeExito.set('Solicitud rechazada.');
      await this.volverAlListado();
    } catch (err) {
      this.error.set(this.mensajeDeError(err, 'No pudimos rechazar la solicitud.'));
    } finally {
      this.procesando.set(false);
    }
  }

  private idDeRuta(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  private async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.solicitud.set(
        await this.solicitudesService.obtenerPorId(this.idDeRuta()),
      );
    } catch {
      this.error.set('No pudimos cargar la solicitud.');
    } finally {
      this.cargando.set(false);
    }
  }

  private async volverAlListado(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, MS_ANTES_DE_VOLVER));
    await this.router.navigateByUrl('/empresas/solicitudes');
  }

  private mensajeDeError(err: unknown, fallback: string): string {
    return extraerMensajeDeError(
      err instanceof HttpErrorResponse ? err.error : null,
      fallback,
    );
  }
}
