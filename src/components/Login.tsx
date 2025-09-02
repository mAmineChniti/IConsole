"use client";

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
import { AuthService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type { LoginRequest } from "@/types/RequestInterfaces";
import { LoginRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { setCookie } from "cookies-next";
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
      const now = Date.now();
      const expiresAtMs =
        response.expires_at_ts > 1e12
          ? response.expires_at_ts
          : response.expires_at_ts * 1000;
      const maxAge = Math.max(Math.floor((expiresAtMs - now) / 1000), 0);

      await setCookie(
        "token",
        JSON.stringify({
          token: response.token,
          expires_at: response.expires_at,
          expires_at_ts: response.expires_at_ts,
        }),
        {
          path: "/",
          maxAge,
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      );

      await setCookie(
        "user",
        JSON.stringify({
          user_id: response.user_id,
          username: response.username,
          projects: response.projects,
          loginTime: new Date().toISOString(),
        }),
        {
          path: "/",
          maxAge,
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
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm space-y-6 sm:max-w-md sm:space-y-8">
        <div className="space-y-4 text-center sm:space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1DA1F2] via-[#0a8ddb] to-[#005fa3] shadow-lg sm:h-16 sm:w-16">
                <Shield
                  className="h-6 w-6 text-white sm:h-8 sm:w-8"
                  aria-hidden="true"
                  focusable="false"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-foreground font-sans text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
              Welcome to IConsole
            </h1>
            <p className="text-muted-foreground px-2 text-sm leading-relaxed sm:text-base">
              Secure access to your infrastructure management portal
            </p>
          </div>
        </div>

        <Card className="bg-card text-card-foreground border-border overflow-hidden rounded-xl border shadow-lg">
          <CardHeader className="space-y-1 pb-4 text-center sm:pb-6">
            <CardTitle className="text-card-foreground font-sans text-xl leading-tight font-semibold sm:text-2xl">
              Sign in to continue
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm leading-relaxed">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:space-y-6 sm:px-6">
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
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
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
                              "h-10 w-full pr-4 pl-10 text-sm transition-all duration-200 sm:h-12",
                              "border-input bg-background text-foreground rounded-full border font-sans",
                              "focus:border-ring focus:ring-ring focus:ring-offset-background focus:ring-2 focus:ring-offset-2",
                              "placeholder:text-muted-foreground",
                            )}
                          />
                          <User
                            className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 flex-shrink-0 -translate-y-1/2 transform"
                            aria-hidden="true"
                            focusable="false"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs leading-relaxed text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
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
                              "h-10 w-full pr-12 pl-10 text-sm transition-all duration-200 sm:h-12",
                              "border-input bg-background text-foreground rounded-full border font-sans",
                              "focus:border-ring focus:ring-ring focus:ring-offset-background focus:ring-2 focus:ring-offset-2",
                              "placeholder:text-muted-foreground",
                            )}
                          />
                          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 flex-shrink-0 -translate-y-1/2 transform" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-1/2 right-2 h-6 w-6 flex-shrink-0 -translate-y-1/2 transform cursor-pointer rounded-full p-0 sm:h-8 sm:w-8"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="text-muted-foreground h-4 w-4" />
                            ) : (
                              <Eye className="text-muted-foreground h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs leading-relaxed text-red-500" />
                    </FormItem>
                  )}
                />

                {loginErrorMessage && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:rounded-xl sm:p-4 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                  >
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 flex-shrink-0"
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
                    "h-10 w-full cursor-pointer rounded-full text-sm font-medium transition-all duration-200 sm:h-12",
                    "bg-primary text-primary-foreground shadow-lg",
                    "focus:ring-ring focus:ring-offset-background focus:ring-2 focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4 flex-shrink-0 transition-colors" />
                    <span className="truncate transition-colors">
                      {loginMutation.isPending
                        ? "Signing in..."
                        : "Sign in securely"}
                    </span>
                  </div>
                </Button>
              </form>
            </Form>

            <div className="border-border border-t pt-3 sm:pt-4">
              <p className="text-muted-foreground px-2 text-center text-xs leading-relaxed">
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
