"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Shield,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { setCookie } from "cookies-next";

import { AuthService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import { LoginRequestSchema } from "@/types/RequestSchemas";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { LoginRequest } from "@/types/RequestInterfaces";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => AuthService.login(data),
    onSuccess: async (response) => {
      await setCookie("token", response.token, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      await setCookie(
        "user",
        JSON.stringify({
          projects: response.projects,
          loginTime: new Date().toISOString(),
        }),
        {
          maxAge: 60 * 60 * 24 * 7,
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      );
      router.push("/dashboard/overview");
    },
    onError: (error: Error) => {
      toast.error("Login failed", {
        description: error.message,
      });
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  aria-hidden="true"
                  focusable="false"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle
                  className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                  aria-hidden="true"
                  focusable="false"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Welcome to IConsole
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed px-2">
              Secure access to your infrastructure management portal
            </p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="space-y-1 text-center pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white leading-tight">
              Sign in to continue
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 sm:space-y-5"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Username</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter your username"
                            autoComplete="username"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            className={cn(
                              "h-10 sm:h-12 pl-10 pr-4 text-sm transition-all duration-200 w-full",
                              "border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl",
                              "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
                              "bg-white dark:bg-slate-700",
                              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                            )}
                          />
                          <User
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 flex-shrink-0"
                            aria-hidden="true"
                            focusable="false"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 leading-relaxed" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Lock className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Password</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className={cn(
                              "h-10 sm:h-12 pl-10 pr-12 text-sm transition-all duration-200 w-full",
                              "border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl",
                              "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
                              "bg-white dark:bg-slate-700",
                              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                            )}
                          />
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 flex-shrink-0" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-600 flex-shrink-0 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-slate-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 leading-relaxed" />
                    </FormItem>
                  )}
                />

                {loginMutation.error && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-start gap-3 p-3 sm:p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl"
                  >
                    <AlertCircle
                      className="h-4 w-4 flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                      focusable="false"
                    />
                    <span className="leading-relaxed break-words">
                      {loginMutation.error.message ||
                        "An error occurred during login. Please try again."}
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className={cn(
                    "w-full h-10 sm:h-12 text-sm font-medium transition-all duration-200 rounded-lg sm:rounded-xl cursor-pointer",
                    "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
                    "text-white shadow-lg",
                    "focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {loginMutation.isPending
                        ? "Signing in..."
                        : "Sign in securely"}
                    </span>
                  </div>
                </Button>
              </form>
            </Form>

            <div className="pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-600">
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                Protected by enterprise-grade security.
                <br />
                By signing in, you agree to our terms of service and privacy
                policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
