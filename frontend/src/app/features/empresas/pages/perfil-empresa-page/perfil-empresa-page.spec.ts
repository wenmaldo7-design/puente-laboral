import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilEmpresaPage } from './perfil-empresa-page';

describe('PerfilEmpresaPage', () => {
  let component: PerfilEmpresaPage;
  let fixture: ComponentFixture<PerfilEmpresaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilEmpresaPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilEmpresaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
