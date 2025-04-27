import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type LoginFormData = {
  email: string;
  password: string;
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const { error: loginError } = await login(data.email, data.password);
      
      if (loginError) {
        setError(loginError.message);
        return;
      }
      
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="form-control">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`form-input ${errors.email ? 'border-error-500' : ''}`}
            placeholder="your@email.com"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
          )}
        </div>
        
        <div className="form-control">
          <div className="flex justify-between">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className={`form-input ${errors.password ? 'border-error-500' : ''}`}
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
          )}
        </div>
        
        <div className="form-control flex items-center">
          <input 
            type="checkbox" 
            id="remember" 
            className="form-checkbox"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
            Remember me
          </label>
        </div>
        
        <button
          type="submit"
          className="w-full btn-primary my-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-800">
          Sign up
        </Link>
      </p>
      
      {/* Demo credentials */}
      <div className="mt-8 rounded-md bg-gray-50 p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Login Credentials</h4>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium text-gray-700">Admin User:</p>
            <p className="text-sm text-gray-600">Email: admin@example.com</p>
            <p className="text-sm text-gray-600">Password: admin123</p>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700">Demo User:</p>
            <p className="text-sm text-gray-600">Email: demo@impactmonitor.com</p>
            <p className="text-sm text-gray-600">Password: demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;