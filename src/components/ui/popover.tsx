"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent(
  {
    align = "start",
    avoidCollisions = true,
    collisionPadding = 16,
    className = "",
    sideOffset = 8,
    ...props
  },
  ref,
) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        data-overlay-layer="popover"
        align={align}
        avoidCollisions={avoidCollisions}
        collisionPadding={collisionPadding}
        sideOffset={sideOffset}
        className={`z-[var(--z-overlay-popover)] rounded-xl border bg-white text-navy-900 shadow-float outline-none data-[state=open]:animate-pop ${className}`}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
