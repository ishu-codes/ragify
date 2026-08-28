import type { ComponentProps, ElementType } from "react";
import { cn } from "@/lib/utils";

type DashedPanelProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
} & Omit<ComponentProps<T>, "as" | "className" | "children">;

export function DashedPanel<T extends ElementType = "div">({
  as,
  className,
  children,
  ...props
}: DashedPanelProps<T>) {
  const Comp = (as ?? "div") as ElementType;
  return (
    <Comp
      className={cn(
        "relative",
        "before:pointer-events-none before:absolute before:inset-0 before:content-['']",
        "before:[background-image:repeating-linear-gradient(to_bottom,var(--border)_0_5px,transparent_5px_7px),repeating-linear-gradient(to_right,var(--border)_0_5px,transparent_5px_7px),repeating-linear-gradient(to_bottom,var(--border)_0_5px,transparent_5px_7px),repeating-linear-gradient(to_right,var(--border)_0_5px,transparent_5px_7px)]",
        "before:[background-position:0_0,0_0,100%_0,0_100%]",
        "before:[background-repeat:repeat-y,repeat-x,repeat-y,repeat-x]",
        "before:[background-size:1px_7px,7px_1px,1px_7px,7px_1px]",
        "before:[background-origin:border-box] before:[background-clip:border-box]",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
