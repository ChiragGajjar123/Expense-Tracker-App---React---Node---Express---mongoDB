import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Transaction from './models/Transaction.js';
import Budget from './models/Budget.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    console.log(`Database URI: ${process.env.MONGODB_URI}`);
  })
  .catch((err) => {
    console.error('MongoDB connection error. Please make sure MongoDB is running!');
    console.error(`Attempted URI: ${process.env.MONGODB_URI}`);
    console.error(err.message);
  });

// Transaction Routes
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  const transaction = new Transaction(req.body);
  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Budget Routes
app.get('/api/budgets', async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    const { categoryId, amount } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { categoryId },
      { amount },
      { upsert: true, new: true }
    );
    res.json(budget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// For Vercel serverless deployment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
