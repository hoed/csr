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
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/public/background.webp')" }}>
      <div className="w-full max-w-md p-8 backdrop-blur-md bg-white/10 rounded-xl shadow-xl border border-white/20">
        <form onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="form-control">
            <label htmlFor="email" className="form-label text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`form-input bg-white/20 text-white placeholder-gray-300 ${errors.email ? 'border-error-500' : 'border-white/30'}`}
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
              <label htmlFor="password" className="form-label text-white">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-white hover:text-gray-200">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className={`form-input bg-white/20 text-white placeholder-gray-300 ${errors.password ? 'border-error-500' : 'border-white/30'}`}
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
              className="form-checkbox border-white/30 text-white"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-white">
              Remember me
            </label>
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-md hover:from-blue-600 hover:to-purple-700 transition-colors my-4 disabled:opacity-50"
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
        
        <p className="mt-6 text-center text-sm text-white">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-300 hover:text-blue-200">
            Sign up
          </Link>
        </p>
        
        {/* Demo credentials */}
        <div className="mt-8 rounded-md bg-white/10 p-4 border border-white/20">
          <h4 className="text-sm font-medium text-white mb-2">Login Credentials</h4>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-200">Admin User:</p>
              <p className="text-sm text-gray-300">Email: admin@example.com</p>
              <p className="text-sm text-gray-300">Password: admin123</p>
            </div>
            <div className="pt-2 border-t border-white/20">
              <p className="text-sm font-medium text-gray-200">Demo User:</p>
              <p className="text-sm text-gray-300">Email: demo@impactmonitor.com</p>
              <p className="text-sm text-gray-300">Password: demo123</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="absolute bottom-0 w-full py-4 text-center text-sm text-white bg-black/30">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        <div className="mt-2">
          <Link to="/terms" className="text-white hover:text-gray-200 mx-2">Terms</Link>
          <Link to="/privacy" className="text-white hover:text-gray-200 mx-2">Privacy</Link>
          <Link to="/contact" className="text-white hover:text-gray-200 mx-2">Contact</Link>
        </div>
      </footer>
    </div>
  );
};

export default Login;