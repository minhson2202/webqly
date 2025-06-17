import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({ totalAmount: 0, categoryStats: [] });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const statsRes = await axios.get(`/expenses/stats?year=${year}&month=${month}`);
      setStats(statsRes.data);

      const expRes = await axios.get('/expenses?limit=5');
      setRecentExpenses(expRes.data.expenses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="dashboard">
      <Navbar user={user} onLogout={onLogout} />
      <div className="dashboard-content">
        <h1>Xin chào, {user.fullName}!</h1>

        <div className="stat-card">
          <h3>Tổng chi tiêu tháng này</h3>
          <p className="amount">{stats.totalAmount.toLocaleString()} VND</p>
        </div>

        <div className="dashboard-section">
          <h3>Chi tiêu theo danh mục</h3>
          {stats.categoryStats.length ? (
            <ul>
              {stats.categoryStats.map(c => (
                <li key={c._id}>{c._id}: {c.total.toLocaleString()} VND</li>
              ))}
            </ul>
          ) : <p>Chưa có dữ liệu</p>}
        </div>

        <div className="dashboard-section">
          <h3>Chi tiêu gần đây</h3>
          {recentExpenses.length ? (
            <ul>
              {recentExpenses.map(e => (
                <li key={e._id}>{e.title} - {e.amount.toLocaleString()} VND</li>
              ))}
            </ul>
          ) : <p>Không có chi tiêu nào</p>}
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
