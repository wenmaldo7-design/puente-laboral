import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PerfilOrganizacionPage } from './perfil-organizacion-page';

describe('PerfilOrganizacionPage', () => {
  let component: PerfilOrganizacionPage;
  let fixture: ComponentFixture<PerfilOrganizacionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilOrganizacionPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilOrganizacionPage);
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

  it('should display verified organization badge and company name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.verified-badge')?.textContent).toContain('Organización Verificada');
    expect(compiled.querySelector('.profile-nombre')?.textContent).toContain('InnovarTech');
  });

  it('should open and close inline edit for general info section', () => {
    const editBtn = fixture.nativeElement.querySelector('.btn-edit') as HTMLButtonElement;
    editBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#nombreFantasia')).toBeTruthy();

    const cancelBtn = fixture.nativeElement.querySelector('.btn-cancel') as HTMLButtonElement;
    cancelBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#nombreFantasia')).toBeFalsy();
  });
});
