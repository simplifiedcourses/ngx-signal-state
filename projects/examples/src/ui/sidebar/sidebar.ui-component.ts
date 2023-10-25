import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Category } from '../../types/category.type';

@Component({
  selector: 'si-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.ui-component.html',
  styleUrls: ['./sidebar.ui-component.scss'],
})
export class SidebarUiComponent {
  @Input() public categories: Category[] | null = null;
}
