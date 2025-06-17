import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const AddExpense = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        receiptId: ''
    });
    const [receipt, setReceipt] = useState(null);
    const [receipts, setReceipts] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const categories = [
        'Ăn uống',
        'Di chuyển',
        'Mua sắm',
        'Giải trí',
        'Y tế',
        'Khác'
    ];

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const response = await axios.get('/receipts');
            setReceipts(response.data);
        } catch (error) {
            console.error('Error fetching receipts:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra kích thước file (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File không được vượt quá 5MB');
                return;
            }
            
            // Kiểm tra loại file
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError('Chỉ cho phép upload file ảnh (JPEG, PNG, GIF) hoặc PDF');
                return;
            }
            
            setReceipt(file);
            setError('');
        }
    };

    const handleUploadReceipt = async () => {
        if (!receipt) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('receipt', receipt);

        try {
            const response = await axios.post('/receipts/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData(prev => ({
                ...prev,
                receiptId: response.data.receipt.id
            }));

            setSuccess('Upload hóa đơn thành công');
            await fetchReceipts(); // Cập nhật danh sách receipts
            setReceipt(null);
        } catch (error) {
            setError(error.response?.data?.message || 'Lỗi upload hóa đơn');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            
	    const dataToSend = { ...formData };

	// Xử lý receiptId rỗng ("" → undefined)
	    if (!dataToSend.receiptId) {
	       delete dataToSend.receiptId;
	    }

	    dataToSend.amount = parseFloat(dataToSend.amount);

	    await axios.post('/expenses', dataToSend);

            setSuccess('Thêm chi tiêu thành công');
            
            // Reset form
            setFormData({
                title: '',
                amount: '',
                category: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                receiptId: ''
            });

            // Chuyển về trang danh sách sau 2 giây
            setTimeout(() => {
                navigate('/expenses');
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="expense-form-container">
            <Navbar user={user} onLogout={onLogout} />
            
            <div className="expense-form-content">
                <h1>Thêm chi tiêu mới</h1>
                
                <form onSubmit={handleSubmit} className="expense-form">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    
                    <div className="form-group">
                        <label>Tiêu đề *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Ví dụ: Mua cà phê"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Số tiền *</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                min="0"
                                step="1000"
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Danh mục *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Chọn danh mục</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Ngày</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Mô tả chi tiết về chi tiêu..."
                        />
                    </div>

                    {/* Receipt Upload Section */}
                    <div className="form-group">
                        <label>Upload hóa đơn</label>
                        <div className="file-upload">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                id="receipt-upload"
                            />
                            <label htmlFor="receipt-upload" style={{ cursor: 'pointer' }}>
                                {receipt ? (
                                    <div>
                                        <p>File đã chọn: {receipt.name}</p>
                                        <button
                                            type="button"
                                            onClick={handleUploadReceipt}
                                            disabled={uploading}
                                            className="btn btn-primary"
                                        >
                                            {uploading ? 'Đang upload...' : 'Upload hóa đơn'}
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p>Kéo thả file vào đây hoặc click để chọn</p>
                                        <small>Hỗ trợ: JPG, PNG, GIF, PDF (tối đa 5MB)</small>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Existing Receipts Selection */}
                    {receipts.length > 0 && (
                        <div className="form-group">
                            <label>Hoặc chọn hóa đơn đã upload</label>
                            <select
                                name="receiptId"
                                value={formData.receiptId}
                                onChange={handleChange}
                            >
                                <option value="">Không chọn hóa đơn</option>
                                {receipts.map(receipt => (
                                    <option key={receipt._id} value={receipt._id}>
                                        {receipt.originalName} - {new Date(receipt.uploadDate).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? 'Đang lưu...' : 'Thêm chi tiêu'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/expenses')}
                            className="btn btn-secondary"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpense;
