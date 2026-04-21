import React from 'react';
import { Wallet, PieChart, List, Settings, PlusCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onAddClick }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'transactions', label: 'Transactions', icon: List },
    { id: 'budgets', label: 'Budgets', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Expensy</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onAddClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Expensy</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden bg-white border-t border-gray-200 p-2 flex justify-around items-center sticky bottom-0 z-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer ${
                activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Floating Add Button for Mobile */}
        <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={onAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-lg shadow-blue-300 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Layout;
