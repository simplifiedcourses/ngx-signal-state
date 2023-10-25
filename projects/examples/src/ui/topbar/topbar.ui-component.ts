import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonUiComponent } from '../button/button.ui-component';

@Component({
  selector: 'si-topbar',
  standalone: true,
  imports: [CommonModule, ButtonUiComponent, RouterModule],
  templateUrl: './topbar.ui-component.html',
  styleUrls: ['./topbar.ui-component.scss'],
})
export class TopbarUiComponent {
  @Input() public shoppingcartAmount: number|null = 0;
}
