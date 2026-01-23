"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";

const PopoverContext = React.createContext({
  open: false,
  setOpen: (_open: boolean) => {},
});

const Popover: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className={className} {...props}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ className, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(PopoverContext);

    return (
      <button
        ref={ref}
        type="button"
        className={cn("inline-flex items-center", className)}
        onClick={(event) => {
          onClick?.(event);
          setOpen(true);
        }}
        {...props}
      />
    );
  },
);
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open } = React.useContext(PopoverContext);

    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn("rounded-md border bg-popover p-4 shadow-md", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
