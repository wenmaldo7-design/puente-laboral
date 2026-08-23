import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cursos } from '../../services/cursos';
import { Curso } from '../../models/curso.model';

@Component({
  selector: 'app-listado-cursos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listado-cursos-page.html',
  styleUrl: './listado-cursos-page.css',
})
export class ListadoCursosPage implements OnInit {
  private readonly cursosService = inject(Cursos);
  
  public cursos = signal<Curso[]>([]);
  public modalidadFilter = signal<string>('');
  public provinciaFilter = signal<string>('');
  
  ngOnInit(): void {
    this.cargarCursos();
  }
  
  cargarCursos(): void {
    const filtros: any = {};
    if (this.modalidadFilter()) {
      filtros.modalidad = this.modalidadFilter();
    }
    if (this.provinciaFilter()) {
      filtros.provincia = this.provinciaFilter();
    }
    
    this.cursosService.getCursos(filtros).subscribe({
      next: (data) => {
        const disponibles = data.filter(c => c.cuposDisponibles > 0);
        this.cursos.set(disponibles);
      },
      error: (err) => console.error(err)
    });
  }
  
  aplicarFiltros(): void {
    this.cargarCursos();
  }
  
  public errorMensaje = signal<string | null>(null);
  
  inscribirse(cursoId: string): void {
    this.errorMensaje.set(null);
    this.cursosService.inscribirse(cursoId).subscribe({
      next: () => {
        this.cursos.update(cursos => 
          cursos.map(c => c.id === cursoId ? { ...c, estaInscripto: true } : c)
        );
      },
      error: () => {
        this.errorMensaje.set('El curso está lleno y no se pudo completar la inscripción.');
      }
    });
  }
  
  darseDeBaja(cursoId: string): void {
    this.cursosService.darseDeBaja(cursoId).subscribe({
      next: () => {
        this.cursos.update(cursos => 
          cursos.map(c => c.id === cursoId ? { ...c, estaInscripto: false } : c)
        );
      }
    });
  }
}
