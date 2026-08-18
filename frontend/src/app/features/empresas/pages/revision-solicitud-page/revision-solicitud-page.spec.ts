import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { RevisionSolicitudPage } from './revision-solicitud-page';

describe('RevisionSolicitudPage', () => {
  let component: RevisionSolicitudPage;
  let fixture: ComponentFixture<RevisionSolicitudPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisionSolicitudPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RevisionSolicitudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
