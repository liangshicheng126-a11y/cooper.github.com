"use client";

import { Children, isValidElement, cloneElement } from "react";
import { cn } from "@/lib/utils";

type StackChildProps = {
  stackIndex?: number;
  className?: string;
};

type HomeScrollStackProps = {
  children: React.ReactNode;
  className?: string;
};

/** Wraps homepage sections for sticky slide-over stacking (no opacity gaps). */
export default function HomeScrollStack({ children, className }: HomeScrollStackProps) {
  let index = 0;

  const stacked = Children.map(children, (child) => {
    if (!isValidElement<StackChildProps>(child)) return child;
    const el = cloneElement(child, { stackIndex: index });
    index += 1;
    return el;
  });

  return (
    <div className={cn("home-scroll-stack", className)}>
      {stacked}
    </div>
  );
}
