import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
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
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const resetSchema = z.object({
  token: z.string().min(1, { message: "Token is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginForm = z.infer<typeof loginSchema>;
type ForgotForm = z.infer<typeof forgotSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export default function Login() {
  const [view, setView] = useState<"login" | "forgot" | "reset">("login");
  const [isLoading, setIsLoading] = useState(false);
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

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: "", password: "" },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.role === "admin") window.location.href = "/admin/dashboard";
      else if (data.role === "agent") window.location.href = "/agent/dashboard";
      else window.location.href = "/vendor/dashboard";
    },
    onError: (error) => {
      setErrorMsg(error.message);
      setIsLoading(false);
    },
  });

  const forgotMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      setSuccessMessage("If that email exists, a reset token has been simulated. Please check the server console.");
      setTimeout(() => {
        setView("reset");
        setSuccessMessage("");
      }, 3000);
    },
    onError: (error) => {
      setErrorMsg(error.message);
      setIsLoading(false);
    },
  });

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      toast.success("Password reset successful. You can now login.");
      setView("login");
      resetForm.reset();
    },
    onError: (error) => {
      setErrorMsg(error.message);
      setIsLoading(false);
    },
  });

  const onLogin = (data: LoginForm) => {
    setIsLoading(true);
    setErrorMsg("");
    loginMutation.mutate(data);
  };

  const onForgot = (data: ForgotForm) => {
    setIsLoading(true);
    setErrorMsg("");
    forgotMutation.mutate(data);
  };

  const onReset = (data: ResetForm) => {
    setIsLoading(true);
    setErrorMsg("");
    resetMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* Left Pane - Forms */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
        
        {/* Branding Logo */}
        <div className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#1A3E7B] flex items-center justify-center overflow-hidden relative">
            <div className="absolute top-1/2 -translate-y-1/2 w-8 h-2 bg-[#1A3E7B]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1A3E7B]">
            National Finance
          </span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-emerald-600 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {view === "login" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Welcome Back!
              </h1>
              <p className="mt-2 text-slate-500 text-sm">
                Please enter log in details below
              </p>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5 mt-8">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Email"
                            className="bg-slate-50 border-slate-200 h-12 px-4 focus-visible:ring-[#1A3E7B]"
                            {...field}
                          />
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
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Password"
                            className="bg-slate-50 border-slate-200 h-12 px-4 focus-visible:ring-[#1A3E7B]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg("");
                        setView("forgot");
                      }}
                      className="text-sm font-medium text-slate-500 hover:text-[#1A3E7B] transition-colors"
                    >
                      Forget password?
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#121212] hover:bg-black text-white font-medium rounded-xl transition-all" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign in"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-12 text-center text-xs text-slate-400">
                <p>For demonstration:</p>
                <p>Admin: admin@protender.com / password123</p>
              </div>
            </div>
          )}

          {view === "forgot" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-12 h-12 bg-[#1A3E7B]/10 rounded-full flex items-center justify-center mb-6">
                <KeyRound className="w-6 h-6 text-[#1A3E7B]" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Forgot Password
              </h1>
              <p className="mt-2 text-slate-500 text-sm">
                Enter your email address to receive a password reset token.
              </p>

              <Form {...forgotForm}>
                <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-5 mt-8">
                  <FormField
                    control={forgotForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Email address"
                            className="bg-slate-50 border-slate-200 h-12 px-4 focus-visible:ring-[#1A3E7B]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#1A3E7B] hover:bg-[#122A54] text-white font-medium rounded-xl transition-all" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Request Reset"}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg("");
                        setView("login");
                      }}
                      className="text-sm font-medium text-slate-500 hover:text-[#1A3E7B] transition-colors"
                    >
                      Back to log in
                    </button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {view === "reset" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-12 h-12 bg-[#F26522]/10 rounded-full flex items-center justify-center mb-6">
                <KeyRound className="w-6 h-6 text-[#F26522]" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Reset Password
              </h1>
              <p className="mt-2 text-slate-500 text-sm">
                Enter the token you received and your new password.
              </p>

              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-5 mt-8">
                  <FormField
                    control={resetForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Reset Token"
                            className="bg-slate-50 border-slate-200 h-12 px-4 focus-visible:ring-[#F26522]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="New Password"
                            className="bg-slate-50 border-slate-200 h-12 px-4 focus-visible:ring-[#F26522]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#F26522] hover:bg-[#D9551A] text-white font-medium rounded-xl transition-all" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Set New Password"}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg("");
                        setView("login");
                      }}
                      className="text-sm font-medium text-slate-500 hover:text-[#1A3E7B] transition-colors"
                    >
                      Back to log in
                    </button>
                  </div>
                </form>
              </Form>
            </div>
          )}

        </div>
      </div>

      {/* Right Pane - Visuals */}
      <div className="hidden lg:flex w-1/2 p-4">
        <div className="w-full h-full bg-[#111111] rounded-3xl overflow-hidden relative flex flex-col items-center justify-center p-12">
          {/* Subtle background glow/patterns */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1A3E7B] rounded-full mix-blend-screen filter blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#F26522] rounded-full mix-blend-screen filter blur-[100px]" />
          </div>

          <div className="relative z-10 w-full max-w-md flex justify-center mb-12">
            <img 
              src="/login-illustration.png" 
              alt="Manage Tenders" 
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>

          <div className="relative z-10 text-center space-y-4">
            <h2 className="text-3xl font-semibold text-white tracking-wide">
              Manage your Tenders Anywhere
            </h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
              You can track your bids, download documents, and manage your vendor profile on the go with our portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
