import { TestBed } from '@angular/core/testing';
import { Header } from './header';

describe('Header', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(Header);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the greeting with the given nombre', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentInstance.nombre = 'Camila';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.app-header-greeting')?.textContent).toContain('Camila');
  });

  it('should show the badge with the unread count when greater than zero', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentInstance.notificacionesNoLeidas = 3;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.app-header-badge-count')?.textContent).toContain('3');
  });

  it('should hide the badge when there are no unread notifications', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentInstance.notificacionesNoLeidas = 0;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.app-header-badge-count')).toBeNull();
  });
});
