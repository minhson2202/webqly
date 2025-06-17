import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/auth/register', formData);
      onLogin(res.data.token, res.data.user);
    } catch (err) {
	console.error('Đăng ký lỗi:', err);
	setError(
	  err.response?.data?.message || 
	  err.message || 
	  'Lỗi không xác định'
	);

      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Đăng ký</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <input type="text" name="username" placeholder="Username" required onChange={handleChange} />
        </div>
        <div className="form-group">
          <input type="text" name="fullName" placeholder="Họ tên" required onChange={handleChange} />
        </div>
        <div className="form-group">
          <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        </div>
        <div className="form-group">
          <input type="password" name="password" placeholder="Mật khẩu" required onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng ký'}</button>
        <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </form>
    </div>
  );
};

export default Register;
