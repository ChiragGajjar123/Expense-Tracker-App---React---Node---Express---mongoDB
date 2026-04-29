/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Transaction, BudgetInfo, Category } from '../appTypes';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { useAuth } from './AuthContext';

const API_URL = '/api';

interface AppContextType {
  transactions: Transaction[];
  budgets: BudgetInfo[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudget: (budget: BudgetInfo) => Promise<void>;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetInfo[]>([]);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const authHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setTransactions([]);
      setBudgets([]);
      return;
    }

    const fetchData = async () => {
      try {
        const [transRes, budgetRes] = await Promise.all([
          fetch(`${API_URL}/transactions`, { headers: authHeaders() }),
          fetch(`${API_URL}/budgets`, { headers: authHeaders() })
        ]);
        if (transRes.ok && budgetRes.ok) {
          const transData = await transRes.json();
          const budgetData = await budgetRes.json();
          setTransactions(transData);
          setBudgets(budgetData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  const addTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newTransaction)
      });
      const data = await res.json();
      setTransactions([data, ...transactions]);
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    try {
      const res = await fetch(`${API_URL}/transactions/${updatedTransaction.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updatedTransaction)
      });
      const data = await res.json();
      setTransactions(transactions.map((t) => (t.id === data.id ? data : t)));
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE', headers: authHeaders() });
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const updateBudget = async (newBudget: BudgetInfo) => {
    try {
      const res = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newBudget)
      });
      const data = await res.json();
      const exists = budgets.find(b => b.categoryId === data.categoryId);
      if (exists) {
        setBudgets(budgets.map(b => b.categoryId === data.categoryId ? data : b));
      } else {
        setBudgets([...budgets, data]);
      }
    } catch (err) {
      console.error('Error updating budget:', err);
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  return (
    <AppContext.Provider
      value={{
        transactions,
        budgets,
        categories,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateBudget,
        totalBalance,
        totalIncome,
        totalExpenses,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
