import { Component, input } from '@angular/core';

/**
 * Chrome compartido de las pantallas de auth: fondo gris claro, card
 * blanca con barra superior en degrade azul, y footer opcional.
 */
@Component({
  selector: 'app-auth-card',
  imports: [],
  templateUrl: './auth-card.html',
  styleUrl: './auth-card.css',
})
export class AuthCard {
  readonly mostrarFooter = input(false);
}
