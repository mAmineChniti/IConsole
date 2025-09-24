"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, GitBranch, Loader2, Lock, Terminal } from "lucide-react";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Form validation schema
const formSchema = z.object({
  gitlabUrl: z.url("Please enter a valid GitLab project URL"),
  namespace: z.string().min(1, "Namespace is required"),
  dockerhubUsername: z.string().min(1, "DockerHub username is required"),
  containerPort: z.coerce
    .number()
    .int()
    .positive("Container port must be a positive number"),
  externalPort: z.coerce
    .number()
    .int()
    .min(30000, "External port must be at least 30000")
    .max(32767, "External port must be at most 32767"),
  token: z.string().min(1, "Token is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CICDDeployment() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      gitlabUrl: "",
      namespace: "",
      dockerhubUsername: "",
      containerPort: 3000,
      externalPort: 30000,
      token: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (_data) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success message
      toast.success("Pipeline configured successfully", {
        description: "Your CI/CD pipeline has been set up successfully.",
      });

      // Reset form
      form.reset();
    } catch {
      toast.error("Failed to configure pipeline", {
        description: "An error occurred while setting up the CI/CD pipeline.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 text-card-foreground rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="gitlabUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <svg
                          className="text-muted-foreground h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51a.42.42 0 0 1 .11-.18.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.27l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
                        </svg>
                        GitLab Project URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://gitlab.com/username/project"
                          className="rounded-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="namespace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <svg
                          className="text-muted-foreground h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                          <path d="M12 6a1 1 0 0 0-1 1v6a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1z" />
                        </svg>
                        Namespace
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="your-namespace"
                          className="rounded-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dockerhubUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Box className="text-muted-foreground h-4 w-4" />
                        DockerHub Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="dockerhub-username"
                          className="rounded-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="text-muted-foreground h-4 w-4" />
                        Access Token
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••••••"
                          className="rounded-full"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Token with API access to your GitLab repository
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="containerPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Terminal className="text-muted-foreground h-4 w-4" />
                        Container Port
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="65535"
                          className="rounded-full"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="externalPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <svg
                          className="text-muted-foreground h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        External Port (NodePort)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="30000"
                          max="32767"
                          className="rounded-full"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Must be between 30000-32767
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="min-w-[140px] cursor-pointer gap-2 rounded-full"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Configuring...</span>
                    </>
                  ) : (
                    <>
                      <GitBranch className="h-4 w-4" />
                      <span>Configure Pipeline</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
