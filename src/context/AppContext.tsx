/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Transaction, BudgetInfo, Category } from '../appTypes';
import { storage } from '../utils/storage';
import { DEFAULT_CATEGORIES } from '../constants/categories';

interface AppContextType {
  transactions: Transaction[];
  budgets: BudgetInfo[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (budget: BudgetInfo) => void;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = storage.getTransactions();
    if (stored.length > 0) return stored;
    
    const initialTransactions: Transaction[] = [
      {
        id: '1',
        title: 'Monthly Salary',
        amount: 5000,
        type: 'income',
        categoryId: '9',
        date: new Date().toISOString().split('T')[0],
        note: 'Regular salary'
      },
      {
        id: '2',
        title: 'Grocery Shopping',
        amount: 150.50,
        type: 'expense',
        categoryId: '1',
        date: new Date().toISOString().split('T')[0],
        note: 'Weekly groceries'
      },
      {
        id: '3',
        title: 'Netflix Subscription',
        amount: 15.99,
        type: 'expense',
        categoryId: '4',
        date: new Date().toISOString().split('T')[0]
      }
    ];
    storage.saveTransactions(initialTransactions);
    return initialTransactions;
  });

  const [budgets, setBudgets] = useState<BudgetInfo[]>(() => storage.getBudgets());
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // No longer need the initialization useEffect since we use state initializers
  
  const addTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction = { ...newTransaction, id: crypto.randomUUID() };
    const updated = [transaction, ...transactions];
    setTransactions(updated);
    storage.saveTransactions(updated);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    const updated = transactions.map((t) => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    );
    setTransactions(updated);
    storage.saveTransactions(updated);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    storage.saveTransactions(updated);
  };

  const updateBudget = (newBudget: BudgetInfo) => {
    const exists = budgets.find(b => b.categoryId === newBudget.categoryId);
    let updated;
    if (exists) {
      updated = budgets.map(b => b.categoryId === newBudget.categoryId ? newBudget : b);
    } else {
      updated = [...budgets, newBudget];
    }
    setBudgets(updated);
    storage.saveBudgets(updated);
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
