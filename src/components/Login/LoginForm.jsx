import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../features/auth/authApi';
import { setCredentials } from '../../features/auth/authSlice';

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const result = await login(formData).unwrap();

      if (result.success && result.data) {
        // STEP 1: Store token and user in localStorage FIRST
        const { token, user } = result.data;

        // Store in localStorage first
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Then update Redux state (which now includes onboarding_completed)
        dispatch(setCredentials({ data: { token, user } }));

        // STEP 2: Small delay to ensure storage is complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // STEP 3: Navigate based on user role and onboarding status
        // For client users (role_id === '3'), check onboarding status from response
        if (user?.role_id === '3') {
          // Check onboarding status from backend response
          if (user.onboarding_completed) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        } else {
          // Admin and staff go directly to dashboard
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Log in to your Account
      </h1>
      <p className="text-muted-foreground mb-8">
        Sign in to continue your business onboarding and integrations.
      </p>

      {error && (
        <div className="error-message mb-4">
          {error.data?.message || 'Login failed. Please try again.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className='text-black'>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className={formErrors.email ? 'error' : ''}
          />
          {formErrors.email && (
            <span className="field-error">{formErrors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className='text-black'>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={formErrors.password ? 'error' : ''}
          />
          {formErrors.password && (
            <span className="field-error">{formErrors.password}</span>
          )}
        </div>

        <button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground rounded-sm"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* <div className="auth-footer mt-6">
        <p>
          Don't have an account?
          <Link to="/signup" className="auth-link"> Sign up</Link>
        </p>
      </div> */}
    </div>
  );
};

export default LoginForm;
