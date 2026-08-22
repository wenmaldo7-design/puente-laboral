import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminReportsService, AdminMetricsResponse, TimeRange } from '../../services/admin-reports.service';
import { Auth } from '../../../auth/services/auth';
import { Router, RouterLink } from '@angular/router';
import { Header } from '../../../../shared/ui/header/header';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, Header],
  templateUrl: './dashboard-page.html',
  styleUrls: []
})
export class DashboardPage implements OnInit {
  private readonly reportsService = inject(AdminReportsService);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly timeRange = signal<TimeRange>('30d');
  readonly metrics = signal<AdminMetricsResponse | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  get maxServiceCount(): number {
    const m = this.metrics();
    if (!m) return 1;
    const max = Math.max(
      m.servicesBreakdown.offers,
      m.servicesBreakdown.courses,
      m.servicesBreakdown.mentorships
    );
    return max > 0 ? max : 1;
  }

  formatState(state: string): string {
    return state.replace(/_/g, ' ');
  }

  async ngOnInit(): Promise<void> {
    await this.loadMetrics();
  }

  async setTimeRange(range: TimeRange): Promise<void> {
    this.timeRange.set(range);
    await this.loadMetrics();
  }

  async loadMetrics(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.reportsService.getMetrics(this.timeRange());
      this.metrics.set(data);
    } catch (e) {
      this.error.set('Error al cargar las métricas');
      this.metrics.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async exportExcel(): Promise<void> {
    try {
      const blob = await this.reportsService.exportExcel(this.timeRange());
      this.downloadBlob(blob, `reporte_${this.timeRange()}.xlsx`);
    } catch (e) {
      this.error.set('Error al exportar a Excel');
    }
  }

  async exportPdf(): Promise<void> {
    try {
      const blob = await this.reportsService.exportPdf(this.timeRange());
      this.downloadBlob(blob, `reporte_${this.timeRange()}.pdf`);
    } catch (e) {
      this.error.set('Error al exportar a PDF');
    }
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  async cerrarSesion(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }
}
