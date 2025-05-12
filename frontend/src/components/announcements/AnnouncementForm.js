import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

function AnnouncementForm() {
  const navigate = useNavigate();
  const { userRole } = useContext(AuthContext);

  // Redirect if not faculty or admin
  if (userRole !== 'faculty' && userRole !== 'admin') {
    navigate('/dashboard');
  }

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    targetAudience: ['all'],
    isImportant: false,
    expiresAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { title, content, category, targetAudience, isImportant, expiresAt } = formData;

  const onChange = e => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.type === 'checkbox' 
        ? e.target.checked 
        : e.target.value 
    });
  };

  const onChangeAudience = e => {
    const { value, checked } = e.target;
    
    // If "all" is selected, clear other options
    if (value === 'all' && checked) {
      setFormData({
        ...formData,
        targetAudience: ['all']
      });
      return;
    }
    
    // If any other option is selected, remove "all"
    let newAudience = [...targetAudience];
    
    if (checked) {
      // Add to array if checked and not already there
      if (!newAudience.includes(value)) {
        newAudience.push(value);
      }
      // Remove "all" if it's there
      newAudience = newAudience.filter(a => a !== 'all');
    } else {
      // Remove from array if unchecked
      newAudience = newAudience.filter(a => a !== value);
      
      // If nothing is selected, default to "all"
      if (newAudience.length === 0) {
        newAudience = ['all'];
      }
    }
    
    setFormData({
      ...formData,
      targetAudience: newAudience
    });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Basic validation
    if (!title || !content) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/api/announcements', formData);
      navigate('/announcements');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating announcement');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for the expiration date field
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate a default expiration date 30 days from now
  const defaultExpiryDate = new Date();
  defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 30);
  const defaultExpiry = defaultExpiryDate.toISOString().split('T')[0];

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-danger text-white">
              <h4 className="mb-0">Post New Announcement</h4>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Announcement Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={title}
                    onChange={onChange}
                    placeholder="Enter a concise, descriptive title"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={category}
                    onChange={onChange}
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="events">Events</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Target Audience</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="all"
                      name="targetAudience"
                      value="all"
                      checked={targetAudience.includes('all')}
                      onChange={onChangeAudience}
                    />
                    <label className="form-check-label" htmlFor="all">
                      Everyone
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="students"
                      name="targetAudience"
                      value="students"
                      checked={targetAudience.includes('students')}
                      onChange={onChangeAudience}
                    />
                    <label className="form-check-label" htmlFor="students">
                      Students
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="faculty"
                      name="targetAudience"
                      value="faculty"
                      checked={targetAudience.includes('faculty')}
                      onChange={onChangeAudience}
                    />
                    <label className="form-check-label" htmlFor="faculty">
                      Faculty
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="admin"
                      name="targetAudience"
                      value="admin"
                      checked={targetAudience.includes('admin')}
                      onChange={onChangeAudience}
                    />
                    <label className="form-check-label" htmlFor="admin">
                      Administrators
                    </label>
                  </div>
                </div>

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isImportant"
                    name="isImportant"
                    checked={isImportant}
                    onChange={onChange}
                  />
                  <label className="form-check-label" htmlFor="isImportant">
                    Mark as Important
                  </label>
                  <small className="form-text text-muted d-block">
                    Important announcements are highlighted and shown at the top.
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="expiresAt" className="form-label">Expiration Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="expiresAt"
                    name="expiresAt"
                    value={expiresAt || defaultExpiry}
                    onChange={onChange}
                    min={today}
                  />
                  <small className="form-text text-muted">
                    The announcement will no longer be displayed after this date.
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Announcement Content</label>
                  <textarea
                    className="form-control"
                    id="content"
                    name="content"
                    value={content}
                    onChange={onChange}
                    rows="6"
                    placeholder="Enter the detailed content of your announcement"
                    required
                  ></textarea>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-secondary me-md-2"
                    onClick={() => navigate('/announcements')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Posting...
                      </>
                    ) : 'Post Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementForm;
