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
    <div className="max-w-none space-y-6 px-2 sm:px-4 lg:px-6">
      <Card className="bg-card text-card-foreground border-border/50 w-full overflow-hidden rounded-xl border shadow-lg">
        <CardContent className="p-4 text-center sm:p-6 lg:p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-destructive/10 flex-shrink-0 rounded-full p-2 sm:p-3">
              <AlertTriangle
                aria-hidden="true"
                focusable="false"
                className="text-destructive h-6 w-6 sm:h-8 sm:w-8"
              />
            </div>
            <div
              className="w-full space-y-2"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              aria-labelledby={titleId}
              aria-describedby={messageId}
            >
              <h3
                id={titleId}
                className="text-destructive font-sans text-lg leading-tight font-semibold break-words sm:text-xl"
              >
                {title}
              </h3>
              <p
                id={messageId}
                className="text-muted-foreground mx-auto max-w-full font-sans text-sm leading-relaxed break-words sm:max-w-md sm:text-base"
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
                className="mt-4 w-full min-w-[120px] cursor-pointer rounded-full font-sans tracking-tight shadow-md transition-colors sm:w-auto"
                variant="destructive"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 flex-shrink-0 animate-spin text-white" />
                    <span className="truncate text-white">Retrying...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 flex-shrink-0 text-white" />
                    <span className="truncate text-white">Retry</span>
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
