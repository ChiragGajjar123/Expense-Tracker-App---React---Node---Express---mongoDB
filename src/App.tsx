import { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';
import AuthPage from './components/AuthPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import BudgetManager from './components/BudgetManager';
import Settings from './components/Settings';
import type { Transaction } from './appTypes';
import { Loader2 } from 'lucide-react';

function App() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const verifySession = useAuthStore((state) => state.verifySession);
  const fetchData = useAppStore((state) => state.fetchData);
  const clearData = useAppStore((state) => state.clearData);
  const isLoadingData = useAppStore((state) => state.isLoadingData);

  const isAuthenticated = !!user;

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      clearData();
    }
  }, [isAuthenticated, fetchData, clearData]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  // Loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Loading spinner while fetching initial data
  if (isLoadingData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onAddClick={() => setIsFormOpen(true)}
    >
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'transactions' && <TransactionList onEdit={handleEdit} />}
      {activeTab === 'budgets' && <BudgetManager />}
      {activeTab === 'settings' && <Settings />}

      {isFormOpen && (
        <TransactionForm
          onClose={handleCloseForm}
          editingTransaction={editingTransaction}
        />
      )}
    </Layout>
  );
}

export default App;
