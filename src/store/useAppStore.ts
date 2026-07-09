import { create } from 'zustand';
import type { Transaction, BudgetInfo, Category } from '../appTypes';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const runREST = async (url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: Record<string, any>) => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${baseUrl}${url}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, message: json.message || 'Server error' };
    }
    return { ok: true, data: json };
  } catch (err: any) {
    return { ok: false, message: err.message || 'Network error' };
  }
};

interface AppState {
  transactions: Transaction[];
  budgets: BudgetInfo[];
  categories: Category[];
  isLoadingData: boolean;
  fetchData: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudget: (budget: BudgetInfo) => Promise<void>;
  clearData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  transactions: [],
  budgets: [],
  categories: DEFAULT_CATEGORIES,
  isLoadingData: true,

  fetchData: async () => {
    set({ isLoadingData: true });
    try {
      const [txRes, budgetRes] = await Promise.all([
        runREST('/api/transactions', 'GET'),
        runREST('/api/budgets', 'GET')
      ]);

      const transactions = txRes.ok ? txRes.data : [];
      const budgets = budgetRes.ok ? budgetRes.data : [];

      set({ transactions, budgets });
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      set({ isLoadingData: false });
    }
  },

  addTransaction: async (newTransaction) => {
    try {
      const res = await runREST('/api/transactions', 'POST', newTransaction);
      if (res.ok && res.data) {
        const data = res.data;
        set((state) => ({ transactions: [data, ...state.transactions] }));
      } else {
        console.error('Error adding transaction:', res.message);
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  },

  updateTransaction: async (updatedTransaction) => {
    try {
      const { id, ...updateData } = updatedTransaction;
      const res = await runREST(`/api/transactions/${id}`, 'PUT', updateData);
      if (res.ok && res.data) {
        const data = res.data;
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === data.id ? data : t))
        }));
      } else {
        console.error('Error updating transaction:', res.message);
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  },

  deleteTransaction: async (id) => {
    try {
      const res = await runREST(`/api/transactions/${id}`, 'DELETE');
      if (res.ok && res.data?.success) {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id)
        }));
      } else {
        console.error('Error deleting transaction:', res.message);
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  },

  updateBudget: async (newBudget) => {
    try {
      const res = await runREST('/api/budgets', 'PUT', {
        categoryId: newBudget.categoryId,
        amount: newBudget.amount
      });
      if (res.ok && res.data) {
        const data = res.data;
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
      } else {
        console.error('Error updating budget:', res.message);
      }
    } catch (err) {
      console.error('Error updating budget:', err);
    }
  },

  clearData: () => {
    set({ transactions: [], budgets: [], isLoadingData: true });
  }
}));
