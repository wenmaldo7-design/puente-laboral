import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

/** Logo + "Puente Laboral" + subtítulo — repetido en login y register. */
@Component({
  selector: 'app-brand-header',
  imports: [Icon],
  templateUrl: './brand-header.html',
  styleUrl: './brand-header.css',
})
export class BrandHeader {
  readonly subtitulo = input.required<string>();
}
