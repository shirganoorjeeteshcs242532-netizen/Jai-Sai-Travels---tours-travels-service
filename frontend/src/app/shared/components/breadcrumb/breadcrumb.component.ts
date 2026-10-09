import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent {
  @Input() pageTitle: string = '';
  @Input() subtitle: string = '';
  @Input() items: BreadcrumbItem[] = [];
}
