import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PerfilBeneficiarioPage } from './perfil-beneficiario-page';

const PERFIL_URL = 'http://localhost:3000/beneficiarios/me';

/** Respuesta real de GET /beneficiarios/me (BeneficiarioPerfilResponseDto). */
const PERFIL_DTO = {
  id_usuario: 1,
  email: 'camila.gomez@example.com',
  nombre: 'Camila',
  apellido: 'Gómez',
  dni: '30123456',
  fecha_nacimiento: '2001-05-14',
  telefono: '351-555-0102',
  direccion: 'Av. Colón 1234, 3º B',
  ciudad: { id_ciudad: 1, nombre: 'Córdoba', provincia: 'Córdoba' },
  linkedin: 'https://linkedin.com/in/camila-gomez',
  github: 'https://github.com/camilagomez',
  cv_url: '',
  habilidades: ['Atención al cliente', 'Excel', 'HTML/CSS', 'Trabajo en equipo'],
  areas_interes: ['Desarrollo web / Tecnología', 'Mentorías', 'Primer empleo'],
};

function flushGetPerfil(
  httpMock: HttpTestingController,
  overrides: Partial<typeof PERFIL_DTO> = {},
): void {
  httpMock
    .expectOne({ url: PERFIL_URL, method: 'GET' })
    .flush({ ...PERFIL_DTO, ...overrides });
}

function flushPatchPerfil(
  httpMock: HttpTestingController,
  overrides: Partial<typeof PERFIL_DTO> = {},
): void {
  httpMock
    .expectOne({ url: PERFIL_URL, method: 'PATCH' })
    .flush({ ...PERFIL_DTO, ...overrides });
}

/** Respuestas reales de /catalogos/*: HABILIDADES/AREAS_INTERES solo tienen nombre, sin categoría. */
function flushCatalogos(httpMock: HttpTestingController): void {
  httpMock
    .expectOne('http://localhost:3000/catalogos/habilidades')
    .flush([
      { nombre: 'Carnet de conducir' },
      { nombre: 'Excel' },
      { nombre: 'Atención al cliente' },
      { nombre: 'HTML/CSS' },
      { nombre: 'Trabajo en equipo' },
    ]);
  // El perfil mock ya trae 'Desarrollo web / Tecnología', 'Mentorías' y 'Primer empleo'
  // seleccionadas: se agrega 'Trabajo social' para que quede al menos una opción disponible.
  httpMock
    .expectOne('http://localhost:3000/catalogos/areas-interes')
    .flush(
      ['Desarrollo web / Tecnología', 'Mentorías', 'Primer empleo', 'Trabajo social'].map(
        (nombre) => ({ nombre }),
      ),
    );
}

describe('PerfilBeneficiarioPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilBeneficiarioPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the loaded perfil data', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const perfil = fixture.componentInstance['perfil']()!;

    expect(compiled.querySelector('.profile-nombre')?.textContent).toContain(perfil.nombre);
    expect(compiled.textContent).toContain(perfil.email);
    expect(compiled.textContent).toContain(perfil.dni);
  });

  it('should not render an edit button next to email, DNI or ubicación (solo lectura)', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const filas = Array.from(compiled.querySelectorAll('.dato-row'));

    const filaEmail = filas.find((fila) => fila.querySelector('dt')?.textContent === 'Email');
    const filaDni = filas.find((fila) => fila.querySelector('dt')?.textContent === 'DNI');
    const filaUbicacion = filas.find((fila) => fila.querySelector('dt')?.textContent === 'Ubicación');

    expect(filaEmail?.querySelector('.btn-editar')).toBeNull();
    expect(filaDni?.querySelector('.btn-editar')).toBeNull();
    expect(filaUbicacion?.querySelector('.btn-editar')).toBeNull();
    expect(filaUbicacion?.textContent).toContain('Córdoba, Córdoba');
  });

  it('should render fecha de nacimiento, dirección y teléfono as editable fields', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const filas = Array.from(compiled.querySelectorAll('.dato-row'));

    for (const etiqueta of ['Fecha de nacimiento', 'Dirección', 'Teléfono']) {
      const fila = filas.find((f) => f.querySelector('dt')?.textContent === etiqueta);
      expect(fila?.querySelector('.btn-editar')).not.toBeNull();
    }
  });

  it('should allow editing and saving the teléfono', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const filaTelefono = Array.from(compiled.querySelectorAll('.dato-row')).find(
      (fila) => fila.querySelector('dt')?.textContent === 'Teléfono',
    )!;
    (filaTelefono.querySelector('.btn-editar') as HTMLButtonElement).click();
    fixture.detectChanges();

    const input = compiled.querySelector('.dato-edicion .input-edicion') as HTMLInputElement;
    input.value = '351-555-9999';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    (compiled.querySelector('.dato-edicion .btn-guardar') as HTMLButtonElement).click();
    flushPatchPerfil(httpMock, { telefono: '351-555-9999' });
    fixture.detectChanges();

    expect(component['perfil']()?.telefono).toBe('351-555-9999');
    expect(component['edicionActiva']()).toBeNull();
  });

  it('should mask the teléfono input, keeping only digits grouped as XXX-XXX-XXXX', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const filaTelefono = Array.from(compiled.querySelectorAll('.dato-row')).find(
      (fila) => fila.querySelector('dt')?.textContent === 'Teléfono',
    )!;
    (filaTelefono.querySelector('.btn-editar') as HTMLButtonElement).click();
    fixture.detectChanges();

    const input = compiled.querySelector('.dato-edicion .input-edicion') as HTMLInputElement;
    input.value = '35a15550102xyz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('351-555-0102');

    (compiled.querySelector('.dato-edicion .btn-guardar') as HTMLButtonElement).click();
    flushPatchPerfil(httpMock, { telefono: '351-555-0102' });
    fixture.detectChanges();

    expect(component['perfil']()?.telefono).toBe('351-555-0102');
  });

  it('should use a native date input for fecha de nacimiento and display it formatted', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('14/05/2001');

    const filaFecha = Array.from(compiled.querySelectorAll('.dato-row')).find(
      (fila) => fila.querySelector('dt')?.textContent === 'Fecha de nacimiento',
    )!;
    (filaFecha.querySelector('.btn-editar') as HTMLButtonElement).click();
    fixture.detectChanges();

    const input = compiled.querySelector('.dato-edicion .input-edicion') as HTMLInputElement;
    expect(input.type).toBe('date');
    expect(input.value).toBe('2001-05-14');

    input.value = '1999-01-20';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (compiled.querySelector('.dato-edicion .btn-guardar') as HTMLButtonElement).click();
    flushPatchPerfil(httpMock, { fecha_nacimiento: '1999-01-20' });
    fixture.detectChanges();

    expect(component['perfil']()?.fechaNacimiento).toBe('1999-01-20');
  });

  it('should render habilidades and áreas de interés as editable tags with distinct colors', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.tag-habilidad').length).toBeGreaterThan(0);
    expect(compiled.querySelectorAll('.tag-interes').length).toBeGreaterThan(0);

    const sections = Array.from(compiled.querySelectorAll('.section'));
    const seccionHabilidades = sections.find((s) => s.querySelector('.section-title')?.textContent === 'Habilidades');
    const seccionIntereses = sections.find(
      (s) => s.querySelector('.section-title')?.textContent === 'Áreas de interés',
    );

    expect(seccionHabilidades?.querySelector('.btn-editar[aria-label="Editar habilidades"]')).not.toBeNull();
    expect(seccionIntereses?.querySelector('.btn-editar[aria-label="Editar áreas de interés"]')).not.toBeNull();
  });

  it('should add a habilidad from the autocomplete dropdown, without allowing free text', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    flushCatalogos(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(component['perfil']()?.habilidades).not.toContain('Carnet de conducir');

    (compiled.querySelector('.btn-editar[aria-label="Editar habilidades"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const buscador = compiled.querySelector('.tag-buscador .input-edicion') as HTMLInputElement;
    buscador.value = 'carnet';
    buscador.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const opciones = Array.from(compiled.querySelectorAll('.tag-opcion')) as HTMLButtonElement[];
    expect(opciones.length).toBeGreaterThan(0);
    expect(opciones.every((o) => o.textContent!.toLowerCase().includes('carnet'))).toBe(true);

    opciones.find((o) => o.textContent?.trim() === 'Carnet de conducir')!.click();
    fixture.detectChanges();

    (compiled.querySelector('.tags-edicion .btn-guardar') as HTMLButtonElement).click();
    httpMock
      .expectOne({ url: `${PERFIL_URL}/habilidades`, method: 'PUT' })
      .flush({ ...PERFIL_DTO, habilidades: [...PERFIL_DTO.habilidades, 'Carnet de conducir'] });
    fixture.detectChanges();

    expect(component['perfil']()?.habilidades).toContain('Carnet de conducir');
  });

  it('should not group either dropdown by categoría (HABILIDADES has no categoría column)', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    flushCatalogos(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    (compiled.querySelector('.btn-editar[aria-label="Editar habilidades"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.tag-dropdown-categoria').length).toBe(0);
    expect(compiled.querySelectorAll('.tag-opcion').length).toBeGreaterThan(0);

    (compiled.querySelector('.tags-edicion .btn-cancelar') as HTMLButtonElement).click();
    fixture.detectChanges();

    (compiled.querySelector('.btn-editar[aria-label="Editar áreas de interés"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.tag-dropdown-categoria').length).toBe(0);
    expect(compiled.querySelectorAll('.tag-opcion').length).toBeGreaterThan(0);
  });

  it('should remove an existing tag from áreas de interés', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cantidadOriginal = component['perfil']()!.areasInteres.length;
    const tagAQuitar = component['perfil']()!.areasInteres[0];

    (compiled.querySelector('.btn-editar[aria-label="Editar áreas de interés"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    (compiled.querySelector(`.tag-quitar[aria-label="Quitar ${tagAQuitar}"]`) as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.tags-edicion .tag').length).toBe(cantidadOriginal - 1);

    (compiled.querySelector('.tags-edicion .btn-guardar') as HTMLButtonElement).click();
    httpMock
      .expectOne({ url: `${PERFIL_URL}/areas-interes`, method: 'PUT' })
      .flush({ ...PERFIL_DTO, areas_interes: PERFIL_DTO.areas_interes.filter((a) => a !== tagAQuitar) });
    fixture.detectChanges();

    expect(component['perfil']()?.areasInteres).not.toContain(tagAQuitar);
  });

  it('should discard tag changes when canceling la edición de habilidades', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    flushCatalogos(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const habilidadesOriginales = [...component['perfil']()!.habilidades];

    (compiled.querySelector('.btn-editar[aria-label="Editar habilidades"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const buscador = compiled.querySelector('.tag-buscador .input-edicion') as HTMLInputElement;
    buscador.value = 'carnet';
    buscador.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (compiled.querySelector('.tag-opcion') as HTMLButtonElement).click();
    fixture.detectChanges();

    (compiled.querySelector('.tags-edicion .btn-cancelar') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component['perfil']()?.habilidades).toEqual(habilidadesOriginales);
    expect(compiled.querySelector('.tags-edicion')).toBeNull();
  });

  it('should allow editing enlaces and persist the values', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    (compiled.querySelector('.btn-editar[aria-label="Editar enlaces"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const [linkedinInput, , cvInput] = Array.from(
      compiled.querySelectorAll('.enlaces-edicion .input-edicion'),
    ) as HTMLInputElement[];

    linkedinInput.value = 'https://linkedin.com/in/nueva-url';
    linkedinInput.dispatchEvent(new Event('input'));
    cvInput.value = 'https://example.com/cv.pdf';
    cvInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    (compiled.querySelector('.enlaces-edicion ~ .edicion-acciones .btn-guardar') as HTMLButtonElement).click();
    flushPatchPerfil(httpMock, {
      linkedin: 'https://linkedin.com/in/nueva-url',
      cv_url: 'https://example.com/cv.pdf',
    });
    fixture.detectChanges();

    expect(component['perfil']()?.enlaces.linkedin).toBe('https://linkedin.com/in/nueva-url');
    expect(component['perfil']()?.enlaces.cvUrl).toBe('https://example.com/cv.pdf');
    expect(compiled.querySelector('.enlaces-list a[href="https://example.com/cv.pdf"]')).toBeTruthy();
  });
});
