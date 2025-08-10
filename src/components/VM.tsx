"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Cpu,
  HardDrive,
  Network,
  Plus,
  Settings,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DetailsStep } from "@/components/DetailsStep";
import { ErrorCard } from "@/components/ErrorCard";
import { FlavorStep } from "@/components/FlavorStep";
import { ImageStep } from "@/components/ImageStep";
import { ImportVMTab } from "@/components/ImportVMTab";
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
import { cn } from "@/lib/utils";
import type {
  CombinedVMData,
  FlavorFormData,
  ImageFormData,
  ImportVMFormData,
  NetworkFormData,
  VMCreateRequest,
  VMDetailsFormData,
} from "@/types/RequestInterfaces";
import {
  flavorSchema,
  imageSchema,
  importVMSchema,
  networkSchema,
  vmDetailsSchema,
} from "@/types/RequestSchemas";

type WizardStep = "flavor" | "image" | "network" | "details" | "summary";

export function VM() {
  const [activeTab, setActiveTab] = useState<"create" | "import">("create");
  const [currentStep, setCurrentStep] = useState<WizardStep>("flavor");
  const [combinedData, setCombinedData] = useState<Partial<CombinedVMData>>({});
  const queryClient = useQueryClient();
  const [importFile, setImportFile] = useState<File | undefined>(undefined);

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

  const importForm = useForm<ImportVMFormData>({
    resolver: zodResolver(importVMSchema),
    defaultValues: {
      vm_name: "",
      description: "",
      min_disk: 20,
      min_ram: 2048,
      is_public: false,
      flavor_id: "",
      network_id: "",
      key_name: "",
      security_group: "",
      admin_password: "",
    },
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
    onError: (error) => {
      toast.error(`Failed to create VM: ${error.message}`);
    },
  });

  const importVMMutation = useMutation({
    mutationFn: async (data: ImportVMFormData) => {
      if (!importFile) {
        throw new Error("Please select a VMDK file to import");
      }
      const formData = new FormData();
      formData.append("vmdk_file", importFile);
      formData.append("vm_name", data.vm_name);
      formData.append("description", data.description ?? "");
      formData.append("min_disk", data.min_disk?.toString() ?? "20");
      formData.append("min_ram", data.min_ram?.toString() ?? "2048");
      formData.append("is_public", data.is_public.toString());
      formData.append("flavor_id", data.flavor_id);
      formData.append("network_id", data.network_id);
      formData.append("key_name", data.key_name);
      formData.append("security_group", data.security_group);
      formData.append("admin_password", data.admin_password);
      return InfraService.importVMwareVM(formData);
    },
    onSuccess: async (response) => {
      toast.success("VM imported successfully!", {
        description: `VM \"${response.server.name}\" has been imported and deployed`,
      });
      importForm.reset();
      setImportFile(undefined);
      await queryClient.invalidateQueries({ queryKey: ["instances-list"] });
    },
    onError: (error) => {
      toast.error(`Failed to import VM: ${error.message}`);
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

  return (
    <div className="space-y-6">
      <div
        className="flex items-center space-x-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 rounded-xl p-1"
        role="tablist"
        aria-label="VM tabs"
      >
        <Button
          variant={activeTab === "create" ? "default" : "ghost"}
          className={cn(
            "flex-1 h-10 cursor-pointer",
            activeTab === "create" &&
              "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
          )}
          onClick={() => setActiveTab("create")}
          role="tab"
          aria-selected={activeTab === "create"}
          aria-controls="create-tab-panel"
          id="create-tab"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create VM
        </Button>
        <Button
          variant={activeTab === "import" ? "default" : "ghost"}
          className={cn(
            "flex-1 h-10 cursor-pointer",
            activeTab === "import" &&
              "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
          )}
          onClick={() => setActiveTab("import")}
          role="tab"
          aria-selected={activeTab === "import"}
          aria-controls="import-tab-panel"
          id="import-tab"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import VM
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
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center w-full">
                {steps.map((step, index) => {
                  const isActive = step.key === currentStep;
                  const isCompleted = index < currentStepIndex;
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className="flex items-center"
                      style={{
                        flex: index === steps.length - 1 ? "0 0 auto" : "1",
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                            isActive
                              ? "bg-blue-600 border-blue-600 text-white"
                              : isCompleted
                                ? "bg-green-600 border-green-600 text-white"
                                : "bg-muted border-muted-foreground/30 text-muted-foreground",
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <StepIcon className="h-5 w-5" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "mt-2 text-sm font-medium text-center whitespace-nowrap",
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : isCompleted
                                ? "text-green-600 dark:text-green-400"
                                : "text-muted-foreground",
                          )}
                        >
                          {step.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={cn(
                            "flex-1 h-0.5 mx-4 transition-all min-w-[60px]",
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

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const step = steps.find((s) => s.key === currentStep);
                  const StepIcon = step?.icon ?? Cpu;
                  return (
                    <>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <StepIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      {step?.title}
                    </>
                  );
                })()}
              </CardTitle>
              <CardDescription>
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
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={currentStepIndex === 0}
                    className="cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={goToNextStep} className="cursor-pointer">
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      ) : (
        <div
          role="tabpanel"
          id="import-tab-panel"
          aria-labelledby="import-tab"
          tabIndex={0}
        >
          <ImportVMTab
            form={importForm}
            resources={resources}
            isLoading={resourcesLoading}
            onImportVM={(data) => importVMMutation.mutate(data)}
            isCreating={importVMMutation.isPending}
            importFile={importFile}
            setImportFile={setImportFile}
          />
        </div>
      )}
    </div>
  );
}
