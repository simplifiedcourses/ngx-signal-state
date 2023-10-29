import { inject, Injectable, Signal } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { ShoppingCartSignalState, ShoppingCartState } from '../services/shopping-cart-signal-state';
import { Observable } from 'rxjs';
import { Product } from '../types/product.type';
import { Category } from '../types/category.type';
import { ShoppingCartEntry } from '../types/shopping-cart-entry';
import { PickedState } from '../../../ngx-signal-state/src/lib/types';

@Injectable({providedIn: 'root'})
export class ProductsFacade {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly shoppingCartState = inject(ShoppingCartSignalState)

  public get shoppingCartSnapshot() {
    return this.shoppingCartState.snapshot;
  }
  public pickFromShoppingCartState(keys: (keyof ShoppingCartState)[]): PickedState<ShoppingCartState> {
    return this.shoppingCartState.pick(keys);
  }

  public getProducts(): Observable<Product[]> {
    return this.productService.getProducts();
  }

  public getCategories(): Observable<Category[]> {
    return this.categoryService.getCategories();
  }

  public addToCart(entry: ShoppingCartEntry): void {
    this.shoppingCartState.addToCart(entry)
  }
}
