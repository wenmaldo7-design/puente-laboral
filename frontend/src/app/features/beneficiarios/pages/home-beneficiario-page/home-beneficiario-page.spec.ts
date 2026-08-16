import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HomeBeneficiarioPage } from './home-beneficiario-page';

describe('HomeBeneficiarioPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeBeneficiarioPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the greeting with the beneficiario name', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main-title')?.textContent).toContain(
      fixture.componentInstance['nombreBeneficiario'](),
    );
  });

  it('should load the mock metrics, oportunidades and actualizaciones', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['metricas']().length).toBeGreaterThan(0);
    expect(component['oportunidades']().length).toBeGreaterThan(0);
    expect(component['actualizaciones']().length).toBeGreaterThan(0);
  });

  it('should default to the "todo" filter and show every oportunidad', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['filtroActivo']()).toBe('todo');
    expect(component['oportunidadesFiltradas']().length).toBe(component['oportunidades']().length);
  });

  it('should filter oportunidades by the selected pill', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component['seleccionarFiltro']('curso');
    fixture.detectChanges();

    const filtradas = component['oportunidadesFiltradas']();
    expect(filtradas.length).toBeGreaterThan(0);
    expect(filtradas.every((oportunidad) => oportunidad.tipo === 'curso')).toBe(true);
  });

  it('should filter oportunidades by the search term', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const terminoExistente = component['oportunidades']()[0].titulo.slice(0, 4);
    component['terminoBusqueda'].set(terminoExistente);
    fixture.detectChanges();

    expect(component['oportunidadesFiltradas']().length).toBeGreaterThan(0);

    component['terminoBusqueda'].set('término que no existe en ningún mock');
    fixture.detectChanges();

    expect(component['oportunidadesFiltradas']().length).toBe(0);
  });
});
