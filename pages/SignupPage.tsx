import React, { useState, useContext, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserRole } from '../src/types/types';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setIsLoading(true);

    if (!auth) {
      setError("Authentication service not available.");
      setIsLoading(false);
      return;
    }

    try {
      const success = await auth.signup(name, email, password, role);
      setIsLoading(false);
      if (success) {
        alert(`Signup successful! Please log in as patient.`);
        navigate('/login');
      } else {
        setError('Signup failed. The email might already be in use or an error occurred.');
      }
    } catch (error: any) {
      setIsLoading(false);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please use a different email or log in.');
      } else {
        setError('Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your account type
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setRole(UserRole.PATIENT)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                role === UserRole.PATIENT 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Patient
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="name" className="sr-only">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="-mt-px">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="-mt-px">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="-mt-px">
              <label htmlFor="confirm-password" className="sr-only">Confirm password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : `Sign up`}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
