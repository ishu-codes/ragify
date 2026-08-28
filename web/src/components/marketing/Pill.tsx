import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

type PillBaseProps = {
  children: ReactNode;
  className?: string;
  asLink?: false;
};

type PillLinkProps = {
  children: ReactNode;
  className?: string;
  asLink: true;
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
};

type PillProps = PillBaseProps & Omit<ButtonProps, "asChild"> | PillLinkProps;

export function Pill(props: PillProps) {
  const { children, className } = props;

  if ("asLink" in props && props.asLink) {
    const { to, href, target, rel } = props;
    const cls = cn(
      "inline-flex items-center justify-center gap-2 rounded-[100px] bg-brand text-brand-foreground shadow hover:bg-brand/85 duration-300 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base",
      className,
    );
    if (to) {
      return (
        <Link to={to} className={cls} target={target} rel={rel}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={cls} target={target} rel={rel}>
        {children}
      </a>
    );
  }

  const { variant = "pill", size = "pill", ...rest } = props as PillBaseProps &
    Omit<ButtonProps, "asChild">;
  return (
    <Button variant={variant} size={size} className={className} {...rest}>
      {children}
    </Button>
  );
}

export function OutlinePill(props: PillProps) {
  const { children, className } = props;

  if ("asLink" in props && props.asLink) {
    const { to, href, target, rel } = props;
    const cls = cn(
      "inline-flex items-center justify-center gap-2 rounded-[100px] border border-input bg-transparent text-foreground shadow hover:bg-muted/80 duration-300 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base",
      className,
    );
    if (to) {
      return (
        <Link to={to} className={cls} target={target} rel={rel}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={cls} target={target} rel={rel}>
        {children}
      </a>
    );
  }

  const { variant = "outlinePill", size = "pill", ...rest } = props as PillBaseProps &
    Omit<ButtonProps, "asChild">;
  return (
    <Button variant={variant} size={size} className={className} {...rest}>
      {children}
    </Button>
  );
}
