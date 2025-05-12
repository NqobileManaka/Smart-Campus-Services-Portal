import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const { login, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const { username, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    const success = await login(formData);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Login</h4>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={username}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
              </form>
              <div className="mt-3">
                <p>Don't have an account? <span className="text-primary" style={{cursor: 'pointer'}} onClick={() => navigate('/register')}>Register</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
