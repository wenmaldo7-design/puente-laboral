import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PublicarMentoriaPage } from './publicar-mentoria-page';

const API_URL = 'http://localhost:3000';

async function crearFixture(): Promise<{
  fixture: ComponentFixture<PublicarMentoriaPage>;
  httpMock: HttpTestingController;
}> {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [PublicarMentoriaPage],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  }).compileComponents();

  const fixture = TestBed.createComponent(PublicarMentoriaPage);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();

  httpMock.expectOne(`${API_URL}/catalogos/areas-interes`).flush([{ nombre: 'Tecnología' }]);
  httpMock.expectOne(`${API_URL}/catalogos/provincias`).flush([{ nombre: 'Buenos Aires' }]);
  fixture.detectChanges();

  return { fixture, httpMock };
}

describe('PublicarMentoriaPage', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the component and load the catalogs', async () => {
    const { fixture } = await crearFixture();
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
