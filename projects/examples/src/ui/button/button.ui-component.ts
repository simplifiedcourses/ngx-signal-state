import { Component, HostBinding, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[siButton], button[siButton]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.ui-component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./button.ui-component.scss'],
})
export class ButtonUiComponent {
  @HostBinding('class.shoppie-btn') public readonly class = true;
}
