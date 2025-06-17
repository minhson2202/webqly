import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
	<div className="navbar-logo">
	  <Link to="/">
	    <span role="img" aria-label="money" style={{ marginRight: '6px' }}>💰</span>
	    <span className="brand-text">Chi tiêu</span>
	  </Link>
	</div>

      <ul className="navbar-menu">
        <li><Link to="/dashboard">Trang chủ</Link></li>
        <li><Link to="/expenses">Danh sách</Link></li>
        <li><Link to="/add-expense">Thêm mới</Link></li>
        <li><Link to="/statistics">Thống kê</Link></li>
      </ul>
      <div className="navbar-user">
        <span>{user?.fullName}</span>
        <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
      </div>
    </nav>
  );
};

export default Navbar;
