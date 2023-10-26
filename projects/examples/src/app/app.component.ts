import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ShoppingCartSignalState } from '../services/shopping-cart-signal-state';
import { SignalState } from 'ngx-signal-state';
import { ShoppingCartEntry } from '../types/shopping-cart-entry';

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
export class AppComponent extends SignalState<{ entries: ShoppingCartEntry[] }>{
  private readonly shoppingCartState = inject(ShoppingCartSignalState)
  private readonly viewModel = computed(() => {
    return {
      amount: this.state().entries.reduce((amount: number, item) => amount + item.amount, 0)
    }
  })
  constructor() {
    super();
    this.initialize({
      entries: this.shoppingCartState.snapshot.entries
    })
    this.connect({
      ...this.shoppingCartState.pick(['entries'])
    })
  }
  protected get vm(): ViewModel {
    return this.viewModel();
  }
}
