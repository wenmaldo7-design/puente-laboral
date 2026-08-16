import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HabilidadCatalogo } from '../../models/perfil-beneficiario.model';
import {
  GuardarTagsEvento,
  PerfilHabilidadesSection,
  SeccionTags,
} from './perfil-habilidades-section';

const CATALOGO_HABILIDADES: HabilidadCatalogo[] = [
  { nombre: 'Albañilería', categoria: 'Construcción y oficios' },
  { nombre: 'Carnet de conducir', categoria: 'Logística y transporte' },
  { nombre: 'Excel', categoria: 'Administración y oficina' },
];

const CATALOGO_AREAS_INTERES: string[] = [
  'Desarrollo web / Tecnología',
  'Mentorías',
  'Primer empleo',
];

/**
 * Simula el rol del padre real (PerfilBeneficiarioPage): decide si concede
 * la edición reflejando `pedirEdicion` en `activo`, y aplica `guardar` a su
 * propio estado. Así se prueba el componente a través del mismo contrato
 * input/output que usa el padre, sin depender de su implementación.
 */
@Component({
  selector: 'app-host-test',
  imports: [PerfilHabilidadesSection],
  template: `
    <app-perfil-habilidades-section
      [habilidades]="habilidades()"
      [areasInteres]="areasInteres()"
      [catalogoHabilidades]="catalogoHabilidades"
      [catalogoAreasInteres]="catalogoAreasInteres"
      [activo]="activo()"
      (pedirEdicion)="activo.set($event)"
      (guardar)="onGuardar($event)"
      (cancelar)="activo.set(null)"
    />
  `,
})
class HostTestComponent {
  readonly habilidades = signal(['Atención al cliente', 'Excel']);
  readonly areasInteres = signal(['Mentorías', 'Primer empleo']);
  readonly catalogoHabilidades = CATALOGO_HABILIDADES;
  readonly catalogoAreasInteres = CATALOGO_AREAS_INTERES;
  readonly activo = signal<SeccionTags | null>(null);
  ultimoGuardado: GuardarTagsEvento | null = null;

  onGuardar(evento: GuardarTagsEvento): void {
    this.ultimoGuardado = evento;
    if (evento.seccion === 'habilidades') this.habilidades.set(evento.tags);
    else this.areasInteres.set(evento.tags);
    this.activo.set(null);
  }
}

describe('PerfilHabilidadesSection', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostTestComponent],
    }).compileComponents();
  });

  it('should render habilidades and áreas de interés as editable tags with distinct colors', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.tag-habilidad').length).toBeGreaterThan(0);
    expect(compiled.querySelectorAll('.tag-interes').length).toBeGreaterThan(0);

    const sections = Array.from(compiled.querySelectorAll('.section'));
    const seccionHabilidades = sections.find(
      (s) => s.querySelector('.section-title')?.textContent === 'Habilidades',
    );
    const seccionIntereses = sections.find(
      (s) => s.querySelector('.section-title')?.textContent === 'Áreas de interés',
    );

    expect(
      seccionHabilidades?.querySelector('.btn-editar[aria-label="Editar habilidades"]'),
    ).not.toBeNull();
    expect(
      seccionIntereses?.querySelector('.btn-editar[aria-label="Editar áreas de interés"]'),
    ).not.toBeNull();
  });

  it('should add a habilidad from the autocomplete dropdown, without allowing free text', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    (
      compiled.querySelector('.btn-editar[aria-label="Editar habilidades"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(host.habilidades()).not.toContain('Carnet de conducir');

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
    fixture.detectChanges();

    expect(host.habilidades()).toContain('Carnet de conducir');
    expect(host.ultimoGuardado?.seccion).toBe('habilidades');
  });

  it('should group the habilidades dropdown by categoría, but not the áreas de interés one', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    (
      compiled.querySelector('.btn-editar[aria-label="Editar habilidades"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    const categoriasHabilidades = compiled.querySelectorAll('.tag-dropdown-categoria');
    expect(categoriasHabilidades.length).toBeGreaterThan(1);
    expect(categoriasHabilidades[0].textContent).toContain('Construcción y oficios');

    (compiled.querySelector('.tags-edicion .btn-cancelar') as HTMLButtonElement).click();
    fixture.detectChanges();

    (
      compiled.querySelector(
        '.btn-editar[aria-label="Editar áreas de interés"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.tag-dropdown-categoria').length).toBe(0);
    expect(compiled.querySelectorAll('.tag-opcion').length).toBeGreaterThan(0);
  });

  it('should remove an existing tag from áreas de interés', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cantidadOriginal = host.areasInteres().length;
    const tagAQuitar = host.areasInteres()[0];

    (
      compiled.querySelector(
        '.btn-editar[aria-label="Editar áreas de interés"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    (
      compiled.querySelector(`.tag-quitar[aria-label="Quitar ${tagAQuitar}"]`) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.tags-edicion .tag').length).toBe(cantidadOriginal - 1);

    (compiled.querySelector('.tags-edicion .btn-guardar') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(host.areasInteres()).not.toContain(tagAQuitar);
  });

  it('should discard tag changes when canceling the edición de habilidades', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const habilidadesOriginales = [...host.habilidades()];

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

    (compiled.querySelector('.tags-edicion .btn-cancelar') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(host.habilidades()).toEqual(habilidadesOriginales);
    expect(compiled.querySelector('.tags-edicion')).toBeNull();
  });

  it('should report hayCambiosSinGuardar only while its own section is active and dirty', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    const seccion = fixture.debugElement.query(By.directive(PerfilHabilidadesSection))
      .componentInstance as PerfilHabilidadesSection;

    expect(seccion.hayCambiosSinGuardar()).toBe(false);

    host.activo.set('habilidades');
    fixture.detectChanges();
    expect(seccion.hayCambiosSinGuardar()).toBe(false);

    const compiled = fixture.nativeElement as HTMLElement;
    const buscador = compiled.querySelector('.tag-buscador .input-edicion') as HTMLInputElement;
    buscador.value = 'carnet';
    buscador.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (compiled.querySelector('.tag-opcion') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(seccion.hayCambiosSinGuardar()).toBe(true);

    host.activo.set(null);
    fixture.detectChanges();
    expect(seccion.hayCambiosSinGuardar()).toBe(false);
  });
});
