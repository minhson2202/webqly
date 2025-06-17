import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/auth/login', formData);
            onLogin(response.data.token, response.data.user);
        } catch (error) {
            setError(error.response?.data?.message || 'Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Đăng nhập</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                    <input
                        type="text"
                        name="username"
                        placeholder="Email hoặc Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <input
                        type="password"
                        name="password"
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
                
                <p>
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
