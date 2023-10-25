import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../types/product.type';
import { ButtonUiComponent } from '../button/button.ui-component';

@Component({
  selector: 'si-product',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonUiComponent],
  templateUrl: './product.ui-component.html',
  styleUrls: ['./product.ui-component.scss'],
})
export class ProductUiComponent {
  @Input() public product: Product | null = null;
  @Output() public add = new EventEmitter<Product>()
}
