import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  organization: string;
  agreeTerms: boolean;
};

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<RegisterFormData>({
    defaultValues: {
      agreeTerms: false
    }
  });
  
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (!data.agreeTerms) {
        setError('You must agree to the terms and conditions');
        return;
      }
      
      setIsSubmitting(true);
      setError(null);
      
      const { error: registerError } = await registerUser(data.email, data.password);
      
      if (registerError) {
        setError(registerError.message);
        return;
      }
      
      // Registration successful, redirect to dashboard
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
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
          <label htmlFor="organization" className="form-label">
            Organization Name
          </label>
          <input
            id="organization"
            type="text"
            className={`form-input ${errors.organization ? 'border-error-500' : ''}`}
            placeholder="Your organization"
            {...register('organization', { required: 'Organization name is required' })}
          />
          {errors.organization && (
            <p className="mt-1 text-sm text-error-600">{errors.organization.message}</p>
          )}
        </div>
        
        <div className="form-control">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`form-input ${errors.password ? 'border-error-500' : ''}`}
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' }
            })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
          )}
        </div>
        
        <div className="form-control">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`form-input ${errors.confirmPassword ? 'border-error-500' : ''}`}
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <div className="form-control flex items-center">
          <input 
            type="checkbox" 
            id="agreeTerms" 
            className={`form-checkbox ${errors.agreeTerms ? 'border-error-500' : ''}`}
            {...register('agreeTerms', { required: true })}
          />
          <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-700">
            I agree to the <a href="#" className="text-primary-600 hover:text-primary-800">Terms of Service</a> and <a href="#" className="text-primary-600 hover:text-primary-800">Privacy Policy</a>
          </label>
        </div>
        {errors.agreeTerms && (
          <p className="mt-1 text-sm text-error-600">You must agree to the terms and conditions</p>
        )}
        
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
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-800">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;