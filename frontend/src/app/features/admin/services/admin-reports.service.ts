import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';

export interface AdminMetricsResponse {
  totalActiveJobOffers: number;
  totalAcceptedCandidates: number;
  averageMatchPercentage: number | null;
}

export type TimeRange = '30d' | '1y' | 'all';

@Injectable({
  providedIn: 'root',
})
export class AdminReportsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private readonly baseUrl = `${this.config.apiUrl}/admin-reports`;

  async getMetrics(timeRange: TimeRange): Promise<AdminMetricsResponse> {
    return firstValueFrom(
      this.http.get<AdminMetricsResponse>(`${this.baseUrl}/metrics`, {
        params: { timeRange },
      })
    );
  }

  async exportExcel(timeRange: TimeRange): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/export/excel`, {
        params: { timeRange },
        responseType: 'blob',
      })
    );
  }

  async exportPdf(timeRange: TimeRange): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/export/pdf`, {
        params: { timeRange },
        responseType: 'blob',
      })
    );
  }
}
