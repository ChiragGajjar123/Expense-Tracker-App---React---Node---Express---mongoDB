import type { Category } from '../appTypes';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: '1', name: 'Food & Dining', icon: 'Utensils', color: '#EF4444', type: 'expense' },
  { id: '2', name: 'Transportation', icon: 'Car', color: '#F59E0B', type: 'expense' },
  { id: '3', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899', type: 'expense' },
  { id: '4', name: 'Entertainment', icon: 'Film', color: '#8B5CF6', type: 'expense' },
  { id: '5', name: 'Health', icon: 'Heart', color: '#10B981', type: 'expense' },
  { id: '6', name: 'Travel', icon: 'Plane', color: '#3B82F6', type: 'expense' },
  { id: '7', name: 'Education', icon: 'BookOpen', color: '#6366F1', type: 'expense' },
  { id: '8', name: 'Bills & Utilities', icon: 'Receipt', color: '#6B7280', type: 'expense' },
  
  // Income
  { id: '9', name: 'Salary', icon: 'Briefcase', color: '#10B981', type: 'income' },
  { id: '10', name: 'Freelance', icon: 'Laptop', color: '#3B82F6', type: 'income' },
  { id: '11', name: 'Investments', icon: 'TrendingUp', color: '#F59E0B', type: 'income' },
  { id: '12', name: 'Gifts', icon: 'Gift', color: '#EC4899', type: 'income' },
  { id: '13', name: 'Other Income', icon: 'PlusCircle', color: '#6B7280', type: 'income' },
];
