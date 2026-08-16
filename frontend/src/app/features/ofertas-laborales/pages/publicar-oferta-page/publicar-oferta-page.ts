import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { extraerMensajeDeError } from '../../../../core/http/api-error';
import { toCrearOfertaLaboralDto } from '../../models/crear-oferta-laboral.mapper';
import { ModalidadOferta } from '../../models/oferta-laboral.model';
import { OfertasLaborales } from '../../services/ofertas-laborales';

function fechaHoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function esEntero(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as number | null;
  return valor === null || Number.isInteger(valor) ? null : { noEntero: true };
}

@Component({
  selector: 'app-publicar-oferta-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './publicar-oferta-page.html',
  styleUrl: './publicar-oferta-page.css',
})
export class PublicarOfertaPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ofertasLaborales = inject(OfertasLaborales);
  private readonly router = inject(Router);

  protected readonly minFechaLimite = fechaHoyISO();

  protected readonly areas = signal<string[]>([]);
  protected readonly habilidadesCatalogo = signal<string[]>([]);
  protected readonly tiposContrato = signal<string[]>([]);
  protected readonly filtroHabilidad = signal('');

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: [''],
    area: ['', [Validators.required]],
    tipo_contrato: [''],
    modalidad: this.fb.nonNullable.control<ModalidadOferta | ''>('', [Validators.required]),
    salario: this.fb.control<number | null>(null, [Validators.min(0.01)]),
    vacantes: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), esEntero]),
    fecha_limite: ['', [Validators.required]],
    habilidades: this.fb.nonNullable.control<string[]>([]),
  });

  protected readonly habilidadesFiltradas = computed(() => {
    const termino = this.filtroHabilidad().trim().toLowerCase();
    const catalogo = this.habilidadesCatalogo();
    return termino ? catalogo.filter((h) => h.toLowerCase().includes(termino)) : catalogo;
  });

  ngOnInit(): void {
    this.ofertasLaborales.getCatalogoAreas().subscribe((areas) => this.areas.set(areas));
    this.ofertasLaborales
      .getCatalogoHabilidades()
      .subscribe((habilidades) => this.habilidadesCatalogo.set(habilidades));
    this.ofertasLaborales
      .getCatalogoTiposContrato()
      .subscribe((tipos) => this.tiposContrato.set(tipos));
  }

  protected onFiltroHabilidadInput(event: Event): void {
    this.filtroHabilidad.set((event.target as HTMLInputElement).value);
  }

  protected estaSeleccionada(nombre: string): boolean {
    return this.form.controls.habilidades.value.includes(nombre);
  }

  protected toggleHabilidad(nombre: string): void {
    const actuales = this.form.controls.habilidades.value;
    const nuevas = actuales.includes(nombre)
      ? actuales.filter((h) => h !== nombre)
      : [...actuales, nombre];
    this.form.controls.habilidades.setValue(nuevas);
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorGeneral.set(null);

    this.ofertasLaborales.crear(toCrearOfertaLaboralDto(this.form.getRawValue())).subscribe({
      next: () => {
        this.enviando.set(false);
        this.enviado.set(true);
      },
      error: (err: unknown) => {
        this.enviando.set(false);
        this.errorGeneral.set(
          err instanceof HttpErrorResponse
            ? extraerMensajeDeError(err.error, 'No pudimos publicar la oferta. Probá de nuevo.')
            : 'No pudimos publicar la oferta. Probá de nuevo.',
        );
      },
    });
  }

  protected volverAlHome(): void {
    this.router.navigateByUrl('/empresas/home');
  }
}
