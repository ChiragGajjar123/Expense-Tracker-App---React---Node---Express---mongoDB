import { useState } from 'react';
import {
  Wallet, Mail, Lock, User, Eye, EyeOff,
  ArrowRight, Loader2, AlertCircle, CheckCircle2,
  TrendingUp, PieChart, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (!result.success) {
          setError(result.message || 'Login failed.');
        }
      } else {
        const result = await register(formData.name, formData.email, formData.password);
        if (!result.success) {
          setError(result.message || 'Registration failed.');
        }
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: TrendingUp, title: 'Track Expenses', desc: 'Monitor every dollar in and out' },
    { icon: PieChart, title: 'Visual Analytics', desc: 'Charts that reveal spending patterns' },
    { icon: Shield, title: 'Budget Goals', desc: 'Set limits and stay on track' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex">
      {/* Left Hero Section — hidden on mobile */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/25">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Expensy</h1>
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold text-white/90 leading-tight mb-4">
            Take control of your <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              financial future
            </span>
          </h2>
          <p className="text-lg text-blue-200/60 mb-12 max-w-md">
            Smart expense tracking that helps you understand where your money goes and how to save more.
          </p>

          <div className="space-y-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 group"
              >
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                  <f.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{f.title}</h4>
                  <p className="text-blue-200/40 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/25">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Expensy</h1>
          </div>

          {/* Form Card */}
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h3>
              <p className="text-blue-200/50 text-sm sm:text-base">
                {isLogin ? 'Sign in to continue managing your finances' : 'Start your journey to financial freedom'}
              </p>
            </div>

            {/* Error / Success messages */}
            {error && (
              <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-300" id="auth-error">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-3 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-300" id="auth-success">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field — register only */}
              {!isLogin && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/30" />
                    <input
                      id="auth-name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-blue-200/70 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/30" />
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-blue-200/70 mb-2">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/30" />
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/30 hover:text-blue-300/60 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!isLogin && formData.password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          formData.password.length < 8
                            ? 'bg-red-500 w-1/4'
                            : formData.password.length < 10
                            ? 'bg-yellow-500 w-1/2'
                            : formData.password.length < 12
                            ? 'bg-blue-500 w-3/4'
                            : 'bg-emerald-500 w-full'
                        }`}
                        style={{
                          width:
                            formData.password.length < 8
                              ? '25%'
                              : formData.password.length < 10
                              ? '50%'
                              : formData.password.length < 12
                              ? '75%'
                              : '100%'
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        formData.password.length < 8
                          ? 'text-red-400'
                          : formData.password.length < 10
                          ? 'text-yellow-400'
                          : formData.password.length < 12
                          ? 'text-blue-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {formData.password.length < 8
                        ? 'Weak'
                        : formData.password.length < 10
                        ? 'Fair'
                        : formData.password.length < 12
                        ? 'Good'
                        : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password — register only */}
              {!isLogin && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/30" />
                    <input
                      id="auth-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required={!isLogin}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/30 hover:text-blue-300/60 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                id="auth-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-blue-600/50 disabled:to-indigo-600/50 text-white font-bold py-3.5 sm:py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Switch mode */}
            <div className="mt-8 text-center">
              <p className="text-blue-200/40 text-sm">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  id="auth-switch-mode"
                  onClick={switchMode}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
                >
                  {isLogin ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-blue-200/20 text-xs mt-6">
            Your data is encrypted and secured
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
