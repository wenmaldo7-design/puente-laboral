import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleMentoriaPage } from './detalle-mentoria-page';

describe('DetalleMentoriaPage', () => {
  let component: DetalleMentoriaPage;
  let fixture: ComponentFixture<DetalleMentoriaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleMentoriaPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleMentoriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
