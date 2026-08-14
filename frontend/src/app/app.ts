<<<<<<< HEAD
import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare global {
  interface Window {
    __env?: { apiUrl?: string };
  }
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  protected readonly statusCode = signal<number | null>(null);
  protected readonly healthResponse = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    const apiUrl = window.__env?.apiUrl ?? 'http://localhost:3000';

    this.http.get(`${apiUrl}/health`, { observe: 'response' }).subscribe({
      next: (response) => {
        this.statusCode.set(response.status);
        this.healthResponse.set(JSON.stringify(response.body));
      },
      error: (err) => {
        this.error.set(`Error consultando ${apiUrl}/health: ${err.message}`);
      },
    });
  }
}
=======
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'frontend';
}
>>>>>>> home
