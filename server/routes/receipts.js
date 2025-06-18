const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Receipt = require('../models/Receipt');
const auth = require('../middleware/auth');

const router = express.Router();

// Cấu hình multer cho upload file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
	const uploadPath = path.join(__dirname, '../uploads/receipts');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh (JPEG, PNG, GIF) hoặc PDF'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

// Upload hóa đơn
router.post('/upload', auth, upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn file để upload' });
        }

        const receipt = new Receipt({
            userId: req.user._id,
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        await receipt.save();

        res.status(201).json({
            message: 'Upload hóa đơn thành công',
            receipt: {
                id: receipt._id,
                filename: receipt.filename,
                originalName: receipt.originalName,
                size: receipt.size,
                uploadDate: receipt.uploadDate
            }
        });
    } catch (error) {
        // Xóa file nếu có lỗi xảy ra
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Lấy danh sách hóa đơn
router.get('/', auth, async (req, res) => {
    try {
        const receipts = await Receipt.find({ userId: req.user._id })
            .sort({ uploadDate: -1 });

        res.json(receipts);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Xóa hóa đơn
router.delete('/:id', auth, async (req, res) => {
    try {
        const receipt = await Receipt.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!receipt) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }

        // Xóa file khỏi server
        fs.unlink(receipt.path, (err) => {
            if (err) console.error('Error deleting file:', err);
        });

        await Receipt.findByIdAndDelete(req.params.id);

        res.json({ message: 'Xóa hóa đơn thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
