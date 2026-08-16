import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CampoSimple, GuardarCampoEvento, PerfilInfoPersonal } from './perfil-info-personal';

/**
 * Simula el rol del padre real (PerfilBeneficiarioPage): decide si concede
 * la edición reflejando `pedirEdicion` en `activo`, y aplica `guardar` a su
 * propio estado. Así se prueba el componente a través del mismo contrato
 * input/output que usa el padre, sin depender de su implementación.
 */
@Component({
  selector: 'app-host-test',
  imports: [PerfilInfoPersonal],
  template: `
    <app-perfil-info-personal
      [fechaNacimiento]="fechaNacimiento()"
      [ubicacion]="ubicacion()"
      [direccion]="direccion()"
      [telefono]="telefono()"
      [activo]="activo()"
      (pedirEdicion)="activo.set($event)"
      (guardar)="onGuardar($event)"
      (cancelar)="activo.set(null)"
    />
  `,
})
class HostTestComponent {
  readonly fechaNacimiento = signal('2001-05-14');
  readonly ubicacion = signal('Córdoba, Argentina');
  readonly direccion = signal('Av. Colón 1234, 3º B');
  readonly telefono = signal('351-555-0102');
  readonly activo = signal<CampoSimple | null>(null);
  ultimoGuardado: GuardarCampoEvento | null = null;

  onGuardar(evento: GuardarCampoEvento): void {
    this.ultimoGuardado = evento;
    switch (evento.campo) {
      case 'fechaNacimiento':
        this.fechaNacimiento.set(evento.valor);
        break;
      case 'ubicacion':
        this.ubicacion.set(evento.valor);
        break;
      case 'direccion':
        this.direccion.set(evento.valor);
        break;
      case 'telefono':
        this.telefono.set(evento.valor);
        break;
    }
    this.activo.set(null);
  }
}

describe('PerfilInfoPersonal', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostTestComponent],
    }).compileComponents();
  });

  it('should render fecha de nacimiento, ubicación, dirección y teléfono as editable fields', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const filas = Array.from(compiled.querySelectorAll('.dato-row'));

    for (const etiqueta of ['Fecha de nacimiento', 'Ubicación', 'Dirección', 'Teléfono']) {
      const fila = filas.find((f) => f.querySelector('dt')?.textContent === etiqueta);
      expect(fila?.querySelector('.btn-editar')).not.toBeNull();
    }
  });

  it('should allow editing and saving the ubicación', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    const host = fixture.componentInstance;
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

    expect(host.ubicacion()).toBe('Buenos Aires, Argentina');
    expect(host.ultimoGuardado).toEqual({ campo: 'ubicacion', valor: 'Buenos Aires, Argentina' });
    expect(host.activo()).toBeNull();
  });

  it('should allow editing and saving the teléfono', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    const host = fixture.componentInstance;
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
    fixture.detectChanges();

    expect(host.telefono()).toBe('351-555-9999');
    expect(host.activo()).toBeNull();
  });

  it('should mask the teléfono input, keeping only digits grouped as XXX-XXX-XXXX', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    const host = fixture.componentInstance;
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
    fixture.detectChanges();

    expect(host.telefono()).toBe('351-555-0102');
  });

  it('should use a native date input for fecha de nacimiento and display it formatted', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    const host = fixture.componentInstance;
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
    fixture.detectChanges();

    expect(host.fechaNacimiento()).toBe('1999-01-20');
  });

  it('should discard changes when canceling the edición de un campo', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const direccionOriginal = host.direccion();

    const filaDireccion = Array.from(compiled.querySelectorAll('.dato-row')).find(
      (fila) => fila.querySelector('dt')?.textContent === 'Dirección',
    )!;
    (filaDireccion.querySelector('.btn-editar') as HTMLButtonElement).click();
    fixture.detectChanges();

    const input = compiled.querySelector('.dato-edicion .input-edicion') as HTMLInputElement;
    input.value = 'Otra dirección';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    (compiled.querySelector('.dato-edicion .btn-cancelar') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(host.direccion()).toBe(direccionOriginal);
    expect(compiled.querySelector('.dato-edicion')).toBeNull();
  });

  it('should report hayCambiosSinGuardar only while its own field is active and dirty', () => {
    const fixture = TestBed.createComponent(HostTestComponent);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    const info = fixture.debugElement.query(By.directive(PerfilInfoPersonal))
      .componentInstance as PerfilInfoPersonal;

    expect(info.hayCambiosSinGuardar()).toBe(false);

    host.activo.set('ubicacion');
    fixture.detectChanges();
    expect(info.hayCambiosSinGuardar()).toBe(false);

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('.dato-edicion .input-edicion') as HTMLInputElement;
    input.value = 'Otra ciudad';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(info.hayCambiosSinGuardar()).toBe(true);

    // Volver al valor original hace que deje de considerarse "sin guardar".
    input.value = host.ubicacion();
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(info.hayCambiosSinGuardar()).toBe(false);

    host.activo.set(null);
    fixture.detectChanges();
    expect(info.hayCambiosSinGuardar()).toBe(false);
  });
});
