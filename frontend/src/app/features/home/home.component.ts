import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css' // <-- Cambiado a singular (styleUrl)
})
export class HomeComponent implements OnInit {
  searchTerm: string = '';
  selectedTag: string = 'Todos';

  availableTags: string[] = ['Todos', 'Ventas', 'Excel', 'Atención al Cliente', 'Logística', 'Programación'];

  // Tipado temporal como any[] para aislar el error de TypeScript
  oportunidades: any[] = [
    {
      id: '1',
      title: 'Auxiliar de Depósito y Logística',
      orgName: 'Distribuidora del Sur',
      type: 'EMPLEO',
      requiredSkills: ['Logística', 'Excel'],
      matchPercentage: 100
    },
    {
      id: '2',
      title: 'Curso Intensivo: Herramientas de Oficina y Excel',
      orgName: 'Fundación Capacitar',
      type: 'FORMACION',
      requiredSkills: ['Excel'],
      matchPercentage: 80
    },
    {
      id: '3',
      title: 'Vendedor/a de Salón',
      orgName: 'Comercial Alfa',
      type: 'EMPLEO',
      requiredSkills: ['Ventas', 'Atención al Cliente'],
      matchPercentage: 60
    }
  ];

  filteredOportunidades: any[] = [];

  ngOnInit(): void {
    this.filteredOportunidades = [...this.oportunidades];
  }

  filterOpportunities(): void {
    this.filteredOportunidades = this.oportunidades.filter(op => {
      const matchesSearch = op.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            op.orgName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesTag = this.selectedTag === 'Todos' || op.requiredSkills.includes(this.selectedTag);

      return matchesSearch && matchesTag;
    });
  }

  selectTag(tag: string): void {
    this.selectedTag = tag;
    this.filterOpportunities();
  }
}