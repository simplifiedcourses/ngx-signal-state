import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../types/category.type';
import { UpdateCategoryDto } from '../types/update-category.dto';
import { CreateCategoryDto } from '../types/create-category.dto';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly httpClient = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/categories';

  public createCategory(dto: CreateCategoryDto): Observable<Category> {
    return this.httpClient.post<Category>(this.apiUrl, dto);
  }

  public getCategories(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(this.apiUrl);
  }

  public getCategoryById(id: number): Observable<Category> {
    return this.httpClient.get<Category>(`${this.apiUrl}/${id}`);
  }

  public removeCategory(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  public updateCategory(
    id: number,
    dto: UpdateCategoryDto
  ): Observable<Category> {
    return this.httpClient.put<Category>(`${this.apiUrl}/${id}`, dto);
  }
}
