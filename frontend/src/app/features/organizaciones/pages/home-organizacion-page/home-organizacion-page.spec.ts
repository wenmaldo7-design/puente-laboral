import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HomeOrganizacionPage } from './home-organizacion-page';

describe('HomeOrganizacionPage', () => {
  let component: HomeOrganizacionPage;
  let fixture: ComponentFixture<HomeOrganizacionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeOrganizacionPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeOrganizacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have working brand and user header links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const brandLink = compiled.querySelector('a.brand') as HTMLAnchorElement;
    const userLink = compiled.querySelector('a.header-user') as HTMLAnchorElement;

    expect(brandLink).toBeTruthy();
    expect(brandLink.getAttribute('routerlink') ?? brandLink.getAttribute('href')).toBeTruthy();
    expect(userLink).toBeTruthy();
    expect(userLink.getAttribute('routerlink') ?? userLink.getAttribute('href')).toBeTruthy();
  });

  it('should render main organization dashboard title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main-title')?.textContent).toContain('Panel de Organización');
  });

  it('should render metrics cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.metric-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should filter opportunities by search term', () => {
    const input = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
    input.value = 'Angular';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const titulos = fixture.nativeElement.querySelectorAll('.oportunidad-titulo');
    expect(titulos.length).toBe(1);
    expect(titulos[0].textContent).toContain('Angular');
  });

  it('should open and close publish opportunity modal', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal-backdrop')).toBeNull();

    const publishBtn = compiled.querySelector('.btn-primary') as HTMLButtonElement;
    publishBtn.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.modal-dialog')).toBeTruthy();
    expect(compiled.querySelector('.modal-title')?.textContent).toContain('Publicar Nueva Oportunidad');

    const closeBtn = compiled.querySelector('.btn-close') as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.modal-backdrop')).toBeNull();
  });

  it('should show error when submitting without required fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const publishBtn = compiled.querySelector('.btn-primary') as HTMLButtonElement;
    publishBtn.click();
    fixture.detectChanges();

    const form = compiled.querySelector('.modal-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(compiled.querySelector('.alert-error')).toBeTruthy();
    expect(compiled.querySelector('.alert-error')?.textContent).toContain('Por favor, ingresá el título');
  });

  it('should publish a new opportunity and add it to the list', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const initialCardsCount = compiled.querySelectorAll('.oportunidad-card').length;

    const publishBtn = compiled.querySelector('.btn-primary') as HTMLButtonElement;
    publishBtn.click();
    fixture.detectChanges();

    const tituloInput = compiled.querySelector('#opTitulo') as HTMLInputElement;
    tituloInput.value = 'Diseñador UI/UX Trainee';
    tituloInput.dispatchEvent(new Event('input'));

    const ubicacionInput = compiled.querySelector('#opUbicacion') as HTMLInputElement;
    ubicacionInput.value = 'Remoto - Argentina';
    ubicacionInput.dispatchEvent(new Event('input'));

    const form = compiled.querySelector('.modal-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(compiled.querySelector('.modal-backdrop')).toBeNull();
    const updatedCards = compiled.querySelectorAll('.oportunidad-card');
    expect(updatedCards.length).toBe(initialCardsCount + 1);
    expect(compiled.querySelector('.toast-success')).toBeTruthy();
    expect(compiled.querySelector('.oportunidad-titulo')?.textContent).toContain('Diseñador UI/UX Trainee');
  });
});

