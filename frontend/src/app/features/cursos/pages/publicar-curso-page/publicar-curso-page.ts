import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CursosEmpresaService, CreateCursoDto } from '../../services/cursos-empresa.service';
import {
  AreaInteresCatalogoDto,
  OfertasLaborales,
} from '../../../ofertas-laborales/services/ofertas-laborales';
import { HttpErrorResponse } from '@angular/common/http';
import { extraerMensajeDeError } from '../../../../core/http/api-error';

function fechaHoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-publicar-curso-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './publicar-curso-page.html',
  styleUrl: './publicar-curso-page.css',
})
export class PublicarCursoPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cursosService = inject(CursosEmpresaService);
  private readonly ofertasLaborales = inject(OfertasLaborales); 
  private readonly router = inject(Router);

  protected readonly minFechaLimite = fechaHoyISO();

  protected readonly provincias = signal<string[]>([]);
  protected readonly areas = signal<AreaInteresCatalogoDto[]>([]);

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);

  cursoForm = this.fb.group({
    id_area: ['', [Validators.required]],
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: ['', [Validators.required]],
    cupos_totales: [30, [Validators.required, Validators.min(1)]],
    fecha: ['', [Validators.required]],
    modalidad: ['', [Validators.required]],
    provincia: [''],
  });

  ngOnInit(): void {
    this.ofertasLaborales.getCatalogoProvincias().subscribe((provs) => {
      this.provincias.set(provs);
    });

    this.ofertasLaborales.getCatalogoAreasConId().subscribe((areas) => {
      this.areas.set(areas);
    });

    this.cursoForm.controls.modalidad.valueChanges.subscribe((mod) => {
      if (mod === 'presencial') {
        this.cursoForm.controls.provincia.setValidators([Validators.required]);
      } else {
        this.cursoForm.controls.provincia.clearValidators();
        this.cursoForm.controls.provincia.setValue('');
      }
      this.cursoForm.controls.provincia.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.cursoForm.invalid) {
      this.cursoForm.markAllAsTouched();
      return;
    }

    this.errorGeneral.set(null);
    this.enviando.set(true);

    const val = this.cursoForm.value;
    const dto: CreateCursoDto = {
      id_area: Number(val.id_area),
      titulo: val.titulo!,
      descripcion: val.descripcion!,
      cupos_totales: Number(val.cupos_totales),
      fecha: val.fecha!,
      modalidad: val.modalidad!,
      provincia: val.provincia || undefined,
    };

    this.cursosService.crearCurso(dto).subscribe({
      next: () => {
        this.enviando.set(false);
        this.enviado.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.errorGeneral.set(extraerMensajeDeError(err, 'Ocurrió un error al crear el curso.'));
      },
    });
  }

  volverAlHome(): void {
    this.router.navigate(['/empresas/home']);
  }
}
