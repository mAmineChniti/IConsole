"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useId } from "react";

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
  const titleId = useId();
  const messageId = useId();
  return (
    <div className="px-2 space-y-6 max-w-none sm:px-4 lg:px-6">
      <Card className="overflow-hidden w-full rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
        <CardContent className="p-4 text-center sm:p-6 lg:p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex-shrink-0 p-2 rounded-full sm:p-3 bg-destructive/10">
              <AlertTriangle
                aria-hidden="true"
                focusable="false"
                className="w-6 h-6 sm:w-8 sm:h-8 text-destructive"
              />
            </div>
            <div
              className="space-y-2 w-full"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              aria-labelledby={titleId}
              aria-describedby={messageId}
            >
              <h3
                id={titleId}
                className="font-sans text-lg font-semibold leading-tight break-words sm:text-xl text-destructive"
              >
                {title}
              </h3>
              <p
                id={messageId}
                className="mx-auto max-w-full font-sans text-sm leading-relaxed break-words sm:max-w-md sm:text-base text-muted-foreground"
              >
                {message}
              </p>
            </div>
            {onRetry && (
              <Button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                aria-busy={isRetrying}
                className="mt-4 w-full font-sans tracking-tight rounded-full shadow-md transition-colors cursor-pointer sm:w-auto min-w-[120px]"
                variant="destructive"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="flex-shrink-0 mr-2 w-4 h-4 text-white animate-spin" />
                    <span className="text-white truncate">Retrying...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="flex-shrink-0 mr-2 w-4 h-4 text-white" />
                    <span className="text-white truncate">Retry</span>
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
