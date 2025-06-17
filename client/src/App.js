import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExpenseList from './pages/ExpenseList';
import AddExpense from './pages/AddExpense';
import Statistics from './pages/Statistics';
import './App.css';

// Cấu hình axios
axios.defaults.baseURL = 'http://localhost:5000/api';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Verify token và lấy thông tin user
            axios.get('/auth/me')
                .then(response => {
                    setUser(response.data.user);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route 
                        path="/login" 
                        element={!user ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} 
                    />
                    <Route 
                        path="/register" 
                        element={!user ? <Register onLogin={login} /> : <Navigate to="/dashboard" />} 
                    />
                    <Route 
                        path="/dashboard" 
                        element={user ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" />} 
                    />
                    <Route 
                        path="/expenses" 
                        element={user ? <ExpenseList user={user} onLogout={logout} /> : <Navigate to="/login" />} 
                    />
                    <Route 
                        path="/add-expense" 
                        element={user ? <AddExpense user={user} onLogout={logout} /> : <Navigate to="/login" />} 
                    />
                    <Route 
                        path="/statistics" 
                        element={user ? <Statistics user={user} onLogout={logout} /> : <Navigate to="/login" />} 
                    />
                    <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
