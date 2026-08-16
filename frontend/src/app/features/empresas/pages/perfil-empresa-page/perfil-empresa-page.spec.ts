import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PerfilEmpresaPage } from './perfil-empresa-page';

describe('PerfilEmpresaPage', () => {
  let component: PerfilEmpresaPage;
  let fixture: ComponentFixture<PerfilEmpresaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilEmpresaPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilEmpresaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // getPerfil() ahora es real (GET /auth/empresa/me vía Empresas): se flushea acá,
    // con el mismo mock que usaba antes esta página, para no reescribir cada test.
    const httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('http://localhost:3000/auth/empresa/me').flush({
      id_usuario: 101,
      email: 'contacto@innovartech.org.ar',
      razon_social: 'InnovarTech',
      cuit: '30-71234567-9',
      descripcion: 'Empresa de tecnología comprometida con la inclusión laboral.',
      sitio_web: 'https://innovartech.org.ar',
      logo_url: null,
      habilitada_operativamente: true,
      fecha_habilitacion: '2026-01-01',
    });
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
    expect(compiled.querySelector('.verified-badge')?.textContent).toContain('Empresa Verificada');
    expect(compiled.querySelector('.profile-nombre')?.textContent).toContain('InnovarTech');
  });

  it('should open and close inline edit for "Sobre la Empresa" section', () => {
    const editBtn = fixture.nativeElement.querySelector('.btn-edit') as HTMLButtonElement;
    editBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#sobreNosotros')).toBeTruthy();

    const cancelBtn = fixture.nativeElement.querySelector('.btn-cancel') as HTMLButtonElement;
    cancelBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#sobreNosotros')).toBeFalsy();
  });
});
