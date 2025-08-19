"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Cpu,
  HardDrive,
  Mic,
  Network,
  Plus,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DescribeVMTab } from "@/components/DescribeVMTab";
import { DetailsStep } from "@/components/DetailsStep";
import { ErrorCard } from "@/components/ErrorCard";
import { FlavorStep } from "@/components/FlavorStep";
import { ImageStep } from "@/components/ImageStep";
import { NetworkStep } from "@/components/NetworkStep";
import { SummaryStep } from "@/components/SummaryStep";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { InfraService } from "@/lib/requests";
import type {
  CombinedVMData,
  FlavorFormData,
  ImageFormData,
  NetworkFormData,
  VMCreateRequest,
  VMDetailsFormData,
} from "@/types/RequestInterfaces";
import {
  flavorSchema,
  imageSchema,
  networkSchema,
  vmDetailsSchema,
} from "@/types/RequestSchemas";

import { cn } from "@/lib/utils";
type WizardStep = "flavor" | "image" | "network" | "details" | "summary";
export function VM() {
  const [activeTab, setActiveTab] = useState<"create" | "describe" | undefined>(
    undefined,
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("vm-active-tab");
      if (saved === "create" || saved === "describe") {
        setActiveTab(saved);
      } else {
        setActiveTab("create");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && activeTab) {
      window.localStorage.setItem("vm-active-tab", activeTab);
    }
  }, [activeTab]);
  const [currentStep, setCurrentStep] = useState<WizardStep>("flavor");
  const [combinedData, setCombinedData] = useState<Partial<CombinedVMData>>({});
  const queryClient = useQueryClient();

  const {
    data: resources,
    isLoading: resourcesLoading,
    error: resourcesError,
    refetch: refetchResources,
  } = useQuery({
    queryKey: ["vm-resources"],
    queryFn: () => InfraService.listResources(),
    staleTime: 5 * 60 * 1000,
  });

  const flavorForm = useForm<FlavorFormData>({
    resolver: zodResolver(flavorSchema),
    defaultValues: { flavor_id: "" },
  });

  const imageForm = useForm<ImageFormData>({
    resolver: zodResolver(imageSchema),
    defaultValues: { image_id: "" },
  });

  const networkForm = useForm<NetworkFormData>({
    resolver: zodResolver(networkSchema),
    defaultValues: { network_id: "", key_name: "", security_group: "" },
  });

  const vmDetailsForm = useForm<VMDetailsFormData>({
    resolver: zodResolver(vmDetailsSchema),
    defaultValues: { name: "", admin_username: "", admin_password: "" },
  });

  const steps: { key: WizardStep; title: string; icon: typeof Cpu }[] = [
    { key: "flavor", title: "Flavor & Resources", icon: Cpu },
    { key: "image", title: "Operating System", icon: HardDrive },
    { key: "network", title: "Network & Security", icon: Network },
    { key: "details", title: "VM Details", icon: Settings },
    { key: "summary", title: "Summary", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

  const goToNextStep = async () => {
    const formMap = {
      flavor: flavorForm,
      image: imageForm,
      network: networkForm,
      details: vmDetailsForm,
    };
    const form = formMap[currentStep as keyof typeof formMap];
    if (!form) return;

    const isValid = await form.trigger();
    if (isValid) {
      setCombinedData((prev) => ({ ...prev, ...form.getValues() }));
    }

    if (isValid && currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep.key);
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep.key);
      }
    }
  };

  const createVMMutation = useMutation({
    mutationFn: async () => {
      const requestData: VMCreateRequest = {
        name: vmDetailsForm.getValues("name"),
        image_id: imageForm.getValues("image_id"),
        flavor_id: flavorForm.getValues("flavor_id"),
        network_id: networkForm.getValues("network_id"),
        key_name: networkForm.getValues("key_name"),
        security_group: networkForm.getValues("security_group"),
        admin_username: vmDetailsForm.getValues("admin_username"),
        admin_password: vmDetailsForm.getValues("admin_password"),
      };

      return InfraService.createVM(requestData);
    },
    onSuccess: async (response) => {
      toast.success("VM created successfully!", {
        description: `VM \"${response.server.name}\" is being deployed`,
      });
      setCurrentStep("flavor");
      setCombinedData({});
      flavorForm.reset();
      imageForm.reset();
      networkForm.reset();
      vmDetailsForm.reset();
      await queryClient.invalidateQueries({ queryKey: ["instances-list"] });
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

  const describeVMMutation = useMutation({
    mutationFn: async (description: string) => {
      return InfraService.createFromDescription({ description });
    },
    onSuccess: async (response) => {
      toast.success("VM created from description!", {
        description: `VM \"${response.server_name}\" is being deployed`,
      });
      await queryClient.invalidateQueries({ queryKey: ["instances-list"] });
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

  if (resourcesError) {
    return (
      <ErrorCard
        title="Failed to Load Resources"
        message={
          resourcesError?.message ||
          "Unable to fetch VM resources. Please check your connection and try again."
        }
        onRetry={() => refetchResources()}
      />
    );
  }

  if (activeTab === undefined) return undefined;

  return (
    <div className="space-y-6">
      <div
        className="flex items-center space-x-1 bg-card text-card-foreground border border-border/50 rounded-full p-1 overflow-hidden"
        role="tablist"
        aria-label="VM tabs"
      >
        <Button
          variant={activeTab === "create" ? "default" : "ghost"}
          className={cn(
            "flex-1 h-10 min-w-0 rounded-full cursor-pointer",
            activeTab === "create"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "",
          )}
          onClick={() => setActiveTab("create")}
          role="tab"
          aria-selected={activeTab === "create"}
          aria-controls="create-tab-panel"
          id="create-tab"
        >
          <Plus className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="truncate">Create VM</span>
        </Button>
        <Button
          variant={activeTab === "describe" ? "default" : "ghost"}
          className={cn(
            "flex-1 h-10 min-w-0 rounded-full cursor-pointer",
            activeTab === "describe"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "",
          )}
          onClick={() => setActiveTab("describe")}
          role="tab"
          aria-selected={activeTab === "describe"}
          aria-controls="describe-tab-panel"
          id="describe-tab"
        >
          <Mic className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="truncate">Describe VM</span>
        </Button>
      </div>

      {activeTab === "create" ? (
        <div
          className="space-y-6"
          role="tabpanel"
          id="create-tab-panel"
          aria-labelledby="create-tab"
          tabIndex={0}
        >
          <Card className="bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center w-full overflow-x-auto">
                {steps.map((step, index) => {
                  const isActive = step.key === currentStep;
                  const isCompleted = index < currentStepIndex;
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className="flex items-center flex-shrink-0"
                      style={{
                        flex: index === steps.length - 1 ? "0 0 auto" : "1",
                        minWidth: "120px",
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all",
                            isActive
                              ? "bg-primary border-primary text-primary-foreground"
                              : isCompleted
                                ? "bg-green-500 border-green-500 text-white"
                                : "bg-muted border-border text-muted-foreground",
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-center max-w-[100px] leading-tight",
                            isActive
                              ? "text-primary"
                              : isCompleted
                                ? "text-green-500 dark:text-green-400"
                                : "text-muted-foreground",
                          )}
                        >
                          {step.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={cn(
                            "flex-1 h-0.5 mx-2 sm:mx-4 transition-all min-w-[40px] sm:min-w-[60px]",
                            index < currentStepIndex
                              ? "bg-green-600"
                              : "bg-muted-foreground/30",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {(() => {
                  const step = steps.find((s) => s.key === currentStep);
                  const StepIcon = step?.icon ?? Cpu;
                  return (
                    <>
                      <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                        <StepIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <span className="truncate">{step?.title}</span>
                    </>
                  );
                })()}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {currentStep === "flavor" &&
                  "Select the flavor and verify available resources for your VM"}
                {currentStep === "image" &&
                  "Choose the operating system image for your VM"}
                {currentStep === "network" &&
                  "Configure network settings and security for your VM"}
                {currentStep === "details" &&
                  "Set VM name and administrative credentials"}
                {currentStep === "summary" &&
                  "Review your configuration and create the VM"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === "flavor" && (
                <FlavorStep
                  form={flavorForm}
                  resources={resources}
                  isLoading={resourcesLoading}
                />
              )}
              {currentStep === "image" && (
                <ImageStep
                  form={imageForm}
                  resources={resources}
                  isLoading={resourcesLoading}
                />
              )}
              {currentStep === "network" && (
                <NetworkStep
                  form={networkForm}
                  resources={resources}
                  isLoading={resourcesLoading}
                />
              )}
              {currentStep === "details" && (
                <DetailsStep form={vmDetailsForm} />
              )}
              {currentStep === "summary" && (
                <SummaryStep
                  data={combinedData}
                  resources={resources}
                  onCreateVM={() => createVMMutation.mutate()}
                  onCancel={goToPreviousStep}
                  isCreating={createVMMutation.isPending}
                />
              )}
            </CardContent>

            {currentStep !== "summary" && (
              <CardContent className="pt-0">
                <Separator className="mb-6" />
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={currentStepIndex === 0}
                    className="rounded-full cursor-pointer w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Previous</span>
                  </Button>
                  <Button
                    onClick={goToNextStep}
                    className="rounded-full cursor-pointer w-full sm:w-auto order-1 sm:order-2 bg-primary text-primary-foreground"
                  >
                    <span className="truncate">Next</span>
                    <ArrowRight className="h-4 w-4 ml-2 flex-shrink-0" />
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      ) : (
        <div
          role="tabpanel"
          id="describe-tab-panel"
          aria-labelledby="describe-tab"
          tabIndex={0}
        >
          <DescribeVMTab
            onCreateVM={(desc) => describeVMMutation.mutate(desc)}
            isCreating={describeVMMutation.isPending}
          />
        </div>
      )}
    </div>
  );
}
