import { create } from 'zustand';
import type { Transaction, BudgetInfo, Category } from '../appTypes';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const API_URL = '/api';

interface AppState {
  transactions: Transaction[];
  budgets: BudgetInfo[];
  categories: Category[];
  fetchData: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudget: (budget: BudgetInfo) => Promise<void>;
  clearData: () => void;
}

const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json'
});

export const useAppStore = create<AppState>((set) => ({
  transactions: [],
  budgets: [],
  categories: DEFAULT_CATEGORIES,

  fetchData: async () => {
    try {
      const [transRes, budgetRes] = await Promise.all([
        fetch(`${API_URL}/transactions`, { headers: authHeaders(), credentials: 'include' }),
        fetch(`${API_URL}/budgets`, { headers: authHeaders(), credentials: 'include' })
      ]);
      if (transRes.ok && budgetRes.ok) {
        const transData = await transRes.json();
        const budgetData = await budgetRes.json();
        set({ transactions: transData, budgets: budgetData });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  },

  addTransaction: async (newTransaction) => {
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(newTransaction)
      });
      const data = await res.json();
      set((state) => ({ transactions: [data, ...state.transactions] }));
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  },

  updateTransaction: async (updatedTransaction) => {
    try {
      const res = await fetch(`${API_URL}/transactions/${updatedTransaction.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(updatedTransaction)
      });
      const data = await res.json();
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === data.id ? data : t))
      }));
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  },

  deleteTransaction: async (id) => {
    try {
      await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include'
      });
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  },

  updateBudget: async (newBudget) => {
    try {
      const res = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(newBudget)
      });
      const data = await res.json();
      set((state) => {
        const exists = state.budgets.find((b) => b.categoryId === data.categoryId);
        if (exists) {
          return {
            budgets: state.budgets.map((b) => (b.categoryId === data.categoryId ? data : b))
          };
        } else {
          return {
            budgets: [...state.budgets, data]
          };
        }
      });
    } catch (err) {
      console.error('Error updating budget:', err);
    }
  },

  clearData: () => {
    set({ transactions: [], budgets: [] });
  }
}));
