import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCursoPage } from './detalle-curso-page';

describe('DetalleCursoPage', () => {
  let component: DetalleCursoPage;
  let fixture: ComponentFixture<DetalleCursoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCursoPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCursoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
