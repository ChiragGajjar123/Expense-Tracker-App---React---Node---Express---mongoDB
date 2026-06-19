import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Target, AlertCircle, Plus, ChevronDown, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const BudgetManager: React.FC = () => {
  const categories = useAppStore((state) => state.categories);
  const transactions = useAppStore((state) => state.transactions);
  const budgets = useAppStore((state) => state.budgets);
  const updateBudget = useAppStore((state) => state.updateBudget);
  const [state, setState] = useState({
    selectedCategory: '',
    amount: '',
    isCategoryOpen: false,
    isSubmitting: false
  });

  const { selectedCategory, amount, isCategoryOpen, isSubmitting } = state;
  const categoryRef = useRef<HTMLDivElement>(null);

  const expenseCategories = categories.filter(c => c.type === 'expense');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setState(prev => ({ ...prev, isCategoryOpen: false }));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pre-calculate month range values
  const monthInterval = useMemo(() => {
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now)
    };
  }, []);

  // Pre-calculate total spent amount for each category in the current month in a single pass O(T)
  const spentTotalsByCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    
    // Filter transactions for current month once
    const currentMonthTransactions = transactions.filter(t => 
      isWithinInterval(new Date(t.date), monthInterval)
    );

    for (let i = 0; i < currentMonthTransactions.length; i++) {
      const t = currentMonthTransactions[i];
      totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount;
    }

    return totals;
  }, [transactions, monthInterval]);

  // Convert budgets to budget info list with O(1) lookup
  const budgetListWithInfo = useMemo(() => {
    const list = budgets.map(b => {
      const category = categories.find(c => c.id === b.categoryId);
      if (!category) return null;

      const spent = spentTotalsByCategory[b.categoryId] || 0;
      const percentage = Math.min((spent / b.amount) * 100, 100);
      const isOver = spent > b.amount;

      return {
        budget: b,
        category,
        spent,
        percentage,
        isOver
      };
    });
    return list.filter((item): item is NonNullable<typeof item> => item !== null);
  }, [budgets, categories, spentTotalsByCategory]);

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !amount) return;
    
    setState(prev => ({ ...prev, isSubmitting: true }));
    try {
      await updateBudget({
        categoryId: selectedCategory,
        amount: parseFloat(amount),
        period: 'monthly'
      });
      setState(prev => ({ ...prev, selectedCategory: '', amount: '' }));
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Budgeting</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Set Budget Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-5 sm:mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Set Category Budget
            </h3>
            <form onSubmit={handleSetBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <div className="relative" ref={categoryRef}>
                  <button
                    type="button"
                    onClick={() => setState(prev => ({ ...prev, isCategoryOpen: !prev.isCategoryOpen }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left flex items-center justify-between cursor-pointer"
                  >
                    <span className={`truncate text-sm ${selectedCategory ? 'text-gray-900' : 'text-gray-400'}`}>
                      {selectedCategory 
                        ? categories.find(c => c.id === selectedCategory)?.name 
                        : 'Select Category'}
                    </span>
                    <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isCategoryOpen && (
                    <div className="absolute z-10 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                      {expenseCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setState(prev => ({ ...prev, selectedCategory: cat.id, isCategoryOpen: false }))}
                          className="w-full px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
                        >
                          <div 
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className={`text-sm truncate ${selectedCategory === cat.id ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                            {cat.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monthly Limit</label>
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setState(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {isSubmitting ? 'Setting...' : 'Set Budget'}
              </button>
            </form>
          </div>
        </div>

        {/* Budgets List */}
        <div className="lg:col-span-2 space-y-4">
          {budgetListWithInfo.length > 0 ? (
            budgetListWithInfo.map(({ budget, category, spent, percentage, isOver }) => {
              return (
                <div key={budget.categoryId} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${category.color}15`, color: category.color }}
                      >
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{category.name}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Monthly Budget</p>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto text-left sm:text-right flex flex-row sm:flex-col justify-between items-baseline sm:items-end gap-2">
                      <p className="font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap">${spent.toLocaleString()} / ${budget.amount.toLocaleString()}</p>
                      <p className={`text-[11px] sm:text-sm font-medium whitespace-nowrap ${isOver ? 'text-red-600' : 'text-gray-500'}`}>
                        {isOver ? 'Over budget' : `${(budget.amount - spent).toLocaleString()} left`}
                      </p>
                    </div>
                  </div>

                  <div className="relative h-2.5 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                        percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  {isOver && (
                    <div className="mt-4 flex items-center gap-2 text-red-600 text-[11px] sm:text-sm font-medium bg-red-50 p-2.5 sm:p-3 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      Limit exceeded for {category.name}!
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
              <Target className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No budgets set yet</p>
              <p className="text-sm">Set monthly limits to track your spending better</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
