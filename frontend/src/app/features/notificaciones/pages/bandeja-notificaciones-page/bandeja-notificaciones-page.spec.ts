import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BandejaNotificacionesPage } from './bandeja-notificaciones-page';

const NOTIFICACIONES_URL = 'http://localhost:3000/notificaciones';

/** Respuestas reales de GET /notificaciones (NotificacionResponseDto[]). */
const NOTIFICACIONES_DTO = [
  {
    id: 1,
    tipo: 'MENTORIA_INSCRIPCION',
    mensaje: 'Te inscribiste a la mentoría "Diseño UX".',
    fecha_envio: '2026-08-10T14:00:00.000Z',
    leida: false,
  },
  {
    id: 2,
    tipo: 'POSTULACION_ENVIADA',
    mensaje: 'Te postulaste a "Desarrollador Jr" en Acme.',
    fecha_envio: '2026-08-05T14:00:00.000Z',
    leida: true,
  },
];

function flushListar(httpMock: HttpTestingController, dtos: unknown[] = NOTIFICACIONES_DTO): void {
  httpMock.expectOne({ url: NOTIFICACIONES_URL, method: 'GET' }).flush(dtos);
}

function flushContador(httpMock: HttpTestingController, cantidad = 0): void {
  httpMock.expectOne({ url: `${NOTIFICACIONES_URL}/no-leidas`, method: 'GET' }).flush({ cantidad });
}

describe('BandejaNotificacionesPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BandejaNotificacionesPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(BandejaNotificacionesPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render each notificación with its mensaje and distinguish unread from read', () => {
    const fixture = TestBed.createComponent(BandejaNotificacionesPage);
    fixture.detectChanges();
    flushListar(httpMock);
    flushContador(httpMock, 1);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const items = Array.from(compiled.querySelectorAll('.notificacion-item'));
    expect(items.length).toBe(2);
    expect(compiled.textContent).toContain('Te inscribiste a la mentoría "Diseño UX".');
    expect(items[0].classList.contains('no-leida')).toBe(true);
    expect(items[1].classList.contains('no-leida')).toBe(false);
  });

  it('should show an empty state when there are no notificaciones', () => {
    const fixture = TestBed.createComponent(BandejaNotificacionesPage);
    fixture.detectChanges();
    flushListar(httpMock, []);
    flushContador(httpMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.empty-state')?.textContent).toContain('Todavía no tenés notificaciones');
  });

  it('should only show "Marcar todas como leídas" when there is at least one unread', () => {
    const fixture = TestBed.createComponent(BandejaNotificacionesPage);
    fixture.detectChanges();
    flushListar(httpMock, [NOTIFICACIONES_DTO[1]]);
    flushContador(httpMock, 0);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.btn-marcar-todas')).toBeNull();
  });

  it('should mark an unread notificación as read on click', () => {
    const fixture = TestBed.createComponent(BandejaNotificacionesPage);
    fixture.detectChanges();
    flushListar(httpMock);
    flushContador(httpMock, 1);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const boton = compiled.querySelector('.notificacion-item.no-leida .notificacion-btn') as HTMLButtonElement;
    boton.click();

    httpMock
      .expectOne({ url: `${NOTIFICACIONES_URL}/1/leida`, method: 'PATCH' })
      .flush({ ...NOTIFICACIONES_DTO[0], leida: true });
    flushContador(httpMock, 0);
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.notificacion-item.no-leida').length).toBe(0);
  });

  it('should mark all as read when clicking "Marcar todas como leídas"', () => {
    const fixture = TestBed.createComponent(BandejaNotificacionesPage);
    fixture.detectChanges();
    flushListar(httpMock);
    flushContador(httpMock, 1);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    (compiled.querySelector('.btn-marcar-todas') as HTMLButtonElement).click();

    httpMock.expectOne({ url: `${NOTIFICACIONES_URL}/leidas`, method: 'PATCH' }).flush(null);
    flushContador(httpMock, 0);
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.notificacion-item.no-leida').length).toBe(0);
    expect(compiled.querySelector('.btn-marcar-todas')).toBeNull();
  });
});
