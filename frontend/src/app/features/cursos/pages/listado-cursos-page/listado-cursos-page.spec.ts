import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ListadoCursosPage } from './listado-cursos-page';
import { Cursos } from '../../services/cursos';
import { of, throwError } from 'rxjs';
import { Curso } from '../../models/curso.model';
import { vi } from 'vitest';

describe('ListadoCursosPage', () => {
  let component: ListadoCursosPage;
  let fixture: ComponentFixture<ListadoCursosPage>;
  let cursosService: any;

  beforeEach(async () => {
    cursosService = {
      getCursos: vi.fn().mockReturnValue(of([])),
      inscribirse: vi.fn(),
      darseDeBaja: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ListadoCursosPage],
      providers: [
        { provide: Cursos, useValue: cursosService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoCursosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render courses with cuposDisponibles === 0', () => {
    const mockCursos: Curso[] = [
      { id: '1', titulo: 'Curso Lleno', cuposDisponibles: 0, cuposTotales: 10, descripcion: '', modalidad: 'remoto', organizacionNombre: '', provincia: 'cba', estaInscripto: false },
      { id: '2', titulo: 'Curso Disponible', cuposDisponibles: 5, cuposTotales: 10, descripcion: '', modalidad: 'remoto', organizacionNombre: '', provincia: 'cba', estaInscripto: false }
    ];
    cursosService.getCursos.mockReturnValue(of(mockCursos));
    (component as any).cargarCursos(); // Method to implement
    fixture.detectChanges();

    const titles = fixture.nativeElement.querySelectorAll('.curso-titulo');
    expect(titles.length).toBe(1);
    expect(titles[0].textContent).toContain('Curso Disponible');
  });

  it('should trigger Cursos service correctly when filtering', () => {
    (component as any).modalidadFilter.set('presencial');
    (component as any).provinciaFilter.set('cordoba');
    (component as any).aplicarFiltros();

    expect(cursosService.getCursos).toHaveBeenCalledWith({ modalidad: 'presencial', provincia: 'cordoba' });
  });

  it('should update estaInscripto to true when inscribirse is called', () => {
    const mockCursos: Curso[] = [
      { id: '2', titulo: 'Curso Disponible', cuposDisponibles: 5, cuposTotales: 10, descripcion: '', modalidad: 'remoto', organizacionNombre: '', provincia: 'cba', estaInscripto: false }
    ];
    cursosService.getCursos.mockReturnValue(of(mockCursos));
    cursosService.inscribirse.mockReturnValue(of(undefined));
    (component as any).cargarCursos();
    fixture.detectChanges();

    (component as any).inscribirse('2');
    fixture.detectChanges();

    expect((component as any).cursos().find((c: any) => c.id === '2').estaInscripto).toBe(true);
  });

  it('should display an error message when enrollment fails due to race condition', () => {
    const mockCursos: Curso[] = [
      { id: '2', titulo: 'Curso Disponible', cuposDisponibles: 5, cuposTotales: 10, descripcion: '', modalidad: 'remoto', organizacionNombre: '', provincia: 'cba', estaInscripto: false }
    ];
    cursosService.getCursos.mockReturnValue(of(mockCursos));
    cursosService.inscribirse.mockReturnValue(throwError(() => new Error('Course full')));
    (component as any).cargarCursos();
    fixture.detectChanges();

    (component as any).inscribirse('2');
    fixture.detectChanges();

    expect((component as any).errorMensaje()).toBe('El curso está lleno y no se pudo completar la inscripción.');
  });

  it('should update estaInscripto to false when darseDeBaja is called for successful unenrollment', () => {
    const mockCursos: Curso[] = [
      { id: '2', titulo: 'Curso Disponible', cuposDisponibles: 5, cuposTotales: 10, descripcion: '', modalidad: 'remoto', organizacionNombre: '', provincia: 'cba', estaInscripto: true }
    ];
    cursosService.getCursos.mockReturnValue(of(mockCursos));
    cursosService.darseDeBaja.mockReturnValue(of(undefined));
    (component as any).cargarCursos();
    fixture.detectChanges();

    (component as any).darseDeBaja('2');
    fixture.detectChanges();

    expect((component as any).cursos().find((c: any) => c.id === '2').estaInscripto).toBe(false);
  });

  it('should fetch all courses when clearing filters', () => {
    (component as any).modalidadFilter.set('presencial');
    (component as any).provinciaFilter.set('cordoba');
    (component as any).aplicarFiltros();
    
    // Clear filters
    (component as any).modalidadFilter.set('');
    (component as any).provinciaFilter.set('');
    (component as any).aplicarFiltros();

    expect(cursosService.getCursos).toHaveBeenCalledWith({});
  });
});
