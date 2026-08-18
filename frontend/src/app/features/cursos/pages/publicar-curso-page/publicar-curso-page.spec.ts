import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicarCursoPage } from './publicar-curso-page';

describe('PublicarCursoPage', () => {
  let component: PublicarCursoPage;
  let fixture: ComponentFixture<PublicarCursoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicarCursoPage]
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
