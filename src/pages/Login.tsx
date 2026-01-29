import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { bootstrapAccount } from "@/hooks/useAccountBootstrap";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type AuthMode = "login" | "signup" | "forgot-password";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const validateForm = () => {
    try {
      if (mode === "forgot-password") {
        emailSchema.parse({ email });
      } else {
        authSchema.parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      
      if (error) {
        toast.error("Reset failed", {
          description: error.message,
        });
        return;
      }
      
      toast.success("Reset email sent!", {
        description: "Check your inbox for the password reset link.",
      });
      setMode("login");
    } catch (error) {
      toast.error("Error", {
        description: "Failed to send reset email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "forgot-password") {
      await handleForgotPassword();
      return;
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error("Account already exists", {
              description: "Please sign in instead.",
            });
          } else {
            toast.error("Sign up failed", {
              description: error.message,
            });
          }
          return;
        }
        
        toast.success("Account created!", {
          description: "Setting up your trading environment...",
        });
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast.error("Invalid credentials", {
              description: "Please check your email and password.",
            });
          } else {
            toast.error("Sign in failed", {
              description: error.message,
            });
          }
          return;
        }
        
        toast.success("Welcome back, Trader", {
          description: "System initialized. Stay disciplined.",
        });
      }
    } catch (error) {
      toast.error("Authentication error", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // After successful auth, bootstrap account
  useEffect(() => {
    if (user) {
      bootstrapAccount(user.id).then(() => {
        navigate('/app/dashboard');
      });
    }
  }, [user, navigate]);

  const getTitle = () => {
    switch (mode) {
      case "signup": return "Create Account";
      case "forgot-password": return "Reset Password";
      default: return "Welcome Back";
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      switch (mode) {
        case "signup": return "Creating Account...";
        case "forgot-password": return "Sending Reset Link...";
        default: return "Authenticating...";
      }
    }
    switch (mode) {
      case "signup": return "Create Account";
      case "forgot-password": return "Send Reset Link";
      default: return "Sign In";
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:50px_50px] opacity-5" />
      <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />

      {/* Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4">
            <Shield className="h-16 w-16 text-primary" />
            <div className="absolute inset-0 animate-pulse-glow" />
          </div>
          <h1 className="text-center font-mono text-2xl font-bold">
            <span className="text-primary">RRE</span>
            <span className="text-muted-foreground"> OS</span>
            <span className="text-foreground"> PRO</span>
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Rapid Re-Entry Trading Operating System
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card-elevated w-full max-w-md p-6 sm:p-8">
          <h2 className="mb-6 text-center text-xl font-semibold">
            {getTitle()}
          </h2>
          
          {mode === "forgot-password" && (
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset your password.
            </p>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="trader@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger">{errors.email}</p>
              )}
            </div>

            {/* Password - Only show for login/signup */}
            {mode !== "forgot-password" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-danger">{errors.password}</p>
                )}
              </div>
            )}

            {/* Forgot Password Link - Only on login */}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot-password");
                    setErrors({});
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="execute"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {getButtonText()}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {mode === "signup" ? (
                    <>
                      <UserPlus className="h-4 w-4" />
                      {getButtonText()}
                    </>
                  ) : mode === "forgot-password" ? (
                    <>
                      <Mail className="h-4 w-4" />
                      {getButtonText()}
                    </>
                  ) : (
                    <>
                      {getButtonText()}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </div>
              )}
            </Button>
          </form>

          {/* Toggle Modes */}
          <div className="mt-6">
            {mode === "forgot-password" ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMode("login");
                  setErrors({});
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {mode === "signup" ? "Already have an account?" : "New to RRE OS?"}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => {
                    setMode(mode === "signup" ? "login" : "signup");
                    setErrors({});
                  }}
                >
                  {mode === "signup" ? "Sign In Instead" : "Create an Account"}
                </Button>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you acknowledge that this system does NOT guarantee profits and all trading decisions are your responsibility.
          </p>
        </div>

        {/* Version */}
        <p className="mt-8 font-mono text-xs text-muted-foreground">v4.0.0</p>
      </div>
    </div>
  );
}
