"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

export type CalendarProps = React.HTMLAttributes<HTMLDivElement> & {
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
};

function Calendar({ className, children, ...props }: CalendarProps) {
  return (
    <div className={cn("p-3 text-sm text-muted-foreground", className)} {...props}>
      {children ?? (
        <div className={cn(buttonVariants({ variant: "outline" }), "w-full text-center")}>
          Calendar placeholder
        </div>
      )}
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
