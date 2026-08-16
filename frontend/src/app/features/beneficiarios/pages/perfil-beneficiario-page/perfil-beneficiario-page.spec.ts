import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PerfilBeneficiarioPage } from './perfil-beneficiario-page';

describe('PerfilBeneficiarioPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilBeneficiarioPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the loaded perfil data', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const perfil = fixture.componentInstance['perfil']()!;

    expect(compiled.querySelector('.profile-nombre')?.textContent).toContain(perfil.nombre);
    expect(compiled.textContent).toContain(perfil.email);
    expect(compiled.textContent).toContain(perfil.dni);
  });

  it('should not render an edit button next to email or DNI', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const filas = Array.from(compiled.querySelectorAll('.dato-row'));

    const filaEmail = filas.find((fila) => fila.querySelector('dt')?.textContent === 'Email');
    const filaDni = filas.find((fila) => fila.querySelector('dt')?.textContent === 'DNI');

    expect(filaEmail?.querySelector('.btn-editar')).toBeNull();
    expect(filaDni?.querySelector('.btn-editar')).toBeNull();
  });

  it('should render the perfil-info-personal child with the current values', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const perfil = fixture.componentInstance['perfil']()!;

    expect(compiled.querySelector('app-perfil-info-personal')).not.toBeNull();
    expect(compiled.textContent).toContain(perfil.ubicacion);
    expect(compiled.textContent).toContain(perfil.direccion);
    expect(compiled.textContent).toContain(perfil.telefono);
  });

  it('should save a campo simple edit from the child section into the perfil signal', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const filaUbicacion = Array.from(compiled.querySelectorAll('.dato-row')).find(
      (fila) => fila.querySelector('dt')?.textContent === 'Ubicación',
    )!;
    (filaUbicacion.querySelector('.btn-editar') as HTMLButtonElement).click();
    fixture.detectChanges();

    const input = compiled.querySelector('.dato-edicion .input-edicion') as HTMLInputElement;
    input.value = 'Buenos Aires, Argentina';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    (compiled.querySelector('.dato-edicion .btn-guardar') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component['perfil']()?.ubicacion).toBe('Buenos Aires, Argentina');
    expect(component['edicionActiva']()).toBeNull();
  });

  it('should ask for confirmation before discarding unsaved campo simple changes when switching to another section', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
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

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    (
      compiled.querySelector('.btn-editar[aria-label="Editar sobre mí"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(confirmSpy).toHaveBeenCalledWith('Tenés cambios sin guardar, ¿querés descartarlos?');
    expect(component['edicionActiva']()).toBe('telefono');
    expect(compiled.querySelector('.dato-edicion')).not.toBeNull();
  });

  it('should discard changes when canceling the edición de sobre mí', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const sobreMiOriginal = component['perfil']()?.sobreMi;

    (
      compiled.querySelector('.btn-editar[aria-label="Editar sobre mí"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    const textarea = compiled.querySelector('.textarea-edicion') as HTMLTextAreaElement;
    textarea.value = 'Un texto distinto';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    (compiled.querySelector('.btn-cancelar') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component['perfil']()?.sobreMi).toBe(sobreMiOriginal);
    expect(compiled.querySelector('.textarea-edicion')).toBeNull();
  });

  it('should edit a single experiencia entry without affecting the others', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const primeraEntrada = component['perfil']()!.experiencia[0];
    const segundaEntradaOriginal = { ...component['perfil']()!.experiencia[1] };

    component['iniciarEdicionEntrada']('experiencia', primeraEntrada);
    component['entradaForm'].controls.titulo.setValue('Nuevo puesto');
    component['guardarEntrada']('experiencia', primeraEntrada.id);
    fixture.detectChanges();

    expect(component['perfil']()!.experiencia[0].titulo).toBe('Nuevo puesto');
    expect(component['perfil']()!.experiencia[1]).toEqual(segundaEntradaOriginal);
  });

  it('should ask for confirmation before discarding unsaved changes when switching entries', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const primeraEntrada = component['perfil']()!.experiencia[0];
    const segundaEntrada = component['perfil']()!.experiencia[1];

    component['iniciarEdicionEntrada']('experiencia', primeraEntrada);
    component['entradaForm'].controls.titulo.setValue('Cambio sin guardar');
    component['entradaForm'].controls.titulo.markAsDirty();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    component['iniciarEdicionEntrada']('experiencia', segundaEntrada);

    expect(confirmSpy).toHaveBeenCalledWith('Tenés cambios sin guardar, ¿querés descartarlos?');
    expect(component['edicionActiva']()).toBe(
      component['claveEntrada']('experiencia', primeraEntrada.id),
    );
    expect(component['entradaForm'].controls.titulo.value).toBe('Cambio sin guardar');
  });

  it('should switch entries and discard changes when the user confirms', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const primeraEntrada = component['perfil']()!.experiencia[0];
    const segundaEntrada = component['perfil']()!.experiencia[1];

    component['iniciarEdicionEntrada']('experiencia', primeraEntrada);
    component['entradaForm'].controls.titulo.setValue('Cambio sin guardar');
    component['entradaForm'].controls.titulo.markAsDirty();

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component['iniciarEdicionEntrada']('experiencia', segundaEntrada);

    expect(component['edicionActiva']()).toBe(
      component['claveEntrada']('experiencia', segundaEntrada.id),
    );
    expect(component['entradaForm'].controls.titulo.value).toBe(segundaEntrada.titulo);
  });

  it('should switch entries without asking when there are no unsaved changes', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const primeraEntrada = component['perfil']()!.experiencia[0];
    const segundaEntrada = component['perfil']()!.experiencia[1];

    component['iniciarEdicionEntrada']('experiencia', primeraEntrada);

    const confirmSpy = vi.spyOn(window, 'confirm');
    component['iniciarEdicionEntrada']('experiencia', segundaEntrada);

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(component['edicionActiva']()).toBe(
      component['claveEntrada']('experiencia', segundaEntrada.id),
    );
  });

  it('should render the perfil-habilidades-section child with the current tags', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-perfil-habilidades-section')).not.toBeNull();
    expect(compiled.querySelectorAll('.tag-habilidad').length).toBeGreaterThan(0);
    expect(compiled.querySelectorAll('.tag-interes').length).toBeGreaterThan(0);
  });

  it('should save a tag edit from the child section into the perfil signal', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    (
      compiled.querySelector('.btn-editar[aria-label="Editar habilidades"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    const buscador = compiled.querySelector('.tag-buscador .input-edicion') as HTMLInputElement;
    buscador.value = 'carnet';
    buscador.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (compiled.querySelector('.tag-opcion') as HTMLButtonElement).click();
    fixture.detectChanges();

    (compiled.querySelector('.tags-edicion .btn-guardar') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component['perfil']()?.habilidades).toContain('Carnet de conducir');
    expect(component['edicionActiva']()).toBeNull();
  });

  it('should ask for confirmation before discarding unsaved tag changes when switching to another section', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    (
      compiled.querySelector('.btn-editar[aria-label="Editar habilidades"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    const buscador = compiled.querySelector('.tag-buscador .input-edicion') as HTMLInputElement;
    buscador.value = 'carnet';
    buscador.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (compiled.querySelector('.tag-opcion') as HTMLButtonElement).click();
    fixture.detectChanges();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    (
      compiled.querySelector('.btn-editar[aria-label="Editar sobre mí"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(confirmSpy).toHaveBeenCalledWith('Tenés cambios sin guardar, ¿querés descartarlos?');
    expect(component['edicionActiva']()).toBe('habilidades');
    expect(compiled.querySelector('.tags-edicion')).not.toBeNull();
  });

  it('should allow editing enlaces and persist the values', () => {
    const fixture = TestBed.createComponent(PerfilBeneficiarioPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    (
      compiled.querySelector('.btn-editar[aria-label="Editar enlaces"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    const [linkedinInput, , cvInput] = Array.from(
      compiled.querySelectorAll('.enlaces-edicion .input-edicion'),
    ) as HTMLInputElement[];

    linkedinInput.value = 'https://linkedin.com/in/nueva-url';
    linkedinInput.dispatchEvent(new Event('input'));
    cvInput.value = 'https://example.com/cv.pdf';
    cvInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    (
      compiled.querySelector(
        '.enlaces-edicion ~ .edicion-acciones .btn-guardar',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(component['perfil']()?.enlaces.linkedin).toBe('https://linkedin.com/in/nueva-url');
    expect(component['perfil']()?.enlaces.cvUrl).toBe('https://example.com/cv.pdf');
    expect(
      compiled.querySelector('.enlaces-list a[href="https://example.com/cv.pdf"]'),
    ).toBeTruthy();
  });
});
