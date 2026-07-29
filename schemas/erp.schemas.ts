import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Nome deve conter pelo menos 2 caracteres'),
  barcode: z.string().optional(),
  brand: z.string().optional(),
  category_id: z.string().min(1, 'Selecione uma categoria'),
  supplier_id: z.string().min(1, 'Selecione um fornecedor'),
  buy_price: z.number().min(0, 'Preço de compra deve ser maior ou igual a 0'),
  sell_price: z.number().min(0.01, 'Preço de venda deve ser maior que 0'),
  stock: z.number().int().min(0, 'Estoque não pode ser negativo'),
  min_stock: z.number().int().min(0, 'Estoque mínimo não pode ser negativo'),
  expiry_date: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Nome deve conter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  document: z.string().min(11, 'Documento (CPF/CNPJ) inválido').optional().or(z.literal('')),
  birthday: z.string().optional(),
  notes: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(2, 'Nome do fornecedor é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido (mínimo 14 caracteres)'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  address: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Nome da categoria deve conter pelo menos 2 caracteres'),
  description: z.string().optional(),
});

export const saleSchema = z.object({
  customer_id: z.string().optional(),
  payment_method: z.enum(['money', 'card', 'pix', 'debt']),
  discount_amount: z.number().min(0, 'Desconto não pode ser negativo'),
});
