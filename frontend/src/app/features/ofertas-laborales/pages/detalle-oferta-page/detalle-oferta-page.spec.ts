import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleOfertaPage } from './detalle-oferta-page';

describe('DetalleOfertaPage', () => {
  let component: DetalleOfertaPage;
  let fixture: ComponentFixture<DetalleOfertaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleOfertaPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleOfertaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
