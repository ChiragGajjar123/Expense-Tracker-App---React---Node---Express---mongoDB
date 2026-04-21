import { useState } from 'react';
import { 
  Search, ArrowUpRight, ArrowDownLeft, Trash2, Edit2, 
  Utensils, Car, ShoppingBag, Film, Heart, Plane, BookOpen, 
  Receipt, Briefcase, Laptop, TrendingUp, Gift, PlusCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import type { Transaction } from '../appTypes';

const IconMap: Record<string, LucideIcon> = {
  Utensils, Car, ShoppingBag, Film, Heart, Plane, BookOpen, 
  Receipt, Briefcase, Laptop, TrendingUp, Gift, PlusCircle
};

const TransactionList = ({ onEdit }: { onEdit: (t: Transaction) => void }) => {
  const { transactions, categories, deleteTransaction } = useAppContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || t.type === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['all', 'income', 'expense'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  filter === f 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredTransactions.map((t) => {
              const category = categories.find(c => c.id === t.categoryId);
              const Icon = IconMap[category?.icon || 'PlusCircle'] || PlusCircle;

              return (
                <div key={t.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                  <div 
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: `${category?.color}15`, color: category?.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{t.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{category?.name}</span>
                      <span>•</span>
                      <span>{format(new Date(t.date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <div className={`font-bold flex items-center gap-1 ${
                      t.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      ${t.amount.toLocaleString()}
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(t)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteTransaction(t.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">No transactions found</p>
            <p className="text-sm">Try adjusting your filters or search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
