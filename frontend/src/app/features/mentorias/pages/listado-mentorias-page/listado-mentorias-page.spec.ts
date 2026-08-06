import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoMentoriasPage } from './listado-mentorias-page';

describe('ListadoMentoriasPage', () => {
  let component: ListadoMentoriasPage;
  let fixture: ComponentFixture<ListadoMentoriasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoMentoriasPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoMentoriasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
