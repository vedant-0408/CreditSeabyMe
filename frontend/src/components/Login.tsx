import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const navigate = useNavigate();

  // Clear error when switching between login and register
  useEffect(() => {
    setError('');
    setSuccess('');
    setAttemptedSubmit(false);
  }, [isLogin]);

  const handleLogin = async (role: string = '') => {
    setError('');
    setLoading(true);
    setAttemptedSubmit(true);

    // Validate form
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const endpoint = role 
        ? `https://mern-backend-vs.onrender.com/api/auth/login/${role}` 
        : 'https://mern-backend-vs.onrender.com/api/auth/login';
      
      const response = await axios.post(endpoint, {
        email,
        password
      });

      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if(response.data.user.role === 'verifier'){
        navigate('/verifier/dashboard');
      }
      else{
        navigate(`/user/dashboard/${email}`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setAttemptedSubmit(true);

    // Validate form
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // const response = await axios.post('https://mern-backend-vs.onrender.com/api/auth/register', {
      //   username,
      //   email,
      //   password,
      //   role: 'user' // Changed from 'verifier' to 'user' for regular user registration
      // });

      setSuccess('Registration successful! You can now login.');
      setIsLogin(true); // Switch back to login form
      // Clear registration form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin(); // Regular login (will detect role from response)
    } else {
      handleRegister(e);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>CREDIT SEA</h1>
          <p>Loan Application Portal</p>
        </div>

        <div className="login-card">
          <div className="form-toggle">
            <button 
              className={isLogin ? 'active' : ''} 
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              className={!isLogin ? 'active' : ''} 
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          {attemptedSubmit && error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  placeholder="Enter your username"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLogin}
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {isLogin ? (
              <>
                <button 
                  type="submit" 
                  className="login-btn" 
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                
                <div className="role-buttons">
                  <button 
                    type="button" 
                    className="admin-btn" 
                    onClick={() => handleLogin('admin')}
                    disabled={loading}
                  >
                    Login as Admin
                  </button>
                  <button 
                    type="button" 
                    className="verifier-btn" 
                    onClick={() => handleLogin('verifier')}
                    disabled={loading}
                  >
                    Login as Verifier
                  </button>
                </div>
              </>
            ) : (
              <button 
                type="submit" 
                className="register-btn" 
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            )}
          </form>

          <div className="form-footer">
            {isLogin ? (
              <p>Don't have an account? <span onClick={() => setIsLogin(false)}>Register now</span></p>
            ) : (
              <p>Already have an account? <span onClick={() => setIsLogin(true)}>Login</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
