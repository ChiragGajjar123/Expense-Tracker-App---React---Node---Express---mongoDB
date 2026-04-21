import { useState, useRef, useEffect } from 'react';
import { X, Calendar, Tag, Info, DollarSign, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { Transaction } from '../appTypes';

interface TransactionFormProps {
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

const TransactionForm = ({ onClose, editingTransaction }: TransactionFormProps) => {
  const { categories, addTransaction, updateTransaction } = useAppContext();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState(() => {
    if (editingTransaction) {
      return {
        title: editingTransaction.title,
        amount: editingTransaction.amount.toString(),
        type: editingTransaction.type,
        categoryId: editingTransaction.categoryId,
        date: editingTransaction.date,
        note: editingTransaction.note || ''
      };
    }
    return {
      title: '',
      amount: '',
      type: 'expense' as 'income' | 'expense',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    };
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (editingTransaction) {
      updateTransaction({ ...data, id: editingTransaction.id });
    } else {
      addTransaction(data);
    }
    onClose();
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-900">
            {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Type Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', categoryId: '' })}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  formData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', categoryId: '' })}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  formData.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                Income
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                <div className="relative">
                  <Info className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    placeholder="What was this for?"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                  <div className="relative" ref={categoryRef}>
                    <button
                      type="button"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 absolute left-4 text-gray-400 pointer-events-none" />
                        <span className={formData.categoryId ? 'text-gray-900' : 'text-gray-400'}>
                          {formData.categoryId 
                            ? categories.find(c => c.id === formData.categoryId)?.name 
                            : 'Select Category'}
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCategoryOpen && (
                      <div className="absolute z-[60] mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl py-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {filteredCategories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, categoryId: cat.id });
                              setIsCategoryOpen(false);
                            }}
                            className="w-full px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className={`text-sm ${formData.categoryId === cat.id ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                              {cat.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note (Optional)</label>
                <textarea
                  placeholder="Add more details..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-24 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <button
              type="submit"
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] cursor-pointer ${
                formData.type === 'expense' 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-100' 
                  : 'bg-green-600 hover:bg-green-700 shadow-green-100'
              }`}
            >
              {editingTransaction ? 'Update' : 'Save'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
