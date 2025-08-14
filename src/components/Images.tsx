"use client";

import { HardDrive, Plus, Search, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ErrorCard } from "@/components/ErrorCard";
import { GetDistroIcon } from "@/components/GetDistroIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageService, InfraService } from "@/lib/requests";
import type { ResourcesResponse } from "@/types/ResponseInterfaces";

interface ImportImageForm {
  imageUrl: string;
  imageName: string;
  visibility: "private" | "public";
}

export function Images() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importForm, setImportForm] = useState<ImportImageForm>({
    imageUrl: "",
    imageName: "",
    visibility: "private",
  });

  const {
    data: images = [],
    isLoading: loading,
    error,
    refetch: fetchImages,
    isFetching,
  } = useQuery({
    queryKey: ["images"],
    queryFn: async () => {
      const data: ResourcesResponse = await InfraService.listResources();
      return data.images || [];
    },
  });

  const importMutation = useMutation({
    mutationFn: async (formData: ImportImageForm) => {
      return await ImageService.importFromUrl({
        image_url: formData.imageUrl,
        image_name: formData.imageName,
        visibility: formData.visibility,
      });
    },
    onSuccess: () => {
      setImportForm({
        imageUrl: "",
        imageName: "",
        visibility: "private",
      });
      setIsImportDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (err) => {
      console.error("Error importing image:", err);
    },
  });

  const handleImportImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importForm.imageUrl || !importForm.imageName) return;

    importMutation.mutate(importForm);
  };

  const filteredImages = images.filter((image) =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredImages.length;
  const visibleData = filteredImages.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="space-y-6 px-2 sm:px-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />
                  <Skeleton className="h-5 sm:h-6 w-3/4" />
                </div>
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Failed to Load Images"
        message={
          error?.message ||
          "Unable to fetch image data. Please check your connection and try again."
        }
        onRetry={() => fetchImages()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div className="text-sm text-muted-foreground leading-relaxed">
          {totalItems} image{totalItems !== 1 ? "s" : ""} total
          {totalItems > 0 && (
            <>
              {" • "}
              Showing {Math.min(visibleCount, totalItems)} of {totalItems}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 w-full"
          />
        </div>

        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 cursor-pointer w-full sm:w-auto min-w-[140px]"
            >
              <Plus className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Import Image</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 left-1/2 translate-x-[-50%]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold truncate">
                Import Image from URL
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleImportImage} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm font-medium">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.qcow2"
                  value={importForm.imageUrl}
                  onChange={(e) =>
                    setImportForm({ ...importForm, imageUrl: e.target.value })
                  }
                  className="h-10 w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageName" className="text-sm font-medium">
                  Image Name
                </Label>
                <Input
                  id="imageName"
                  placeholder="My Custom Image"
                  value={importForm.imageName}
                  onChange={(e) =>
                    setImportForm({ ...importForm, imageName: e.target.value })
                  }
                  className="h-10 w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility" className="text-sm font-medium">
                  Visibility
                </Label>
                <Select
                  value={importForm.visibility}
                  onValueChange={(value: "private" | "public") =>
                    setImportForm({ ...importForm, visibility: value })
                  }
                >
                  <SelectTrigger className="w-full cursor-pointer h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <span className="truncate">Private</span>
                    </SelectItem>
                    <SelectItem value="public">
                      <span className="truncate">Public</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer w-full sm:w-auto order-2 sm:order-1"
                  onClick={() => setIsImportDialogOpen(false)}
                  disabled={importMutation.isPending}
                >
                  <span className="truncate">Cancel</span>
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={importMutation.isPending}
                  className="gap-2 cursor-pointer w-full sm:w-auto order-1 sm:order-2 min-w-[140px]"
                >
                  {importMutation.isPending ? (
                    <>
                      <Upload className="h-4 w-4 animate-spin flex-shrink-0" />
                      <span className="truncate">Importing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Import Image</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredImages.length === 0 ? (
        <Card className="border-dashed overflow-hidden">
          <CardContent className="p-6 sm:p-8 text-center">
            <HardDrive className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4 flex-shrink-0" />
            {searchTerm ? (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
                No images found matching &ldquo;{searchTerm}&rdquo;.
              </p>
            ) : (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                No images found. Import your first image to get started.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {visibleData.map((image) => (
            <Card
              key={image.id}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <GetDistroIcon
                    imageName={typeof image.name === "string" ? image.name : ""}
                  />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg font-semibold text-foreground break-words leading-tight">
                      {image.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono break-all mt-2 bg-muted/20 px-2 py-1 rounded-md leading-relaxed">
                      ID: {image.id}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center px-4 sm:px-0">
        <Button
          onClick={handleShowMore}
          variant="outline"
          disabled={!hasMore}
          className={`transition-all duration-200 px-4 sm:px-6 py-2 w-full sm:w-auto max-w-xs ${
            hasMore
              ? "hover:bg-accent hover:text-accent-foreground hover:scale-105"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <span className="truncate">
            {hasMore
              ? `Show More (${Math.min(6, totalItems - visibleCount)} more)`
              : "All images loaded"}
          </span>
        </Button>
      </div>
    </div>
  );
}
