import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { DetalleMentoriaPage } from './detalle-mentoria-page';

async function crearFixture(id: string): Promise<ComponentFixture<DetalleMentoriaPage>> {
  await TestBed.configureTestingModule({
    imports: [DetalleMentoriaPage],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
      },
    ],
  }).compileComponents();

  return TestBed.createComponent(DetalleMentoriaPage);
}

describe('DetalleMentoriaPage', () => {
  it('should create the component', async () => {
    const fixture = await crearFixture('ment-1');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load the mentoría matching the route id', async () => {
    const fixture = await crearFixture('ment-1');
    fixture.detectChanges();

    expect(fixture.componentInstance['mentoria']()?.id).toBe('ment-1');
  });

  it('should show an empty state for an id that does not exist', async () => {
    const fixture = await crearFixture('no-existe');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.empty-state')?.textContent).toContain('No encontramos');
  });

  it('should not reveal the access link before inscribiéndose in a virtual mentoría', async () => {
    const fixture = await crearFixture('ment-1');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.link-acceso')).toBeNull();
    expect(compiled.querySelector('.btn-inscribirme')).not.toBeNull();
  });

  it('should reveal the access link after inscribiéndose in a virtual mentoría', async () => {
    const fixture = await crearFixture('ment-1');
    const component = fixture.componentInstance;
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.btn-inscribirme') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component['estaInscripto']()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.link-acceso')?.getAttribute('href')).toBe(component['mentoria']()?.linkOCanal);
    expect(compiled.querySelector('.btn-inscribirme')).toBeNull();
  });

  it('should not show an access link for a presencial mentoría even after inscribiéndose', async () => {
    const fixture = await crearFixture('ment-2');
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.btn-inscribirme') as HTMLButtonElement).click();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.link-acceso')).toBeNull();
    expect(compiled.querySelector('.inscripcion-confirmada')).not.toBeNull();
  });

  it('should allow darse de baja after inscribiéndose, hiding the link and showing "Inscribirme" again', async () => {
    const fixture = await crearFixture('ment-1');
    const component = fixture.componentInstance;
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.btn-inscribirme') as HTMLButtonElement).click();
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.btn-baja')).not.toBeNull();
    expect(compiled.querySelector('.link-acceso')).not.toBeNull();

    (compiled.querySelector('.btn-baja') as HTMLButtonElement).click();
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
    expect(component['estaInscripto']()).toBe(false);
    expect(compiled.querySelector('.link-acceso')).toBeNull();
    expect(compiled.querySelector('.btn-baja')).toBeNull();
    expect(compiled.querySelector('.btn-inscribirme')).not.toBeNull();
  });
});
