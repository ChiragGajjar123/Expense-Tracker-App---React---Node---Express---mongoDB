import { create } from 'zustand';
import type { Transaction, BudgetInfo, Category } from '../appTypes';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const runGraphQL = async (query: string, variables?: Record<string, any>) => {
  try {
    const res = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, message: json.errors?.[0]?.message || 'Network error' };
    }
    if (json.errors && json.errors.length > 0) {
      return { ok: false, message: json.errors[0].message };
    }
    return { ok: true, data: json.data };
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
      const query = `
        query FetchData {
          transactions {
            id
            title
            amount
            type
            categoryId
            date
            note
          }
          budgets {
            id
            categoryId
            amount
            period
          }
        }
      `;
      const res = await runGraphQL(query);
      if (res.ok && res.data) {
        set({
          transactions: res.data.transactions,
          budgets: res.data.budgets
        });
      } else {
        console.error('Error fetching data:', res.message);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      set({ isLoadingData: false });
    }
  },

  addTransaction: async (newTransaction) => {
    try {
      const query = `
        mutation AddTransaction($title: String!, $amount: Float!, $type: String!, $categoryId: String!, $date: String!, $note: String) {
          addTransaction(title: $title, amount: $amount, type: $type, categoryId: $categoryId, date: $date, note: $note) {
            id
            title
            amount
            type
            categoryId
            date
            note
          }
        }
      `;
      const res = await runGraphQL(query, newTransaction);
      if (res.ok && res.data?.addTransaction) {
        const data = res.data.addTransaction;
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
      const query = `
        mutation UpdateTransaction($id: ID!, $title: String, $amount: Float, $type: String, $categoryId: String, $date: String, $note: String) {
          updateTransaction(id: $id, title: $title, amount: $amount, type: $type, categoryId: $categoryId, date: $date, note: $note) {
            id
            title
            amount
            type
            categoryId
            date
            note
          }
        }
      `;
      const res = await runGraphQL(query, updatedTransaction);
      if (res.ok && res.data?.updateTransaction) {
        const data = res.data.updateTransaction;
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
      const query = `
        mutation DeleteTransaction($id: ID!) {
          deleteTransaction(id: $id) {
            success
            message
          }
        }
      `;
      const res = await runGraphQL(query, { id });
      if (res.ok && res.data?.deleteTransaction?.success) {
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
      const query = `
        mutation UpdateBudget($categoryId: String!, $amount: Float!) {
          updateBudget(categoryId: $categoryId, amount: $amount) {
            id
            categoryId
            amount
            period
          }
        }
      `;
      const res = await runGraphQL(query, {
        categoryId: newBudget.categoryId,
        amount: newBudget.amount
      });
      if (res.ok && res.data?.updateBudget) {
        const data = res.data.updateBudget;
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
