import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Landing pública (sin sesión): venía de `main` con Tailwind por CDN, acá
 * queda con Tailwind instalado como build step normal del proyecto.
 */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
})
export class HomePage {}
