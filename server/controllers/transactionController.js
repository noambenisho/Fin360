import Transaction from '../models/Transaction.js';

export const getMonthlySummary = async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const transactions = await Transaction.find({
            userId: req.user.id,
            date: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        });

        const summary = {
            totalIncome: 0,
            totalExpenses: 0,
            balance: 0,
            expensesByCategory: {},
            incomeByCategory: {},
            recentTransactions: transactions.slice(0, 5)
        };

        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                summary.totalIncome += transaction.amount;
                summary.incomeByCategory[transaction.category] = (summary.incomeByCategory[transaction.category] || 0) + transaction.amount;
            } else {
                summary.totalExpenses += transaction.amount;
                summary.expensesByCategory[transaction.category] = (summary.expensesByCategory[transaction.category] || 0) + transaction.amount;
            }
        });

        summary.balance = summary.totalIncome - summary.totalExpenses;

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction
            .find({ userId: req.user.id })
            .sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTransaction = async (req, res) => {
    try {
        const { amount, type, category, description, date } = req.body;
        
        // Basic validation
        if (!amount || !type || !category) {
            return res.status(400).json({ message: 'Amount, type and category are required' });
        }

        const transaction = new Transaction({
            userId: req.user.id,
            amount,
            type,
            category,
            description,
            date: date || new Date()
        });

        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type, category, description, date } = req.body;

        // Basic validation
        if (!amount || !type || !category || !description) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const transaction = await Transaction.findOne({ 
            _id: id,
            userId: req.user.id  // Verify that the transaction belongs to the user
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        transaction.amount = amount;
        transaction.type = type;
        transaction.category = category;
        transaction.description = description;
        if (date) transaction.date = date;

        const updatedTransaction = await transaction.save();
        res.json(updatedTransaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        
        const transaction = await Transaction.findOneAndDelete({
            _id: id,
            userId: req.user.id  // Verify that the transaction belongs to the user
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
