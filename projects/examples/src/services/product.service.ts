import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateProductDto } from '../types/update-product.dto';
import { Product } from '../types/product.type';
import { CreateProductDto } from '../types/create-product.dto';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly httpClient = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/products';

  public createProduct(product: CreateProductDto): Observable<Product> {
    return this.httpClient.post<Product>(this.apiUrl, product);
  }

  public getProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(this.apiUrl);
  }

  public getProductById(id: number): Observable<Product> {
    return this.httpClient.get<Product>(`${this.apiUrl}/${id}`);
  }

  public removeProduct(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  public updateProduct(id: number, dto: UpdateProductDto): Observable<Product> {
    return this.httpClient.put<Product>(`${this.apiUrl}/${id}`, dto);
  }
}
