import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MentoriasEmpresaService, CreateMentoriaDto } from '../../services/mentorias-empresa.service';
import { OfertasLaborales } from '../../../ofertas-laborales/services/ofertas-laborales';
import { HttpErrorResponse } from '@angular/common/http';
import { extraerMensajeDeError } from '../../../../core/http/api-error';

function fechaHoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-publicar-mentoria-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './publicar-mentoria-page.html',
  styleUrl: './publicar-mentoria-page.css',
})
export class PublicarMentoriaPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mentoriasService = inject(MentoriasEmpresaService);
  private readonly ofertasLaborales = inject(OfertasLaborales); // Reuse this for catalogs
  private readonly router = inject(Router);

  protected readonly minFechaLimite = fechaHoyISO();

  protected readonly areas = signal<string[]>([]);
  protected readonly provincias = signal<string[]>([]);

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);

  mentoriaForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: [''],
    requisitos: ['', [Validators.required]],
    duracion_minutos: [60, [Validators.required, Validators.min(1)]],
    area: ['', [Validators.required]],
    fecha: ['', [Validators.required]],
    hora_inicio: ['', [Validators.required]],
    modalidad: ['', [Validators.required]],
    link_o_canal: [''],
    provincia: [''],
  });

  ngOnInit(): void {
    this.ofertasLaborales.getCatalogoAreas().subscribe((areas) => this.areas.set(areas));
    this.ofertasLaborales.getCatalogoProvincias().subscribe((provincias) => this.provincias.set(provincias));

    this.mentoriaForm.controls.modalidad.valueChanges.subscribe((modalidad) => {
      const provinciaCtrl = this.mentoriaForm.controls.provincia;
      if (modalidad === 'presencial' || modalidad === 'hibrida') {
        provinciaCtrl.setValidators([Validators.required]);
      } else {
        provinciaCtrl.clearValidators();
      }
      provinciaCtrl.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.mentoriaForm.invalid) {
      this.mentoriaForm.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorGeneral.set(null);

    const formValue = this.mentoriaForm.getRawValue();

    const dto: CreateMentoriaDto = {
      titulo: formValue.titulo!,
      descripcion: formValue.descripcion || undefined,
      requisitos: formValue.requisitos!,
      duracion_minutos: formValue.duracion_minutos!,
      area: formValue.area!,
      fecha: formValue.fecha!,
      hora_inicio: formValue.hora_inicio!,
      modalidad: formValue.modalidad!,
      provincia: formValue.modalidad !== 'virtual' ? formValue.provincia || undefined : undefined,
      link_o_canal: formValue.link_o_canal || undefined
    };

    this.mentoriasService.crearMentoria(dto).subscribe({
      next: () => {
        this.enviando.set(false);
        this.enviado.set(true);
      },
      error: (err: unknown) => {
        this.enviando.set(false);
        this.errorGeneral.set(
          err instanceof HttpErrorResponse
            ? extraerMensajeDeError(err.error, 'No pudimos publicar la mentoría. Probá de nuevo.')
            : 'No pudimos publicar la mentoría. Probá de nuevo.',
        );
      }
    });
  }

  volverAlHome(): void {
    this.router.navigateByUrl('/empresas/home');
  }
}
