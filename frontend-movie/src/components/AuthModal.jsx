import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, AlertCircle, Check, ChevronLeft, LogIn, UserPlus, Key } from 'lucide-react';

const AuthModal = ({ isOpen = true, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });
  const [animationComplete, setAnimationComplete] = useState(false);

  // Reset form state when form type changes
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
      username: '',
      confirmPassword: ''
    });
    setErrors({});
    setSuccessMessage('');
    setLoading(false);
  }, [isLogin, isResetPassword]);

  // Set animation complete after delay
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setAnimationComplete(false);
    }
  }, [isOpen]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user begins typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Password strength checker
    if (name === 'password' && value) {
      let score = 0;
      let feedback = '';
      
      if (value.length >= 8) score += 1;
      if (value.match(/[A-Z]/)) score += 1;
      if (value.match(/[0-9]/)) score += 1;
      if (value.match(/[^A-Za-z0-9]/)) score += 1;
      
      if (score === 0) feedback = 'Very weak';
      else if (score === 1) feedback = 'Weak';
      else if (score === 2) feedback = 'Moderate';
      else if (score === 3) feedback = 'Strong';
      else feedback = 'Very strong';
      
      setPasswordStrength({ score, feedback });
    } else if (name === 'password') {
      setPasswordStrength({ score: 0, feedback: '' });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation for login and signup
    if (!isResetPassword) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (!isLogin && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!isLogin && !formData.password.match(/[A-Z]/)) {
        newErrors.password = 'Password must contain an uppercase letter';
      } else if (!isLogin && !formData.password.match(/[0-9]/)) {
        newErrors.password = 'Password must contain a number';
      }
    }
    
    // Username validation for signup
    if (!isLogin && !isResetPassword) {
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3 || formData.username.length > 30) {
        newErrors.username = 'Username must be between 3 and 30 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores';
      }
      
      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // API call for login
  const loginUser = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include', // Include cookies
      });

      // Check if the response has a body before parsing
      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Login failed');
        } catch (parseError) {
          throw new Error(text || `Login failed with status: ${response.status}`);
        }
      }

      // If response is ok, parse the JSON
      const data = await response.json();
      setSuccessMessage('Successfully logged in!');

      if (onSuccess) {
        setTimeout(() => onSuccess(data.user), 1000);
      }

      return data;
    } catch (error) {
      setErrors({ form: error.message || 'An error occurred during login' });
      return null;
    }
  };
  
  // API call for signup
  const signupUser = async () => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
        }),
        credentials: 'include', // Include cookies
      });

      // Check if the response has a body before parsing
      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Signup failed');
        } catch (parseError) {
          throw new Error(text || `Signup failed with status: ${response.status}`);
        }
      }

      // If response is ok, parse the JSON
      const data = await response.json();
      setSuccessMessage('Account created successfully!');

      if (onSuccess) {
        setTimeout(() => onSuccess(data.user), 1000);
      }

      return data;
    } catch (error) {
      setErrors({ form: error.message || 'An error occurred during signup' });
      return null;
    }
  };
  
  // API call for password reset
  const resetPassword = async () => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
        credentials: 'include', // Include cookies
      });

      // Check if the response has a body before parsing
      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Password reset request failed');
        } catch (parseError) {
          throw new Error(text || `Password reset request failed with status: ${response.status}`);
        }
      }

      // If response is ok, parse the JSON
      const data = await response.json();
      setSuccessMessage('If your email is registered, you will receive a password reset link soon.');

      return data;
    } catch (error) {
      setErrors({ form: error.message || 'An error occurred during password reset' });
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Perform appropriate API call based on form type
      if (isResetPassword) {
        await resetPassword();
      } else if (isLogin) {
        await loginUser();
      } else {
        await signupUser();
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Close modal
  const handleClose = () => {
    if (onClose) onClose();
  };

  // Switch between login and signup forms
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsResetPassword(false);
  };

  // Show password reset form
  const showResetForm = () => {
    setIsResetPassword(true);
  };

  // Go back from password reset to login
  const backToLogin = () => {
    setIsResetPassword(false);
  };

  // Return null if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 transition-colors duration-300">
      {/* Cinematic overlay with blurred gradient background */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm">
        {/* Film reel animations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
          {/* Film strips */}
          <div className="absolute top-10 left-0 w-full h-16 bg-gradient-to-r from-transparent via-gray-800/20 to-transparent transform -skew-y-3 animate-slide-right"></div>
          <div className="absolute top-40 left-0 w-full h-16 bg-gradient-to-r from-transparent via-gray-800/30 to-transparent transform skew-y-3 animate-slide-left"></div>
          <div className="absolute bottom-40 left-0 w-full h-16 bg-gradient-to-r from-transparent via-gray-800/20 to-transparent transform -skew-y-3 animate-slide-right"></div>
          
          {/* Film reel holes */}
          <div className="absolute top-0 left-0 w-full h-full flex justify-between py-20">
            <div className="w-8 h-full flex flex-col justify-around items-center">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-gray-500/40"></div>
              ))}
            </div>
            <div className="w-8 h-full flex flex-col justify-around items-center">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-gray-500/40"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating movie-related particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-500/20 animate-float"
              style={{
                width: `${Math.random() * 12 + 4}px`,
                height: `${Math.random() * 12 + 4}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.2
              }}
            ></div>
          ))}
        </div>
        
        {/* Spotlight effects */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" 
          style={{animationDuration: '7s'}}></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse"
          style={{animationDuration: '5s'}}></div>
      </div>
      
      {/* Modal wrapper with entry animation */}
      <div className={`relative transform transition-all duration-500 ease-out ${animationComplete ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Cinema ticket shape with perforation */}
        <div className="absolute -top-4 -bottom-4 left-6 border-l border-dashed border-gray-500/30 z-10"></div>
        
        {/* Modal Card */}
        <div className="relative w-full max-w-md mx-4 bg-gray-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl">
          {/* Theater lights effect */}
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-t from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
          
          {/* Glass effect header with projector light animation */}
          <div className="relative bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-blue-600/30 p-6 border-b border-gray-700/50 overflow-hidden">
            {/* Animated light beam effect */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-blue-500/10 rotate-45 animate-pulse"></div>
            
            <div className="relative flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {isResetPassword && (
                  <button onClick={backToLogin} className="mr-2 p-1 rounded-full hover:bg-gray-800/50 transition-colors text-gray-400 hover:text-white">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  {isResetPassword ? (
                    <Key size={20} className="text-white" />
                  ) : isLogin ? (
                    <LogIn size={20} className="text-white" />
                  ) : (
                    <UserPlus size={20} className="text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isResetPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {isResetPassword 
                      ? 'Enter your email to receive a reset link' 
                      : (isLogin 
                          ? 'Sign in to continue to CineSearch' 
                          : 'Join the CineSearch community')}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-800/50 transition-colors text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Form Content */}
          <div className="p-6 relative">
            {/* Film texture overlay */}
            <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjOWY5ZjlmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiM4ODgiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')]"></div>
            
            {/* Generic Form Error */}
            {errors.form && (
              <div className="mb-6 bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-center transform transition-all duration-300 animate-fade-in-up">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mr-2">
                    <AlertCircle size={14} className="text-red-400" />
                  </div>
                  <p className="text-red-300 text-sm font-medium">{errors.form}</p>
                </div>
              </div>
            )}
            
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 bg-green-900/30 border border-green-500/30 rounded-lg p-3 text-center transform transition-all duration-300 animate-fade-in-up">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-2">
                    <Check size={14} className="text-green-400" />
                  </div>
                  <p className="text-green-300 text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Form with staggered animation for fields */}
            <form onSubmit={handleSubmit} className="space-y-5 relative">
              {/* Email Field */}
              <div className={`space-y-1 transition-all duration-300 delay-100 transform ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <label className="text-sm font-medium text-gray-300 flex items-center">
                  <Mail size={14} className="mr-1.5 text-blue-400" />
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full py-2.5 px-4 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-100 placeholder-gray-500 transition-all text-sm"
                  />
                  {errors.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                      <AlertCircle size={16} />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Username Field - Only for Signup */}
              {!isLogin && !isResetPassword && (
                <div className={`space-y-1 transition-all duration-300 delay-150 transform ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <label className="text-sm font-medium text-gray-300 flex items-center">
                    <User size={14} className="mr-1.5 text-blue-400" />
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      className="w-full py-2.5 px-4 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-100 placeholder-gray-500 transition-all text-sm"
                    />
                    {errors.username && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                        <AlertCircle size={16} />
                      </div>
                    )}
                  </div>
                  {errors.username && (
                    <p className="text-red-400 text-xs mt-1">{errors.username}</p>
                  )}
                </div>
              )}

              {/* Password Field - Not for Reset Password */}
              {!isResetPassword && (
                <div className={`space-y-1 transition-all duration-300 delay-200 transform ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <label className="text-sm font-medium text-gray-300 flex items-center">
                    <Lock size={14} className="mr-1.5 text-blue-400" />
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={isLogin ? "Enter your password" : "Create a password"}
                      className="w-full py-2.5 px-4 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-100 placeholder-gray-500 transition-all text-sm pr-10 group-hover:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {!isLogin && passwordStrength.feedback && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Password strength:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.score <= 1 ? 'text-red-400' : 
                          passwordStrength.score === 2 ? 'text-yellow-400' : 
                          passwordStrength.score >= 3 ? 'text-green-400' : ''
                        }`}>{passwordStrength.feedback}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            passwordStrength.score <= 1 ? 'bg-red-500' : 
                            passwordStrength.score === 2 ? 'bg-yellow-500' : 
                            passwordStrength.score >= 3 ? 'bg-green-500' : ''
                          } transition-all duration-500 ease-out`}
                          style={{ width: `${passwordStrength.score * 25}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
              )}

              {/* Confirm Password Field - Only for Signup */}
              {!isLogin && !isResetPassword && (
                <div className={`space-y-1 transition-all duration-300 delay-250 transform ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <label className="text-sm font-medium text-gray-300 flex items-center">
                    <Lock size={14} className="mr-1.5 text-blue-400" />
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full py-2.5 px-4 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-100 placeholder-gray-500 transition-all text-sm"
                    />
                    {errors.confirmPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                        <AlertCircle size={16} />
                      </div>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Forgot Password Link - Only for Login */}
              {isLogin && (
                <div className={`text-right transition-all duration-300 delay-300 transform ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <button 
                    type="button"
                    onClick={showResetForm}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div className={`transition-all duration-300 delay-350 transform ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg shadow-blue-700/30 transition-all duration-200 flex items-center justify-center ${loading ? 'opacity-80' : ''}`}
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : isResetPassword ? (
                    'Send Reset Link'
                  ) : isLogin ? (
                    'Sign In'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>

            {/* Form Toggle */}
            {!isResetPassword && (
              <div className={`mt-6 text-center text-sm text-gray-400 transition-all duration-300 delay-400 transform ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  type="button"
                  onClick={toggleForm}
                  className="ml-1 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            )}

            {/* Social Login Divider */}
            {!isResetPassword && (
              <div className={`mt-6 flex items-center transition-all duration-300 delay-450 transform ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-3 text-xs text-gray-500">OR CONTINUE WITH</div>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>
            )}

            {/* Social Login Buttons */}
            {!isResetPassword && (
              <div className={`mt-6 grid grid-cols-3 gap-3 transition-all duration-300 delay-500 transform ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                {/* Google */}
                <button 
                  type="button"
                  className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-gray-800 hover:bg-gray-750 border border-gray-700 text-gray-300 transition-colors hover:border-gray-600 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5.22,16.25 5.22,12.27C5.22,8.29 8.36,5.28 12.19,5.28C15.14,5.28 16.95,7.23 16.95,7.23L18.68,5.5C18.68,5.5 16.36,2.92 12.19,2.92C6.92,2.92 2.51,7.5 2.51,12.27C2.51,17.04 6.92,21.62 12.19,21.62C17.24,21.62 21.31,17.86 21.31,12.45C21.31,11.69 21.35,11.1 21.35,11.1Z" />
                  </svg>
                </button>
                
                {/* Facebook */}
                <button 
                  type="button"
                  className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-gray-800 hover:bg-gray-750 border border-gray-700 text-gray-300 transition-colors hover:border-gray-600 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9 21.59 18.03 20.37 19.54 18.53C21.04 16.69 21.88 14.36 21.9 12C21.9 6.53 17.5 2.04 12 2.04Z" />
                  </svg>
                </button>
                
                {/* Twitter */}
                <button 
                  type="button"
                  className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-gray-800 hover:bg-gray-750 border border-gray-700 text-gray-300 transition-colors hover:border-gray-600 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Fine Print */}
            {!isResetPassword && !isLogin && (
              <div className={`mt-6 text-xs text-gray-500 text-center transition-all duration-300 delay-550 transform ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                By creating an account, you agree to our 
                <a href="#" className="text-blue-400 hover:text-blue-300 mx-1">Terms of Service</a>
                and
                <a href="#" className="text-blue-400 hover:text-blue-300 ml-1">Privacy Policy</a>.
              </div>
            )}
          </div>
          
          {/* Footer with cinema-themed decoration */}
          <div className="relative h-8 bg-gray-950/50 overflow-hidden">
            {/* Cinema seats row illustration */}
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="w-3 h-1.5 bg-gray-700 rounded-t-sm mx-0.5"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;