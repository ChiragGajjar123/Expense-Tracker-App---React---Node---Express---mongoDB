import type { Transaction, BudgetInfo } from '../appTypes';

const STORAGE_KEYS = {
  TRANSACTIONS: 'expense_tracker_transactions',
  BUDGETS: 'expense_tracker_budgets',
};

export const storage = {
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  
  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },
  
  getBudgets: (): BudgetInfo[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  },
  
  saveBudgets: (budgets: BudgetInfo[]) => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },
};
