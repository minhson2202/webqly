import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Statistics = ({ user, onLogout }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({ categoryStats: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/expenses/stats?year=${year}&month=${month}`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [month, year]);

  return (
	<div className="statistics-container">
	  <Navbar user={user} onLogout={onLogout} />
	  <div className="statistics-content">
	    <h1>Thống kê chi tiêu</h1>

	    {/* Bộ lọc tháng + năm */}
	    <div className="form-row">
	      <select value={month} onChange={e => setMonth(Number(e.target.value))}>
		{[...Array(12)].map((_, i) => (
		  <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
		))}
	      </select>
	      <input
		  type="number"
		  list="year-options"
		  value={year}
		  onChange={(e) => setYear(Number(e.target.value))}
		  className="year-input"
		/>

		<datalist id="year-options">
		  {Array.from({ length: 10 }, (_, i) => {
		    const y = 2020 + i;
		    return <option key={y} value={y} />;
		  })}
		</datalist>
	    </div>

	    {loading ? (
	      <div className="loading">Đang tải...</div>
	    ) : (
	      <>
		<div className="chart-container">
		  <h2 style={{ color: "#2d3748" }}>
		    Tổng chi tiêu: <span style={{ color: "#667eea" }}>{stats.totalAmount.toLocaleString()} VND</span>
		  </h2>

		  {stats.categoryStats.length > 0 ? (
		    <div className="category-list">
		      {stats.categoryStats.map(stat => (
		        <div key={stat._id} className="category-card">
		          <span className="category-name">{stat._id}</span>
		          <span className="category-amount">{stat.total.toLocaleString()} VND</span>
		        </div>
		      ))}
		    </div>
		  ) : (
		    <p>Không có chi tiêu trong tháng này</p>
		  )}
		</div>
	      </>
	    )}
	  </div>
	</div>

  );
};

export default Statistics;
