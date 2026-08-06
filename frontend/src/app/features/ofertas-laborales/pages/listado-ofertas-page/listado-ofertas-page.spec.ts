import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoOfertasPage } from './listado-ofertas-page';

describe('ListadoOfertasPage', () => {
  let component: ListadoOfertasPage;
  let fixture: ComponentFixture<ListadoOfertasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoOfertasPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoOfertasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
