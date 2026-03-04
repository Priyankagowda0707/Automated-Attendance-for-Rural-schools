import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { GraduationCap, Users, BarChart3, CalendarCheck, Eye, EyeOff, Loader2, ArrowRight, Shield, Sparkles } from 'lucide-react';
import api from '@/services/api';

const features = [
  { icon: CalendarCheck, text: 'One-click bulk attendance marking', desc: 'Mark entire class in seconds' },
  { icon: Users, text: 'Unlimited student management', desc: 'Organize by class & section' },
  { icon: BarChart3, text: 'Real-time analytics & reports', desc: 'Track trends instantly' },
  { icon: Shield, text: 'Secure & reliable', desc: 'Data encrypted & backed up' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, teacher, school } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('teacher', JSON.stringify(teacher));
      localStorage.setItem('school', JSON.stringify(school));
      toast.success(`Welcome back, ${teacher.name}!`);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Animated gradient with features */}
      <div className="hidden lg:flex lg:w-1/2 auth-left-panel flex-col justify-between p-12 relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[10%] right-[15%] w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl float" />
          <div className="absolute bottom-[15%] left-[10%] w-56 h-56 rounded-full bg-violet-400/10 blur-3xl float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[50%] left-[40%] w-40 h-40 rounded-full bg-blue-400/8 blur-3xl float" style={{ animationDelay: '4s' }} />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10 fade-in">
          <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-xl tracking-tight">AttendEase</span>
            <p className="text-indigo-300/60 text-[10px] font-medium tracking-widest uppercase">School Management</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 fade-in" style={{ animationDelay: '200ms' }}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-indigo-100 text-xs font-medium">Trusted by 500+ rural schools</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 text-balance leading-[1.15] tracking-tight">
            Automated Attendance
            <br />
            <span className="bg-gradient-to-r from-indigo-200 via-violet-200 to-purple-200 bg-clip-text text-transparent">
              for Rural Schools
            </span>
          </h2>
          <p className="text-indigo-200/80 text-base mb-10 text-balance leading-relaxed max-w-md">
            Save time, improve accuracy, and empower teachers across India's rural schools with our simple, powerful platform.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, text, desc }, i) => (
              <div
                key={text}
                className={`bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 border border-white/[0.08] transition-all hover:bg-white/[0.1] hover:border-white/[0.15] fade-in stagger-${i + 1}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-indigo-200" />
                </div>
                <p className="text-white text-sm font-semibold mb-0.5">{text}</p>
                <p className="text-indigo-300/60 text-[11px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-indigo-400/40 text-xs">
            Based on ASER 2024 — Empowering rural education across India
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">AttendEase</span>
          </div>

          <Card className="auth-glass-card border-0 shadow-xl">
            <CardHeader className="pb-2 pt-8 px-8">
              <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-gray-500 text-sm mt-1">
                Sign in to your teacher account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-4">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="teacher@school.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 bg-gray-50/80 border-gray-200/80 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 transition-all rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-11 bg-gray-50/80 border-gray-200/80 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 transition-all pr-10 rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" className="rounded border-gray-300" />
                    <label htmlFor="remember" className="text-xs text-gray-500 font-medium cursor-pointer">Remember me</label>
                  </div>
                  <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 rounded-xl shine btn-glow"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <Separator className="bg-gray-200/60" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  New here?
                </span>
              </div>

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                  Register your school
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* Bottom text */}
          <p className="text-center text-[11px] text-gray-400 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
