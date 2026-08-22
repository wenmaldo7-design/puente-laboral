import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MentoriasEmpresaService } from '../../services/mentorias-empresa.service';

@Component({
  selector: 'app-publicar-mentoria-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './publicar-mentoria-page.html',
  styleUrl: './publicar-mentoria-page.css',
})
export class PublicarMentoriaPage {
  private fb = inject(FormBuilder);
  private mentoriasService = inject(MentoriasEmpresaService);
  private router = inject(Router);

  mentoriaForm: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: [''],
    requisitos: ['', [Validators.required]],
    duracion_minutos: [60, [Validators.required, Validators.min(1)]],
    id_area: [1, [Validators.required]],
    fecha: ['', [Validators.required]],
    hora_inicio: ['', [Validators.required]],
    modalidad: ['virtual', [Validators.required]],
    link_o_canal: [''],
  });

  onSubmit() {
    if (this.mentoriaForm.valid) {
      this.mentoriasService.crearMentoria(this.mentoriaForm.value).subscribe({
        next: () => {
          this.router.navigate(['/']); // Redirect to home or dashboard
        },
        error: (err) => {
          console.error('Error al crear mentoría', err);
        }
      });
    }
  }
}
