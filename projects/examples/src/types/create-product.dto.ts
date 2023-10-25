export type CreateProductDto = {
  name: string;
  description: string;
  price: number;
  advice: string;
  categoryId?: number;
  quantity?: number;
};
