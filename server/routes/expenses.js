const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// Lấy tất cả chi tiêu của user
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, startDate, endDate } = req.query;
        
        const query = { userId: req.user._id };
        
        // Lọc theo category
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Lọc theo ngày
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const expenses = await Expense.find(query)
            .populate('receiptId')
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Expense.countDocuments(query);

        res.json({
            expenses,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Thêm chi tiêu mới
router.post('/', auth, async (req, res) => {
    try {
        const { title, amount, category, description, date, receiptId } = req.body;

        const expense = new Expense({
            userId: req.user._id,
            title,
            amount,
            category,
            description,
            date: date || new Date(),
            receiptId
        });
	if (req.body.receiptId === '') {
  		delete req.body.receiptId;
	}

        await expense.save();
        await expense.populate('receiptId');

        res.status(201).json({
            message: 'Thêm chi tiêu thành công',
            expense
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Cập nhật chi tiêu
router.put('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!expense) {
            return res.status(404).json({ message: 'Không tìm thấy chi tiêu' });
        }

        Object.assign(expense, req.body);
        await expense.save();
        await expense.populate('receiptId');

        res.json({
            message: 'Cập nhật chi tiêu thành công',
            expense
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Xóa chi tiêu
router.delete('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!expense) {
            return res.status(404).json({ message: 'Không tìm thấy chi tiêu' });
        }

        res.json({ message: 'Xóa chi tiêu thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Thống kê chi tiêu
router.get('/stats', auth, async (req, res) => {
    try {
        const { year, month } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const stats = await Expense.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalAmount = await Expense.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        res.json({
            categoryStats: stats,
            totalAmount: totalAmount[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
