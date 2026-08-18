import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandejaNotificacionesPage } from './bandeja-notificaciones-page';

describe('BandejaNotificacionesPage', () => {
  let component: BandejaNotificacionesPage;
  let fixture: ComponentFixture<BandejaNotificacionesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BandejaNotificacionesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BandejaNotificacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
