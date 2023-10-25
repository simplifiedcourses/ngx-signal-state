export type Category = Readonly<{
  id: number;
  name: string;
  description: string;
  productsCount?: number;
}>;
