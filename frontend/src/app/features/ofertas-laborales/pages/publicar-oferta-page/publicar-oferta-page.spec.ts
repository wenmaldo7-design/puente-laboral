import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicarOfertaPage } from './publicar-oferta-page';

describe('PublicarOfertaPage', () => {
  let component: PublicarOfertaPage;
  let fixture: ComponentFixture<PublicarOfertaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicarOfertaPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicarOfertaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
