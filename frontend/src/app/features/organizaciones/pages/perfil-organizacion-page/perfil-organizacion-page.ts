import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PerfilOrganizacionService } from '../../services/perfil-organizacion.service';
import {
  EnlacesOrganizacion,
  PerfilOrganizacion,
} from '../../models/perfil-organizacion.model';

type SeccionEdicion =
  | 'general'
  | 'ubicacion'
  | 'sobreNosotros'
  | 'enlaces'
  | 'programas';

@Component({
  selector: 'app-perfil-organizacion-page',
  imports: [RouterLink],
  templateUrl: './perfil-organizacion-page.html',
  styleUrl: './perfil-organizacion-page.css',
})
export class PerfilOrganizacionPage implements OnInit {
  protected readonly perfil = signal<PerfilOrganizacion | null>(null);
  protected readonly notificacionesNoLeidas = signal(12);

  protected readonly edicionActiva = signal<SeccionEdicion | null>(null);

  // Drafts para edición inline
  protected readonly draftNombreFantasia = signal('');
  protected readonly draftSector = signal('');
  protected readonly draftTamano = signal<PerfilOrganizacion['tamano']>('51-200');

  protected readonly draftTelefono = signal('');
  protected readonly draftDireccion = signal('');
  protected readonly draftCiudad = signal('');
  protected readonly draftProvincia = signal('');

  protected readonly draftSobreNosotros = signal('');
  protected readonly draftEnlaces = signal<EnlacesOrganizacion>({});

  protected readonly catalogoSectores = signal<string[]>([]);
  protected readonly catalogoProgramas = signal<string[]>([]);
  protected readonly draftProgramas = signal<string[]>([]);
  protected readonly tagBusqueda = signal('');

  protected readonly programasFiltrados = computed(() => {
    const catalogo = this.catalogoProgramas();
    const termino = this.tagBusqueda().trim().toLowerCase();
    const seleccionados = new Set(this.draftProgramas());

    return catalogo.filter(
      (p) => !seleccionados.has(p) && (!termino || p.toLowerCase().includes(termino)),
    );
  });

  private readonly perfilService = inject(PerfilOrganizacionService);

  ngOnInit(): void {
    this.perfilService.getPerfil().subscribe((p) => this.perfil.set(p));
    this.perfilService.getCatalogoSectores().subscribe((s) => this.catalogoSectores.set(s));
    this.perfilService.getCatalogoProgramasInclusion().subscribe((pr) => this.catalogoProgramas.set(pr));
  }

  protected iniciarEdicion(seccion: SeccionEdicion): void {
    const p = this.perfil();
    if (!p) return;

    this.edicionActiva.set(seccion);

    switch (seccion) {
      case 'general':
        this.draftNombreFantasia.set(p.nombreFantasia);
        this.draftSector.set(p.sector);
        this.draftTamano.set(p.tamano);
        break;
      case 'ubicacion':
        this.draftTelefono.set(p.telefono);
        this.draftDireccion.set(p.direccion);
        this.draftCiudad.set(p.ciudad);
        this.draftProvincia.set(p.provincia);
        break;
      case 'sobreNosotros':
        this.draftSobreNosotros.set(p.sobreNosotros);
        break;
      case 'enlaces':
        this.draftEnlaces.set({ ...p.enlaces });
        break;
      case 'programas':
        this.draftProgramas.set([...p.programasInclusion]);
        this.tagBusqueda.set('');
        break;
    }
  }

  protected cancelarEdicion(): void {
    this.edicionActiva.set(null);
  }

  protected guardarEdicion(seccion: SeccionEdicion): void {
    const cambios: Partial<PerfilOrganizacion> = {};

    switch (seccion) {
      case 'general':
        cambios.nombreFantasia = this.draftNombreFantasia().trim();
        cambios.sector = this.draftSector();
        cambios.tamano = this.draftTamano();
        break;
      case 'ubicacion':
        cambios.telefono = this.draftTelefono().trim();
        cambios.direccion = this.draftDireccion().trim();
        cambios.ciudad = this.draftCiudad().trim();
        cambios.provincia = this.draftProvincia().trim();
        break;
      case 'sobreNosotros':
        cambios.sobreNosotros = this.draftSobreNosotros().trim();
        break;
      case 'enlaces':
        cambios.enlaces = { ...this.draftEnlaces() };
        break;
      case 'programas':
        cambios.programasInclusion = [...this.draftProgramas()];
        break;
    }

    this.perfilService.actualizarPerfil(cambios).subscribe((pActualizado) => {
      this.perfil.set(pActualizado);
      this.edicionActiva.set(null);
    });
  }

  // Manejo de máscara de teléfono automática
  protected onTelefonoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 10);
    let formateado = digitos;

    if (digitos.length > 6) {
      formateado = `${digitos.slice(0, 3)}-${digitos.slice(3, 6)}-${digitos.slice(6)}`;
    } else if (digitos.length > 3) {
      formateado = `${digitos.slice(0, 3)}-${digitos.slice(3)}`;
    }

    input.value = formateado;
    this.draftTelefono.set(formateado);
  }

  protected onEnlaceInput(red: keyof EnlacesOrganizacion, event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value.trim();
    this.draftEnlaces.update((prev) => ({
      ...prev,
      [red]: valor || undefined,
    }));
  }

  protected agregarPrograma(nombre: string): void {
    if (!this.draftProgramas().includes(nombre)) {
      this.draftProgramas.update((list) => [...list, nombre]);
      this.tagBusqueda.set('');
    }
  }

  protected removerPrograma(nombre: string): void {
    this.draftProgramas.update((list) => list.filter((p) => p !== nombre));
  }
}
