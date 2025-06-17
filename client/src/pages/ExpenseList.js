import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const ExpenseList = ({ user, onLogout }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: 'all',
        startDate: '',
        endDate: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });

    const categories = [
        { value: 'all', label: 'Tất cả' },
        { value: 'Ăn uống', label: 'Ăn uống' },
        { value: 'Di chuyển', label: 'Di chuyển' },
        { value: 'Mua sắm', label: 'Mua sắm' },
        { value: 'Giải trí', label: 'Giải trí' },
        { value: 'Y tế', label: 'Y tế' },
        { value: 'Khác', label: 'Khác' }
    ];

    useEffect(() => {
        fetchExpenses();
    }, [filters, pagination.currentPage]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.currentPage,
                limit: 10,
                category: filters.category,
                startDate: filters.startDate,
                endDate: filters.endDate
            });

            const response = await axios.get(`/expenses?${params}`);
            setExpenses(response.data.expenses);
            setPagination({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
        setPagination({ ...pagination, currentPage: 1 });
    };

    const handlePageChange = (newPage) => {
        setPagination({ ...pagination, currentPage: newPage });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa chi tiêu này?')) {
            try {
                await axios.delete(`/expenses/${id}`);
                fetchExpenses();
            } catch (error) {
                console.error('Error deleting expense:', error);
                alert('Có lỗi xảy ra khi xóa chi tiêu');
            }
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN') + ' VND';
    };

    return (
        <div className="expense-list-container">
            <Navbar user={user} onLogout={onLogout} />
            
            <div className="expense-list-content">
                <div className="page-header">
                    <h1>Danh sách chi tiêu</h1>
                    <Link to="/add-expense" className="btn btn-primary">
                        Thêm chi tiêu mới
                    </Link>
                </div>

                {/* Filters */}
                <div className="filters">
                    <h3>Bộ lọc</h3>
                    <div className="filter-row">
                        <div className="form-group">
                            <label>Danh mục</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                            >
                                {categories.map(category => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Từ ngày</label>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Đến ngày</label>
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <button
                            onClick={() => {
                                setFilters({
                                    category: 'all',
                                    startDate: '',
                                    endDate: ''
                                });
                            }}
                            className="btn btn-secondary"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>

                {/* Expense Table */}
                <div className="expense-table">
                    {loading ? (
                        <div className="loading">Đang tải...</div>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tiêu đề</th>
                                        <th>Số tiền</th>
                                        <th>Danh mục</th>
                                        <th>Ngày</th>
                                        <th>Hóa đơn</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length > 0 ? (
                                        expenses.map(expense => (
                                            <tr key={expense._id}>
                                                <td>
                                                    <strong>{expense.title}</strong>
                                                    {expense.description && (
                                                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                                                            {expense.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{formatCurrency(expense.amount)}</td>
                                                <td>
                                                    <span className="category-badge">
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td>{formatDate(expense.date)}</td>
                                                <td>
                                                    {expense.receiptId ? (
                                                        <a 
                                                            href={`/uploads/receipts/${expense.receiptId.filename}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="receipt-link"
                                                        >
                                                            Xem hóa đơn
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: '#999' }}>Không có</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="actions">
                                                        <button
                                                            onClick={() => handleDelete(expense._id)}
                                                            className="btn btn-small btn-delete"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                                Không có chi tiêu nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                    >
                                        Trước
                                    </button>

                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={pagination.currentPage === page ? 'active' : ''}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}

                            <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
                                Hiển thị {expenses.length} trong tổng số {pagination.total} chi tiêu
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseList;
