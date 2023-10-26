import { Injectable } from '@angular/core';
import { ShoppingCartEntry } from '../types/shopping-cart-entry';
import { SignalState } from 'ngx-signal-state';

export type ShoppingCartState = {
  entries: ShoppingCartEntry[]
}

@Injectable(
  {
    providedIn: 'root'
  }
)
export class ShoppingCartSignalState extends SignalState<ShoppingCartState> {
  constructor() {
    super();
    this.initialize({
      entries: []
    })
  }

  public addToCart(entry: ShoppingCartEntry): void {
    const entries = [...this.snapshot.entries, entry];
    this.patch({ entries });
  }

  public deleteFromCart(id: number): void {
    const entries = this.snapshot.entries.filter(entry => entry.productId !== id);
    this.patch({ entries });
  }

  public updateAmount(id: number, amount: number): void {
    const entries = this.snapshot.entries.map(item => item.productId === id ? { ...item, amount } : item);
    this.patch({ entries });
  }
}
