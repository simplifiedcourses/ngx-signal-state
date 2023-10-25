import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ShoppingCartObservableState } from '../services/shopping-cart-observable-state';

type ViewModel = {
  amount: number
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, RouterLink],
  standalone: true,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly shoppingCartState = inject(ShoppingCartObservableState)
  private readonly viewModel = computed(() => {
    return {
      amount: this.shoppingCartState.state().entries.reduce((amount: number, item) => amount + item.amount, 0)
    }
  })
  protected get vm(): ViewModel {
    return this.viewModel();
  }
}
