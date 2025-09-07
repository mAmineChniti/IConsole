"use client";

import { DescribeVMTab } from "@/components/Instances/DescribeVMTab";
import { DetailsStep } from "@/components/Instances/DetailsStep";
import { FlavorStep } from "@/components/Instances/FlavorStep";
import { ImageStep } from "@/components/Instances/ImageStep";
import { NetworkStep } from "@/components/Instances/NetworkStep";
import { SummaryStep } from "@/components/Instances/SummaryStep";
import { ErrorCard } from "@/components/reusable/ErrorCard";
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
import { cn } from "@/lib/utils";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type WizardStep = "flavor" | "image" | "network" | "details" | "summary";

export function VM({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<"create" | "describe">("create");
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
      await queryClient.invalidateQueries({
        queryKey: ["instances"],
      });
      await queryClient.invalidateQueries({ queryKey: ["vm-resources"] });
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
    mutationFn: async ({
      vm_name,
      description,
    }: {
      vm_name: string;
      description: string;
    }) => {
      return InfraService.createFromDescription({
        vm_name,
        description,
        timeout: 300,
      });
    },
    onSuccess: async (response) => {
      toast.success("VM created from description!", {
        description: `VM \"${response.server_name}\" is being deployed`,
      });
      await queryClient.invalidateQueries({
        queryKey: ["instances"],
      });
      await queryClient.invalidateQueries({ queryKey: ["vm-resources"] });
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
      {onBack && (
        <div className="mb-2 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground bg-card border-border/50 hover:text-foreground flex cursor-pointer items-center gap-2 rounded-full border transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Instances
          </Button>
        </div>
      )}
      <div
        className="bg-card text-card-foreground border-border/50 flex items-center space-x-1 overflow-hidden rounded-full border p-1"
        role="tablist"
        aria-label="VM tabs"
      >
        <Button
          variant={activeTab === "create" ? "default" : "ghost"}
          className={cn(
            "h-10 min-w-0 flex-1 cursor-pointer rounded-full",
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
          <Plus className="mr-1 h-4 w-4 flex-shrink-0 sm:mr-2" />
          <span className="truncate">Create VM</span>
        </Button>
        <Button
          variant={activeTab === "describe" ? "default" : "ghost"}
          className={cn(
            "h-10 min-w-0 flex-1 cursor-pointer rounded-full",
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
          <Mic className="mr-1 h-4 w-4 flex-shrink-0 sm:mr-2" />
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
          <Card className="bg-card text-card-foreground border-border/50 overflow-hidden rounded-xl border shadow-lg">
            <CardContent className="p-3 sm:p-6">
              <div className="flex w-full items-center overflow-x-auto">
                {steps.map((step, index) => {
                  const isActive = step.key === currentStep;
                  const isCompleted = index < currentStepIndex;
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-shrink-0 items-center"
                      style={{
                        flex: index === steps.length - 1 ? "0 0 auto" : "1",
                        minWidth: "120px",
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all sm:h-10 sm:w-10",
                            isActive
                              ? "bg-primary border-primary text-primary-foreground"
                              : isCompleted
                                ? "border-green-500 bg-green-500 text-white"
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
                            "mt-1 max-w-[100px] text-center text-xs leading-tight font-medium sm:mt-2 sm:text-sm",
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
                            "mx-2 h-0.5 min-w-[40px] flex-1 transition-all sm:mx-4 sm:min-w-[60px]",
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

          <Card className="bg-card text-card-foreground border-border/50 overflow-hidden rounded-xl border shadow-lg">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {(() => {
                  const step = steps.find((s) => s.key === currentStep);
                  const StepIcon = step?.icon ?? Cpu;
                  return (
                    <>
                      <div className="bg-primary/10 flex-shrink-0 rounded-full p-2">
                        <StepIcon className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
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
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={currentStepIndex === 0}
                    className="order-2 w-full cursor-pointer rounded-full sm:order-1 sm:w-auto"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Previous</span>
                  </Button>
                  <Button
                    onClick={goToNextStep}
                    className="bg-primary text-primary-foreground order-1 w-full cursor-pointer rounded-full sm:order-2 sm:w-auto"
                  >
                    <span className="truncate">Next</span>
                    <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
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
            onCreateVM={(desc) =>
              describeVMMutation.mutate({
                vm_name: desc.vm_name,
                description: desc.description,
              })
            }
            isCreating={describeVMMutation.isPending}
          />
        </div>
      )}
    </div>
  );
}
