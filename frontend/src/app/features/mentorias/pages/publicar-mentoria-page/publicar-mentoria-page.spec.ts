import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicarMentoriaPage } from './publicar-mentoria-page';

describe('PublicarMentoriaPage', () => {
  let component: PublicarMentoriaPage;
  let fixture: ComponentFixture<PublicarMentoriaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicarMentoriaPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicarMentoriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
