export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  note?: string;
}

export interface BudgetInfo {
  id?: string;
  categoryId: string;
  amount: number;
  period: 'monthly';
}

export interface AppState {
  transactions: Transaction[];
  budgets: BudgetInfo[];
  categories: Category[];
}
