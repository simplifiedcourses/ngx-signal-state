export type UpdateProductDto = Partial<{
  name: string;
  description: string;
  price: number;
  advice: string;
  categoryId: number;
  quantity?: number;
}>;
