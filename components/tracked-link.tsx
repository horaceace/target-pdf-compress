"use client";

import { Link } from "@/i18n/navigation";
import { ComponentProps, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics/events";

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  children: ReactNode;
  eventName?: string;
  eventParams?: Record<string, string | number | boolean | undefined>;
  onClick?: ComponentProps<typeof Link>["onClick"];
};

export function TrackedLink({
  children,
  eventName = "tool_switch_clicked",
  eventParams = {},
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackEvent(eventName, eventParams);
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
