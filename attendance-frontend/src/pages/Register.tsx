import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { GraduationCap, Eye, EyeOff, Loader2, School, User, Mail, Lock, MapPin, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import api from '@/services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    schoolName: '',
    schoolAddress: '',
  });

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Progress calculation
  const filledFields = [form.name, form.email, form.password, form.schoolName].filter(Boolean).length;
  const progressPct = Math.round((filledFields / 4) * 100);

  // Password strength
  const passwordStrength = form.password.length === 0 ? 0 : form.password.length < 4 ? 25 : form.password.length < 6 ? 50 : form.password.length < 8 ? 75 : 100;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][Math.ceil(passwordStrength / 25)];
  const strengthColor = passwordStrength <= 25 ? 'bg-red-500' : passwordStrength <= 50 ? 'bg-orange-500' : passwordStrength <= 75 ? 'bg-yellow-500' : 'bg-green-500';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/register', form);
      const { token, teacher, school } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('teacher', JSON.stringify(teacher));
      localStorage.setItem('school', JSON.stringify(school));
      toast.success('Account created! Welcome to AttendEase.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g., Priya Sharma', icon: User, value: form.name, onChange: handleChange('name') },
    { id: 'email', label: 'Email Address', type: 'email', placeholder: 'teacher@school.edu.in', icon: Mail, value: form.email, onChange: handleChange('email') },
    { id: 'schoolName', label: 'School Name', type: 'text', placeholder: 'e.g., Govt. Primary School, Ratnagiri', icon: School, value: form.schoolName, onChange: handleChange('schoolName') },
    { id: 'schoolAddress', label: 'School Address (optional)', type: 'text', placeholder: 'Village, District, State', icon: MapPin, value: form.schoolAddress, onChange: handleChange('schoolAddress'), required: false },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[42%] auth-left-panel flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[10%] right-[15%] w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl float" />
          <div className="absolute bottom-[20%] left-[5%] w-56 h-56 rounded-full bg-violet-400/10 blur-3xl float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight">AttendEase</span>
              <p className="text-indigo-300/60 text-[10px] font-medium tracking-widest uppercase">School Management</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-indigo-100 text-xs font-medium">Free for government schools</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Join thousands of
            <br />
            <span className="bg-gradient-to-r from-indigo-200 via-violet-200 to-purple-200 bg-clip-text text-transparent">
              rural schools
            </span>
          </h2>
          <p className="text-indigo-200/70 mb-10 max-w-sm leading-relaxed">
            Set up your school's attendance system in under 2 minutes. No technical knowledge required.
          </p>

          <div className="space-y-3">
            {['Free for government schools', 'Works on low-bandwidth networks', 'Hindi & regional language support soon', 'Instant setup, zero training needed'].map((item, i) => (
              <div key={item} className={`flex items-center gap-3 fade-in stagger-${i + 1}`}>
                <div className="w-6 h-6 rounded-full bg-green-400/15 flex items-center justify-center flex-shrink-0 border border-green-400/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                </div>
                <span className="text-indigo-100/90 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[58%] flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-white overflow-y-auto">
        <div className="w-full max-w-[440px] py-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">AttendEase</span>
          </div>

          <Card className="auth-glass-card border-0 shadow-xl">
            <CardHeader className="pb-2 pt-8 px-8">
              <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</CardTitle>
              <CardDescription className="text-gray-500 text-sm mt-1">
                Register your school and start tracking attendance today
              </CardDescription>

              {/* Progress bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Progress</span>
                  <span className="text-[10px] font-bold text-indigo-600">{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-1.5" />
              </div>
            </CardHeader>

            <CardContent className="px-8 pb-8 pt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                {fields.map(({ id, label, type, placeholder, icon: Icon, value, onChange, required: req = true }) => (
                  <div key={id} className="space-y-1.5">
                    <Label htmlFor={id} className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {label}
                    </Label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id={id}
                        type={type}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        required={req}
                        className="h-11 pl-10 bg-gray-50/80 border-gray-200/80 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 transition-all rounded-xl text-sm"
                      />
                    </div>
                  </div>
                ))}

                {/* Password field */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={handleChange('password')}
                      required
                      className="h-11 pl-10 pr-10 bg-gray-50/80 border-gray-200/80 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 transition-all rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength indicator */}
                  {form.password.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3, 4].map((seg) => (
                          <div
                            key={seg}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              seg <= Math.ceil(passwordStrength / 25) ? strengthColor : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-[10px] font-semibold ${passwordStrength <= 50 ? 'text-orange-500' : 'text-green-600'}`}>
                        {strengthLabel}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 rounded-xl mt-2 shine btn-glow"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</>
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <Separator className="bg-gray-200/60" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  Already registered?
                </span>
              </div>

              <p className="text-center text-sm text-gray-500">
                Have an account?{' '}
                <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-[11px] text-gray-400 mt-6">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
