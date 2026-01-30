import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { bootstrapAccount } from "@/hooks/useAccountBootstrap";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthMode = "login" | "signup" | "forgot-password" | "update-password";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  // Check for password recovery token on mount
  useEffect(() => {
    const handleRecoveryToken = async () => {
      // Check URL hash for recovery token (Supabase sends tokens in hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        // Set the session with the recovery token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });
        
        if (!error) {
          setMode("update-password");
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          toast.error("Invalid or expired reset link", {
            description: "Please request a new password reset.",
          });
        }
      }
    };

    handleRecoveryToken();

    // Also listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode("update-password");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect if already logged in (but not in update-password mode)
  useEffect(() => {
    if (user && mode !== "update-password") {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location, mode]);

  const validateForm = () => {
    try {
      if (mode === "forgot-password") {
        emailSchema.parse({ email });
      } else if (mode === "update-password") {
        passwordSchema.parse({ password, confirmPassword });
      } else {
        authSchema.parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string; confirmPassword?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
          if (err.path[0] === 'confirmPassword') fieldErrors.confirmPassword = err.message;
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

  const handleUpdatePassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error("Update failed", {
          description: error.message,
        });
        return;
      }
      
      toast.success("Password updated!", {
        description: "You can now sign in with your new password.",
      });
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update password. Please try again.",
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
    
    if (mode === "update-password") {
      await handleUpdatePassword();
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
    if (user && mode !== "update-password") {
      bootstrapAccount(user.id).then(() => {
        navigate('/app/dashboard');
      });
    }
  }, [user, navigate, mode]);

  const getTitle = () => {
    switch (mode) {
      case "signup": return "Create Account";
      case "forgot-password": return "Reset Password";
      case "update-password": return "Set New Password";
      default: return "Welcome Back";
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      switch (mode) {
        case "signup": return "Creating Account...";
        case "forgot-password": return "Sending Reset Link...";
        case "update-password": return "Updating Password...";
        default: return "Authenticating...";
      }
    }
    switch (mode) {
      case "signup": return "Create Account";
      case "forgot-password": return "Send Reset Link";
      case "update-password": return "Update Password";
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

          {mode === "update-password" && (
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Enter your new password below.
            </p>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email - Only show for login/signup/forgot-password */}
            {mode !== "update-password" && (
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
            )}

            {/* Password - Show for login/signup/update-password */}
            {mode !== "forgot-password" && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  {mode === "update-password" ? "New Password" : "Password"}
                </Label>
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

            {/* Confirm Password - Only for update-password */}
            {mode === "update-password" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-danger">{errors.confirmPassword}</p>
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
                  ) : mode === "update-password" ? (
                    <>
                      <Check className="h-4 w-4" />
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

          {/* Google Sign In - Only show for login/signup */}
          {(mode === "login" || mode === "signup") && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isGoogleLoading || isLoading}
                onClick={async () => {
                  setIsGoogleLoading(true);
                  try {
                    const { error, redirected } = await lovable.auth.signInWithOAuth("google", {
                      redirect_uri: window.location.origin,
                    });
                    
                    if (redirected) {
                      return; // Page is redirecting
                    }
                    
                    if (error) {
                      toast.error("Google sign-in failed", {
                        description: error.message,
                      });
                    }
                  } catch (err) {
                    toast.error("Google sign-in failed", {
                      description: "Please try again.",
                    });
                  } finally {
                    setIsGoogleLoading(false);
                  }
                }}
              >
                {isGoogleLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </div>
                )}
              </Button>
            </>
          )}

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
            ) : mode === "update-password" ? (
              <p className="text-center text-sm text-muted-foreground">
                Enter a strong password to secure your account.
              </p>
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
