import { Component, computed, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalState } from 'ngx-signal-state';
import { ShoppingCartEntry } from '../../types/shopping-cart-entry';
import { Product } from '../../types/product.type';
import { BreadcrumbItem } from '../../types/breadcrumb-item.type';
import { BreadcrumbUiComponent } from '../../ui/breadcrumb/breadcrumb.ui-component';
import { ShoppingCartSignalState } from '../../services/shopping-cart-signal-state';
import { ProductService } from '../../services/product.service';

type ShoppingCartSmartComponentState = {
  entries: ShoppingCartEntry[];
  products: Product[];
}

type ViewModel = {
  shoppingCartEntriesWithProductInfo: (ShoppingCartEntry & { price: number, name: string })[];
  amount: number;
  totalPrice: number;
}

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule, BreadcrumbUiComponent],
  template: `
    <si-breadcrumb [breadcrumbItems]="breadcrumbItems"></si-breadcrumb>
    <h1>My shopping cart</h1>
    <form>
      <table>
        <thead>
        <tr>
          <th>Product</th>
          <th>Amount</th>
          <th>Price/item</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let entry of vm.shoppingCartEntriesWithProductInfo">
          <td>{{entry.name}}</td>
          <td>
            <label>
              <input type="number" [name]="'amount_' + entry.productId"
                     [attr.value]="entry.amount"
                     (change)="updateAmount($event, entry.productId)"/>

            </label>
          </td>
          <td>{{entry.price}} &euro;</td>
        </tr>
        <tr>
          <td><strong>Total</strong></td>
          <td>{{vm.amount}}</td>
          <td>{{vm.totalPrice}} &euro;</td>
        </tr>
        </tbody>
      </table>
    </form>
  `,
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent extends SignalState<ShoppingCartSmartComponentState> {
  private readonly shoppingCartSignalState = inject(ShoppingCartSignalState);
  private readonly productService = inject(ProductService)

  public readonly breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Home',
      route: [''],
    },
    {
      label: 'Shopping-cart',
      route: ['/payment', 'shopping-cart'],
    },
  ];


  constructor() {
    super();
    this.initialize({
      entries: this.shoppingCartSignalState.snapshot.entries,
      products: [],
    });
    this.connectObservables({
      products: this.productService.getProducts()
    })
    this.connect({
      ...this.shoppingCartSignalState.pick(['entries']),
    })
  }

  private readonly viewModel: Signal<ViewModel> = computed(() => {
    const { entries, products } = this.state();
    if (products.length === 0) {
      return {
        totalPrice: 0,
        amount: 0,
        shoppingCartEntriesWithProductInfo: []
      }
    }
    const shoppingCartEntriesWithProductInfo = entries.map(entry => {
      const product: Product | undefined = products.find(p => p.id === entry.productId)
      if (!product) {
        throw new Error('product not found')
      }
      return { ...entry, price: product.price, name: product.name }
    })
    return {
      shoppingCartEntriesWithProductInfo,
      totalPrice: shoppingCartEntriesWithProductInfo
        .reduce((totalPrice: number, item) => totalPrice + (item?.amount * item.price), 0),
      amount: entries
        .reduce((amount: number, item) => amount + item.amount, 0)
    }
  })

  protected get vm(): ViewModel {
    return this.viewModel();
  }

  public updateAmount(event: Event, productId: number): void {
    this.shoppingCartSignalState.updateAmount(productId, Number((event.target as HTMLInputElement).value));
  }
}
