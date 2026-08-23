import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { Cursos } from '../../services/cursos';
import { Curso } from '../../models/curso.model';
import { PerfilBeneficiarioService } from '../../../beneficiarios/services/perfil-beneficiario.service';
import { PerfilBeneficiario } from '../../../beneficiarios/models/perfil-beneficiario.model';
import { Notificaciones } from '../../../notificaciones/services/notificaciones';

@Component({
  selector: 'app-listado-cursos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './listado-cursos-page.html',
  styleUrl: './listado-cursos-page.css',
})
export class ListadoCursosPage implements OnInit {
  private readonly cursosService = inject(Cursos);
  private readonly perfilBeneficiarioService = inject(PerfilBeneficiarioService);
  private readonly notificacionesService = inject(Notificaciones);
  
  public perfil = toSignal<PerfilBeneficiario | null>(
    this.perfilBeneficiarioService.getPerfil(),
    { initialValue: null },
  );
  public nombreBeneficiario = computed(() => this.perfil()?.nombre.split(' ')[0] ?? '');
  public notificacionesNoLeidas = this.notificacionesService.contadorNoLeidas;

  public cursos = signal<Curso[]>([]);
  public modalidadFilter = signal<string>('');
  public provinciaFilter = signal<string>('');
  public terminoBusqueda = signal<string>('');
  
  public cursosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().trim().toLowerCase();
    return this.cursos().filter(curso => {
      if (!termino) return true;
      return curso.titulo.toLowerCase().includes(termino) || 
             curso.organizacionNombre.toLowerCase().includes(termino);
    });
  });
  
  ngOnInit(): void {
    this.cargarCursos();
    this.notificacionesService.refrescarContador();
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
  
  onBusquedaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
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
