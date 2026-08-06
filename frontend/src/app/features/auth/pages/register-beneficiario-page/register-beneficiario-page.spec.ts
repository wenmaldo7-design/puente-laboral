import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { RegisterBeneficiarioPage } from './register-beneficiario-page';

describe('RegisterBeneficiarioPage', () => {
  let component: RegisterBeneficiarioPage;
  let fixture: ComponentFixture<RegisterBeneficiarioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterBeneficiarioPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterBeneficiarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
