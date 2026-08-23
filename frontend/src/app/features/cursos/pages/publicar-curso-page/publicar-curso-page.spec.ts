import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { PublicarCursoPage } from './publicar-curso-page';

describe('PublicarCursoPage', () => {
  let component: PublicarCursoPage;
  let fixture: ComponentFixture<PublicarCursoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicarCursoPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicarCursoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
