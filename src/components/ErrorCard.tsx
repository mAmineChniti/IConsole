"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorCard({
  title = "An error occurred",
  message = "Something went wrong. Please try again.",
  onRetry,
  isRetrying = false,
}: ErrorCardProps) {
  return (
    <div className="space-y-6 px-2 sm:px-4 lg:px-6 max-w-none">
      <Card className="border-destructive bg-destructive/5 backdrop-blur-sm w-full overflow-hidden">
        <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-2 sm:p-3 bg-destructive/10 rounded-full flex-shrink-0">
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
            </div>
            <div className="space-y-2 w-full">
              <h3 className="text-lg sm:text-xl font-semibold text-destructive leading-tight break-words">
                {title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-full sm:max-w-md mx-auto leading-relaxed break-words">
                {message}
              </p>
            </div>
            {onRetry && (
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                className="mt-4 cursor-pointer w-full sm:w-auto min-w-[120px]"
                variant="outline"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                    <span className="truncate">Retrying...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Retry</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
