import { Component, computed, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalState } from 'ngx-signal-state';
import { Category } from '../../types/category.type';
import { Product } from '../../types/product.type';
import { BreadcrumbItem } from '../../types/breadcrumb-item.type';
import { interval, map } from 'rxjs';
import { SidebarUiComponent } from '../../ui/sidebar/sidebar.ui-component';
import { BreadcrumbUiComponent } from '../../ui/breadcrumb/breadcrumb.ui-component';
import { ProductUiComponent } from '../../ui/product/product.ui-component';
import { PagerUiComponent } from '../pager/pager.component';
import { FormsModule } from '@angular/forms';
import { ProductsFacade } from '../products.facade';
import { ShoppingCartState } from '../../services/shopping-cart-signal-state';

type ProductOverviewState = {
  pageIndex: number;
  query: string;
  itemsPerPage: number;
  categories: Category[];
  products: Product[];
  filteredProducts: Product[];
  pagedProducts: Product[];
  time: number;
} & Pick<ShoppingCartState, 'entries'>

type ViewModel =
  Pick<ProductOverviewState, 'entries'| 'categories' | 'query' | 'products' | 'itemsPerPage' | 'pageIndex' | 'time'>
  & {
  total: number;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarUiComponent, BreadcrumbUiComponent, ProductUiComponent, PagerUiComponent],
  template: `
    <div class="product-overview__content">
      <div class="product-overview__content-right">
        <si-breadcrumb [breadcrumbItems]="breadcrumbItems"></si-breadcrumb>
        <div class="product-overview__content-right-top">
          <h1>Product overview</h1>
          <form>
            <label>
              <input placeholder="Type to filter..." type="text" data-cy="input__search"
                     (ngModelChange)="setQuery($event)" name="query" [ngModel]="vm.query"/>
            </label>
          </form>
        </div>
        <div class="product-overview__content-right-items">
          <si-product
            data-cy="product__item"
            *ngFor="let product of vm.products"
            [product]="product"
            (add)="addToCard($event)"
            class="product-overview__content-right-item"
          ></si-product>
        </div>
        <si-pager
          [itemsPerPage]="vm.itemsPerPage"
          [total]="vm.total"
          [pageIndex]="vm.pageIndex"
          (itemsPerPageChange)="itemsPerPageChange($event)"
          (pageIndexChange)="pageIndexChange($event)"
        >
        </si-pager>
        {{vm.time|date: 'hh:mm:ss'}}
        <pre>{{vm.entries|json}}</pre>
      </div>
    </div>

  `,
  styleUrls: ['./products-with-facade.component.scss']
})
export class ProductsWithFacadeComponent extends SignalState<ProductOverviewState> {
  private readonly productsFacade = inject(ProductsFacade)
  protected readonly breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Home',
      route: [''],
    },
    {
      label: 'Products',
      route: ['/products'],
    },
  ];

  private readonly filteredProducts = this.selectMany(['products', 'query'],
    ({ products, query }) => {
      return products.filter(p => p.name.toLowerCase().indexOf(query.toLowerCase()) > -1)
    })

  private readonly pagedProducts = this.selectMany(['filteredProducts', 'pageIndex', 'itemsPerPage'],
    ({ filteredProducts, pageIndex, itemsPerPage }) => {
      const offsetStart = (pageIndex) * itemsPerPage;
      const offsetEnd = (pageIndex + 1) * itemsPerPage;
      return filteredProducts.slice(offsetStart, offsetEnd);
    })

  private readonly viewModel: Signal<ViewModel> = computed(() => {
    const { categories, entries, filteredProducts, pagedProducts, pageIndex, itemsPerPage, query, time } = this.state()
    return {
      total: filteredProducts.length,
      query: query,
      categories,
      itemsPerPage,
      pageIndex,
      products: pagedProducts,
      time,
      entries
    }
  });

  protected get vm(): ViewModel {
    return this.viewModel();
  }

  constructor() {
    super();
    this.initialize({
      pageIndex: 0,
      itemsPerPage: 5,
      query: '',
      categories: [],
      products: [],
      filteredProducts: [],
      pagedProducts: [],
      time: new Date().getTime(),
      entries: this.productsFacade.shoppingCartSnapshot.entries
    });
    this.connectObservables({
      products: this.productsFacade.getProducts(),
      categories: this.productsFacade.getCategories(),
      time: interval(1000).pipe(map(() => new Date().getTime())),
    })
    this.connect({
      filteredProducts: this.filteredProducts,
      pagedProducts: this.pagedProducts,
      ...this.productsFacade.pickFromShoppingCartState(['entries'])
    })
  }


  protected setQuery(query: string): void {
    this.patch({ pageIndex: 0, query })
  }

  protected pageIndexChange(pageIndex: number): void {
    this.patch({ pageIndex });
  }

  protected itemsPerPageChange(itemsPerPage: number): void {
    this.patch({ pageIndex: 0, itemsPerPage })
  }

  protected addToCard(product: Product): void {
    this.productsFacade.addToCart({ productId: product.id, amount: 1 });
  }
}
