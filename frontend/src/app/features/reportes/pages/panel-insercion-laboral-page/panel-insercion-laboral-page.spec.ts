import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInsercionLaboralPage } from './panel-insercion-laboral-page';

describe('PanelInsercionLaboralPage', () => {
  let component: PanelInsercionLaboralPage;
  let fixture: ComponentFixture<PanelInsercionLaboralPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelInsercionLaboralPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelInsercionLaboralPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
