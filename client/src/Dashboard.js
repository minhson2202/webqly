import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Dashboard = ({ user, onLogout }) => {
    const [stats, setStats] = useState({
        totalAmount: 0,
        categoryStats: []
    });
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            // Lấy thống kê tháng hiện tại
            const statsResponse = await axios.get(`/expenses/stats?year=${year}&month=${month}`);
            setStats(statsResponse.data);

            // Lấy 5 chi tiêu gần nhất
            const expensesResponse = await axios.get('/expenses?limit=5');
            setRecentExpenses(expensesResponse.data.expenses);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="dashboard">
            <Navbar user={user} onLogout={onLogout} />
            
            <div className="dashboard-content">
                <h1>Xin chào, {user.fullName}!</h1>
                
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <h3>Tổng chi tiêu tháng này</h3>
                        <p className="amount">{stats.totalAmount.toLocaleString()} VND</p>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-section">
                        <h3>Chi tiêu theo danh mục</h3>
                        {stats.categoryStats.length > 0 ? (
                            <ul className="category-list">
                                {stats.categoryStats.map(category => (
                                    <li key={category._id}>
                                        <span>{category._id}</span>
                                        <span>{category.total.toLocaleString()} VND</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Chưa có chi tiêu nào trong tháng này</p>
                        )}
                    </div>

                    <div className="dashboard-section">
                        <h3>Chi tiêu gần đây</h3>
                        {recentExpenses.length > 0 ? (
                            <ul className="expense-list">
                                {recentExpenses.map(expense => (
                                    <li key={expense._id}>
                                        <div>
                                            <strong>{expense.title}</strong>
                                            <span className="category">{expense.category}</span>
                                        </div>
                                        <span className="amount">{expense.amount.toLocaleString()} VND</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Chưa có chi tiêu nào</p>
                        )}
                        <Link to="/expenses" className="view-all-link">Xem tất cả</Link>
                    </div>
                </div>

                <div className="quick-actions">
                    <Link to="/add-expense" className="btn btn-primary">Thêm chi tiêu</Link>
                    <Link to="/statistics" className="btn btn-secondary">Xem thống kê</Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
