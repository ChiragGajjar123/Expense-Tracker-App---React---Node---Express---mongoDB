import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon, Info } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { format, subDays } from 'date-fns';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const transactions = useAppStore((state) => state.transactions);
  const categories = useAppStore((state) => state.categories);

  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure layout has stabilized
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Prepare data for Category breakdown
  const categoryData = categories
    .filter(cat => cat.type === 'expense')
    .map(cat => {
      const amount = transactions
        .filter(t => t.categoryId === cat.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: cat.name, value: amount, color: cat.color };
    })
    .filter(item => item.value > 0);

  // Prepare data for Last 7 Days chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayName = format(date, 'EEE');
    
    const income = transactions
      .filter(t => t.date === dateStr && t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.date === dateStr && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { name: dayName, income, expenses, date: dateStr };
  }).reverse();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Balance Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0 relative group">
          {/* Tooltip centered below card */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-slate-900/95 text-white text-xs rounded-lg p-2.5 shadow-xl z-50 w-52 pointer-events-none transition-all duration-200 text-center">
            <p className="font-semibold mb-1">Total Balance</p>
            <p className="text-sm font-bold text-blue-400 mb-1.5">${totalBalance.toLocaleString()}</p>
            <p className="text-[10px] text-slate-300 leading-relaxed border-t border-slate-800 pt-1.5">
              Calculated as: Income (${totalIncome.toLocaleString()}) - Expenses (${totalExpenses.toLocaleString()})
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900/95" />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-blue-50 rounded-xl text-blue-600 flex-shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Balance</p>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">${totalBalance.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0 relative group">
          {/* Tooltip centered below card */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-slate-900/95 text-white text-xs rounded-lg p-2.5 shadow-xl z-50 w-52 pointer-events-none transition-all duration-200 text-center">
            <p className="font-semibold mb-1">Total Income</p>
            <p className="text-sm font-bold text-green-400 mb-1.5">+${totalIncome.toLocaleString()}</p>
            <p className="text-[10px] text-slate-300 leading-relaxed border-t border-slate-800 pt-1.5">
              Sum of all positive transactions.
            </p>
            <p className="text-[10px] mt-1 text-green-400 font-semibold">
              Count: {incomeTransactions.length} transaction{incomeTransactions.length === 1 ? '' : 's'}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900/95" />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-green-50 rounded-xl text-green-600 flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Income</p>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 text-green-600 truncate">+${totalIncome.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0 sm:col-span-2 lg:col-span-1 relative group">
          {/* Tooltip centered below card */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-slate-900/95 text-white text-xs rounded-lg p-2.5 shadow-xl z-50 w-52 pointer-events-none transition-all duration-200 text-center">
            <p className="font-semibold mb-1">Total Expenses</p>
            <p className="text-sm font-bold text-red-400 mb-1.5">-${totalExpenses.toLocaleString()}</p>
            <p className="text-[10px] text-slate-300 leading-relaxed border-t border-slate-800 pt-1.5">
              Sum of all negative transactions.
            </p>
            <p className="text-[10px] mt-1 text-red-400 font-semibold">
              Count: {expenseTransactions.length} transaction{expenseTransactions.length === 1 ? '' : 's'}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900/95" />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-red-50 rounded-xl text-red-600 flex-shrink-0">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Expenses</p>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 text-red-600 truncate">-${totalExpenses.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h4 className="text-lg font-bold text-gray-900 mb-6">Weekly Activity</h4>
          <div className="h-[320px] w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height={320} minWidth={0} minHeight={0} debounce={100}>
                <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 10}}
                  interval={0}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 10}}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#F9FAFB' }}
                />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

        {/* Expense Breakdown */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h4 className="text-lg font-bold text-gray-900 mb-6">Expense Breakdown</h4>
          <div className="h-[320px] w-full">
            {isMounted && categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320} minWidth={0} minHeight={0} debounce={100}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : isMounted && categoryData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <PieChartIcon className="w-12 h-12 mb-2 opacity-20" />
                <p>No expense data to display</p>
              </div>
            ) : null}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
