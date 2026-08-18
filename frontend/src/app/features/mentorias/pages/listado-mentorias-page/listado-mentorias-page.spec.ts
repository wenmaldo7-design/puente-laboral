import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ListadoMentoriasPage } from './listado-mentorias-page';

describe('ListadoMentoriasPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoMentoriasPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ListadoMentoriasPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load the mock mentorías', () => {
    const fixture = TestBed.createComponent(ListadoMentoriasPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['mentorias']().length).toBeGreaterThan(0);
  });

  it('should default to the "todas" filter and show every mentoría', () => {
    const fixture = TestBed.createComponent(ListadoMentoriasPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['filtroActivo']()).toBe('todas');
    expect(component['mentoriasFiltradas']().length).toBe(component['mentorias']().length);
  });

  it('should filter mentorías by the selected modalidad', () => {
    const fixture = TestBed.createComponent(ListadoMentoriasPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component['seleccionarFiltro']('virtual');
    fixture.detectChanges();

    const filtradas = component['mentoriasFiltradas']();
    expect(filtradas.length).toBeGreaterThan(0);
    expect(filtradas.every((mentoria) => mentoria.modalidad === 'virtual')).toBe(true);
  });

  it('should filter mentorías by the search term', () => {
    const fixture = TestBed.createComponent(ListadoMentoriasPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const terminoExistente = component['mentorias']()[0].titulo.slice(0, 5);
    component['terminoBusqueda'].set(terminoExistente);
    fixture.detectChanges();

    expect(component['mentoriasFiltradas']().length).toBeGreaterThan(0);

    component['terminoBusqueda'].set('término que no existe en ningún mock');
    fixture.detectChanges();

    expect(component['mentoriasFiltradas']().length).toBe(0);
  });

  it('should render a "Ver detalle" link for each mentoría pointing to its id', () => {
    const fixture = TestBed.createComponent(ListadoMentoriasPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const enlaces = Array.from(compiled.querySelectorAll('.btn-detalle')) as HTMLAnchorElement[];
    const mentorias = component['mentorias']();

    expect(enlaces.length).toBe(mentorias.length);
    expect(enlaces[0].getAttribute('href')).toContain(mentorias[0].id);
  });
});
