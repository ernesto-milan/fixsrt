"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

const ContextMenu = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("relative inline-block text-left", className)} {...props}>
    {children}
  </div>
);

const ContextMenuTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ className, ...props }, ref) => (
    <button ref={ref} type="button" className={cn("inline-flex items-center", className)} {...props} />
  ),
);
ContextMenuTrigger.displayName = "ContextMenuTrigger";

const ContextMenuGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1 px-1 py-1", className)} {...props} />
  ),
);
ContextMenuGroup.displayName = "ContextMenuGroup";

const ContextMenuPortal: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

const ContextMenuSub: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

const ContextMenuRadioGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1", className)} {...props} />
  ),
);
ContextMenuRadioGroup.displayName = "ContextMenuRadioGroup";

const ContextMenuSubTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn("flex w-full items-center justify-between rounded px-2 py-1 text-sm", className)}
      {...props}
    >
      {children}
    </button>
  ),
);
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

const ContextMenuSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-md border bg-popover p-2", className)} {...props} />
  ),
);
ContextMenuSubContent.displayName = "ContextMenuSubContent";

const ContextMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-md border bg-popover p-2 shadow-md", className)} {...props} />
  ),
);
ContextMenuContent.displayName = "ContextMenuContent";

type MenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { inset?: boolean };
const contextMenuItemBaseClass = "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1 text-sm focus:outline-none";

const ContextMenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ className, inset, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        contextMenuItemBaseClass,
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  ),
);
ContextMenuItem.displayName = "ContextMenuItem";

const ContextMenuCheckboxItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ className, children, ...props }, ref) => (
    <ContextMenuItem ref={ref} className={cn("pl-8", className)} {...props}>
      <span className="absolute left-2 w-3.5 text-muted-foreground">{/* placeholder */}</span>
      {children}
    </ContextMenuItem>
  ),
);
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

const ContextMenuRadioItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ className, children, ...props }, ref) => (
    <ContextMenuItem ref={ref} className={cn("pl-8", className)} {...props}>
      <span className="absolute left-2 w-3.5 text-muted-foreground">{/* placeholder */}</span>
      {children}
    </ContextMenuItem>
  ),
);
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

const ContextMenuLabel = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span"> & { inset?: boolean }>(
  ({ className, inset, ...props }, ref) => (
    <span ref={ref} className={cn("px-2 py-1 text-sm font-semibold text-foreground", inset && "pl-8", className)} {...props} />
  ),
);
ContextMenuLabel.displayName = "ContextMenuLabel";

const ContextMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("my-1 h-px bg-border", className)} role="separator" {...props} />
  ),
);
ContextMenuSeparator.displayName = "ContextMenuSeparator";

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
);
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
