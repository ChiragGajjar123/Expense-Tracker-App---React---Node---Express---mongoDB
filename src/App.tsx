import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import BudgetManager from './components/BudgetManager';
import type { Transaction } from './appTypes';

function App() {
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

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onAddClick={() => setIsFormOpen(true)}
    >
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'transactions' && <TransactionList onEdit={handleEdit} />}
      {activeTab === 'budgets' && <BudgetManager />}
      {activeTab === 'settings' && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <p className="text-gray-500">Settings and customization options coming soon.</p>
        </div>
      )}

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
