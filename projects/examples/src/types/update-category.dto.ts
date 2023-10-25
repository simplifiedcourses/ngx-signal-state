export type UpdateCategoryDto = Partial<{
  name: string;
  description: string;
  productsCount?: number;
}>;
