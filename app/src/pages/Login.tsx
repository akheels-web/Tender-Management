import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle, CheckCircle2, LockKeyhole, Mail } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type LoginForm = z.infer<typeof loginSchema>;
type ForgotForm = z.infer<typeof forgotSchema>;

export default function Login() {
  const [view, setView] = useState<"login" | "forgot">("login");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotForm = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.role === "admin") window.location.href = "/admin/dashboard";
      else if (data.role === "agent") window.location.href = "/agent/dashboard";
      else if (data.role === "vendor") window.location.href = "/vendor/dashboard";
      else if (data.role === "superadmin") window.location.href = "/superadmin/dashboard";
    },
    onError: (error) => {
      setErrorMsg(error.message);
    },
  });

  const forgotMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => {
      setSuccessMessage("If an account exists, a password reset link has been sent to your email.");
      forgotForm.reset();
    },
    onError: (error) => {
      setErrorMsg(error.message);
    },
  });

  const onLoginSubmit = (data: LoginForm) => {
    setErrorMsg("");
    setSuccessMessage("");
    loginMutation.mutate(data);
  };

  const onForgotSubmit = (data: ForgotForm) => {
    setErrorMsg("");
    setSuccessMessage("");
    forgotMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#000097] items-center justify-center overflow-hidden">
        {/* Abstract background shapes matching National Finance theme */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('/login_illustration.png')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F9A01B] rounded-full blur-3xl opacity-40 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#000066] rounded-full blur-3xl opacity-60 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 p-12 text-center text-white">
          <img src="/nfc_logo.svg" alt="National Finance" className="h-16 mx-auto mb-8 bg-white p-2 rounded-lg object-contain" />
          <h1 className="text-4xl font-bold mb-4">Tender Management System</h1>
          <p className="text-xl text-teal-100 mb-8 max-w-md mx-auto leading-relaxed">
            Manage your tenders anywhere.
          </p>
          <div className="flex justify-center gap-4">
            <div className="w-16 h-1 bg-[#F9A01B] rounded-full"></div>
            <div className="w-4 h-1 bg-teal-400 rounded-full opacity-50"></div>
            <div className="w-4 h-1 bg-teal-400 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-24 bg-white relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src="/nfc_logo.svg" alt="National Finance" className="h-12 mb-4" />
            <h1 className="text-2xl font-bold text-[#000097]">Tender Portal</h1>
            <p className="text-slate-500 text-sm">Manage your tenders anywhere.</p>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {view === "login" ? "Welcome Back" : "Reset Password"}
            </h2>
            <p className="text-slate-500">
              {view === "login" 
                ? "Enter your credentials to access your account." 
                : "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700">{successMessage}</p>
            </div>
          )}

          {view === "login" && (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <label className="text-sm font-medium text-slate-700">Email Address</label>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <Input 
                            placeholder="name@company.com" 
                            {...field} 
                            className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-[#000097]"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setView("forgot");
                            setErrorMsg("");
                            setSuccessMessage("");
                          }}
                          className="text-sm font-medium text-[#000097] hover:text-[#000066]"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-[#000097]"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#000097] hover:bg-[#000066] text-white text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in to Dashboard"
                  )}
                </Button>
              </form>
            </Form>
          )}

          {view === "forgot" && (
            <Form {...forgotForm}>
              <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-5">
                <FormField
                  control={forgotForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <label className="text-sm font-medium text-slate-700">Email Address</label>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <Input 
                            placeholder="name@company.com" 
                            {...field} 
                            className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-[#000097]"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#F9A01B] hover:bg-[#e08e16] text-white text-base font-medium rounded-lg shadow-md transition-all"
                  disabled={forgotMutation.isPending}
                >
                  {forgotMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setErrorMsg("");
                      setSuccessMessage("");
                    }}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            </Form>
          )}

          {/* Footer Logo */}
          <div className="mt-16 flex justify-center items-center">
            <span className="text-xs text-slate-400 mr-2">Presented by</span>
            <img src="/tct_logo.png" alt="TCT" className="h-6 opacity-70 grayscale hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}
