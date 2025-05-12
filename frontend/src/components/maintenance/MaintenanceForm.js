import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MaintenanceForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { title, description, location, priority } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!title || !description || !location) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/api/maintenance', formData);
      navigate('/maintenance');
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting maintenance request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h4 className="mb-0">Submit Maintenance Request</h4>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Issue Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={title}
                    onChange={onChange}
                    placeholder="Briefly describe the issue"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="location" className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    value={location}
                    onChange={onChange}
                    placeholder="Building, room number, floor, etc."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select
                    className="form-select"
                    id="priority"
                    name="priority"
                    value={priority}
                    onChange={onChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <small className="form-text text-muted">
                    Please select an appropriate priority level for this issue.
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Detailed Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={description}
                    onChange={onChange}
                    rows="4"
                    placeholder="Please provide details about the issue, including when you noticed it and any other relevant information."
                    required
                  ></textarea>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-secondary me-md-2"
                    onClick={() => navigate('/maintenance')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-warning"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : 'Submit Request'}
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

export default MaintenanceForm;
