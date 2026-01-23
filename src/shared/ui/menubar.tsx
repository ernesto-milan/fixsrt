"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

const Menubar = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)} {...props} />
  ),
);
Menubar.displayName = "Menubar";

const MenubarMenu = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col rounded-md", className)} {...props} />,
);
MenubarMenu.displayName = "MenubarMenu";

const MenubarGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1", className)} {...props} />
  ),
);
MenubarGroup.displayName = "MenubarGroup";

const MenubarPortal: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => <div {...props}>{children}</div>;

const MenubarSub = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col", className)} {...props} />,
);
MenubarSub.displayName = "MenubarSub";

const MenubarRadioGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col", className)} {...props} />,
);
MenubarRadioGroup.displayName = "MenubarRadioGroup";

const MenubarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ className, ...props }, ref) => (
    <button ref={ref} type="button" className={cn("px-3 py-1.5 text-sm font-medium", className)} {...props} />
  ),
);
MenubarTrigger.displayName = "MenubarTrigger";

const MenubarSubTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ className, ...props }, ref) => (
    <button ref={ref} type="button" className={cn("flex items-center justify-between px-2 py-1 text-sm", className)} {...props} />
  ),
);
MenubarSubTrigger.displayName = "MenubarSubTrigger";

const MenubarSubContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("rounded-md border bg-popover p-1 text-popover-foreground", className)} {...props} />,
);
MenubarSubContent.displayName = "MenubarSubContent";

const MenubarContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("rounded-md border bg-popover p-1 text-popover-foreground", className)} {...props} />,
);
MenubarContent.displayName = "MenubarContent";

type ItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { inset?: boolean };
const baseItemClass = "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1 text-sm";

const MenubarItem = React.forwardRef<HTMLButtonElement, ItemProps>(
  ({ className, inset, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(baseItemClass, inset && "pl-8", className)}
      {...props}
    />
  ),
);
MenubarItem.displayName = "MenubarItem";

const MenubarCheckboxItem = React.forwardRef<HTMLButtonElement, ItemProps>(
  ({ className, children, ...props }, ref) => (
    <MenubarItem ref={ref} className={cn("pl-8", className)} {...props}>
      <span className="absolute left-2 text-muted-foreground">✔</span>
      {children}
    </MenubarItem>
  ),
);
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

const MenubarRadioItem = React.forwardRef<HTMLButtonElement, ItemProps>(
  ({ className, children, ...props }, ref) => (
    <MenubarItem ref={ref} className={cn("pl-8", className)} {...props}>
      <span className="absolute left-2 text-muted-foreground">◉</span>
      {children}
    </MenubarItem>
  ),
);
MenubarRadioItem.displayName = "MenubarRadioItem";

const MenubarLabel = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span"> & { inset?: boolean }>(
  ({ className, inset, ...props }, ref) => (
    <span ref={ref} className={cn("px-2 py-1 text-sm font-semibold", inset && "pl-8", className)} {...props} />
  ),
);
MenubarLabel.displayName = "MenubarLabel";

const MenubarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} role="separator" {...props} />
  ),
);
MenubarSeparator.displayName = "MenubarSeparator";

const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
);
MenubarShortcut.displayName = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
