"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
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
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  const loginErrorMessage =
    loginMutation.error instanceof Error
      ? loginMutation.error.message
      : typeof loginMutation.error === "string"
        ? loginMutation.error
        : loginMutation.error
          ? "An error occurred during login. Please try again."
          : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-[#1DA1F2] via-[#0a8ddb] to-[#005fa3]">
                <Shield
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  aria-hidden="true"
                  focusable="false"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight font-sans">
              Welcome to IConsole
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
              Secure access to your infrastructure management portal
            </p>
          </div>
        </div>

        <Card className="bg-card text-card-foreground shadow-lg rounded-xl border border-border overflow-hidden">
          <CardHeader className="space-y-1 text-center pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground leading-tight font-sans">
              Sign in to continue
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
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
                              "border border-input bg-background text-foreground rounded-full font-sans",
                              "focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
                              "placeholder:text-muted-foreground",
                            )}
                          />
                          <User
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground flex-shrink-0"
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
                              "border border-input bg-background text-foreground rounded-full font-sans",
                              "focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
                              "placeholder:text-muted-foreground",
                            )}
                          />
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 p-0 flex-shrink-0 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 leading-relaxed" />
                    </FormItem>
                  )}
                />

                {loginErrorMessage && (
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
                      {loginErrorMessage}
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className={cn(
                    "w-full h-10 sm:h-12 text-sm font-medium transition-all duration-200 rounded-full cursor-pointer",
                    "bg-primary text-primary-foreground shadow-lg",
                    "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4 flex-shrink-0 transition-colors" />
                    <span className="truncate transition-colors">
                      {loginMutation.isPending
                        ? "Signing in..."
                        : "Sign in securely"}
                    </span>
                  </div>
                </Button>
              </form>
            </Form>

            <div className="pt-3 sm:pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground leading-relaxed px-2">
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
