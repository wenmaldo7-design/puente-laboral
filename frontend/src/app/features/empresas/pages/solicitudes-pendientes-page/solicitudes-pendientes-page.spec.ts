import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { SolicitudesPendientesPage } from './solicitudes-pendientes-page';

describe('SolicitudesPendientesPage', () => {
  let component: SolicitudesPendientesPage;
  let fixture: ComponentFixture<SolicitudesPendientesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesPendientesPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesPendientesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
