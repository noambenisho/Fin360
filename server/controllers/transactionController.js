import Transaction from '../models/Transaction.js';

export const getMonthlySummary = async (req, res) => {
    try {
        console.log('User ID:', req.user.id); // לוג לבדיקה

        // קבל את כל העסקאות של המשתמש
        const transactions = await Transaction.find({
            userId: req.user.id
        });

        console.log('Found transactions:', transactions); // לוג לבדיקה

        // חישוב סכומים כוללים והוצאות לפי קטגוריה
        const summary = transactions.reduce((acc, transaction) => {
            if (transaction.type === 'income') {
                acc.income += transaction.amount;
            } else {
                acc.expenses += transaction.amount;
                // הוספת הוצאות לפי קטגוריה
                acc.expensesByCategory[transaction.category] = (acc.expensesByCategory[transaction.category] || 0) + transaction.amount;
            }
            return acc;
        }, { 
            income: 0, 
            expenses: 0,
            expensesByCategory: {},
            alerts: []
        });

        // חישוב המאזן הנטו
        summary.netBalance = summary.income - summary.expenses;

        // הוספת התראות
        if (summary.expenses > summary.income) {
            summary.alerts.push({
                severity: 'warning',
                message: 'Your expenses are higher than your income'
            });
        }

        if (summary.expenses > 0 && (summary.expenses / summary.income) > 0.8) {
            summary.alerts.push({
                severity: 'info',
                message: 'You are spending more than 80% of your income'
            });
        }

        // המרת הקטגוריות למערך
        summary.expenseCategories = Object.entries(summary.expensesByCategory).map(([category, value]) => ({
            id: category,
            value,
            label: category
        }));

        // מחיקת האובייקט המקורי של הקטגוריות
        delete summary.expensesByCategory;

        console.log('Sending summary:', summary); // לוג לבדיקה
        res.json(summary);
    } catch (error) {
        console.error('Error in getMonthlySummary:', error);
        res.status(500).json({ message: 'Error fetching monthly summary' });
    }

        // אתחול המערכים עם החודשים
        summary.months = lastSixMonths.map(m => m.month);
        summary.monthlyIncome = new Array(6).fill(0);
        summary.monthlyExpenses = new Array(6).fill(0);

        // חישוב הנתונים החודשיים
        transactions.forEach(transaction => {
            const transDate = new Date(transaction.date);
            const monthIndex = lastSixMonths.findIndex(m => 
                transDate >= m.startDate && transDate <= m.endDate
            );
            
            if (monthIndex !== -1) {
                if (transaction.type === 'income') {
                    summary.income += transaction.amount;
                    summary.monthlyIncome[monthIndex] += transaction.amount;
                } else {
                    summary.expenses += transaction.amount;
                    summary.monthlyExpenses[monthIndex] += transaction.amount;
                }
            }
        });
        
        summary.netBalance = summary.income - summary.expenses;

        // חישוב הוצאות לפי קטגוריה לתרשים העוגה
        const expensesByCategory = {};
        transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
            }
        });

        // המרת הקטגוריות למבנה שהגרף מצפה לו
        summary.expenseCategories = Object.entries(expensesByCategory).map(([category, value]) => ({
            id: category,
            value: value,
            label: category
        }));

        summary.expenseCategories = Object.entries(expensesByCategory).map(([label, value]) => ({
            label,
            value
        }));

        // חישוב נתונים חודשיים לגרף
        const months = Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return date.toLocaleString('default', { month: 'short' });
        }).reverse();

        summary.months = months;
        summary.monthlyIncome = Array(12).fill(0);  // נתונים לדוגמה
        summary.monthlyExpenses = Array(12).fill(0); // נתונים לדוגמה

        // הוספת התראות
        if (summary.expenses > summary.income) {
            summary.alerts.push({
                severity: 'warning',
                message: 'Your expenses are higher than your income this month'
            });
        }

        if (summary.expenses > 0 && (summary.expenses / summary.income) > 0.8) {
            summary.alerts.push({
                severity: 'info',
                message: 'You are spending more than 80% of your income'
            });
        }

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
