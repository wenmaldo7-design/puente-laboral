import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineaDeTiempoBeneficiarioPage } from './linea-de-tiempo-beneficiario-page';

describe('LineaDeTiempoBeneficiarioPage', () => {
  let component: LineaDeTiempoBeneficiarioPage;
  let fixture: ComponentFixture<LineaDeTiempoBeneficiarioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineaDeTiempoBeneficiarioPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineaDeTiempoBeneficiarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
