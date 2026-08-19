import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard-page';
import { AdminReportsService } from '../../services/admin-reports.service';
import { By } from '@angular/platform-browser';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let mockAdminReportsService: any;

  beforeEach(async () => {
    // Default mock implementation
    mockAdminReportsService = {
      getMetrics: async () => ({
        totalActiveJobOffers: 0,
        totalAcceptedCandidates: 0,
        averageMatchPercentage: null
      }),
      exportExcel: async () => new Blob(),
      exportPdf: async () => new Blob()
    };
    
    // Create spies on the mock object
    vi.spyOn(mockAdminReportsService, 'getMetrics');
    vi.spyOn(mockAdminReportsService, 'exportExcel');
    vi.spyOn(mockAdminReportsService, 'exportPdf');

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        { provide: AdminReportsService, useValue: mockAdminReportsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load metrics on init', () => {
    expect(mockAdminReportsService.getMetrics).toHaveBeenCalledWith('30d');
  });

  it('should display "Todavía no hay datos" when metrics are 0 or null', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    
    const elements = fixture.debugElement.queryAll(By.css('.italic.text-gray-400'));
    expect(elements.length).toBe(3);
    expect(elements[0].nativeElement.textContent.trim()).toBe('Todavía no hay datos');
  });

  it('should display metric values when data is present', async () => {
    mockAdminReportsService.getMetrics.mockResolvedValue({
      totalActiveJobOffers: 15,
      totalAcceptedCandidates: 5,
      averageMatchPercentage: 85
    });
    
    // Manually trigger reload
    await component.loadMetrics();
    fixture.detectChanges();
    await fixture.whenStable();

    const activeJobs = fixture.debugElement.query(By.css('[data-testid="metric-active-jobs"]')).nativeElement.textContent;
    expect(activeJobs.trim()).toBe('15');

    const acceptedCandidates = fixture.debugElement.query(By.css('[data-testid="metric-accepted-candidates"]')).nativeElement.textContent;
    expect(acceptedCandidates.trim()).toBe('5');

    const matchPercentage = fixture.debugElement.query(By.css('[data-testid="metric-match-percentage"]')).nativeElement.textContent;
    expect(matchPercentage.trim()).toBe('85%');
  });

  it('should call exportExcel when clicking excel export button', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const excelButton = buttons.find(b => b.nativeElement.textContent.trim() === 'Exportar Excel');
    excelButton!.triggerEventHandler('click', null);
    expect(mockAdminReportsService.exportExcel).toHaveBeenCalledWith('30d');
  });

  it('should call exportPdf when clicking pdf export button', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const pdfButton = buttons.find(b => b.nativeElement.textContent.trim() === 'Exportar PDF');
    pdfButton!.triggerEventHandler('click', null);
    expect(mockAdminReportsService.exportPdf).toHaveBeenCalledWith('30d');
  });

  it('should reload metrics when changing time filter', async () => {
    const button = fixture.debugElement.queryAll(By.css('button')).find(
      btn => btn.nativeElement.textContent.trim() === 'Último Año'
    );
    button?.triggerEventHandler('click', null);
    expect(mockAdminReportsService.getMetrics).toHaveBeenCalledWith('1y');
  });
});
