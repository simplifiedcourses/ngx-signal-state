import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbItem } from '../../types/breadcrumb-item.type';

@Component({
  selector: 'si-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.ui-component.html',
  styleUrls: ['./breadcrumb.ui-component.scss'],
})
export class BreadcrumbUiComponent {
  @Input() public breadcrumbItems: BreadcrumbItem[] = [];
}
