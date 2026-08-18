import { Component, input } from '@angular/core';

export type IconName =
  | 'user'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'shield-check'
  | 'building'
  | 'hash'
  | 'calendar'
  | 'phone'
  | 'map-pin'
  | 'link'
  | 'file-text'
  | 'arrow-left'
  | 'bridge'
  | 'mail'
  | 'github';

/**
 * Set de iconos propios (no exporta ningun logo/marca de terceros),
 * lineales, 24x24, para no depender de una libreria de iconos externa.
 * No son un export exacto del archivo de Figma: son una aproximacion
 * visual, hecha a mano, al mismo estilo (trazo fino, sin relleno).
 */
@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.css',
})
export class Icon {
  readonly name = input.required<IconName>();
}
