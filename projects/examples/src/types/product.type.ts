export type Product = Readonly<{
  id: number;
  name: string;
  description: string;
  price: number;
  advice: string;
  categoryId: number;
  quantity?: number;
}>;
