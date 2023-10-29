import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, Routes, withEnabledBlockingInitialNavigation } from '@angular/router';
import { PagerComponent } from './app/pager/pager.component';
import { ProductsComponent } from './app/products/products.component';
import { ShoppingCartComponent } from './app/shopping-cart/shopping-cart.component';
import { provideHttpClient } from '@angular/common/http';
import { ProductsWithFacadeComponent } from './app/products-with-facade/products-with-facade.component';

const appRoutes:Routes = [
  {
    path: '',
    redirectTo: 'pager',
    pathMatch: 'full'
  },
  {
    path: 'pager',
    component: PagerComponent
  },
  {
    path: 'products',
    component: ProductsComponent
  },
  {
    path: 'products-with-facade',
    component: ProductsWithFacadeComponent
  },
  {
    path: 'shopping-cart',
    component: ShoppingCartComponent
  }
];
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation())]
})
