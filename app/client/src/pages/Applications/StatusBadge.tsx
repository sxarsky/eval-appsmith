import React from "react";
import styled from "styled-components";

export type ApplicationLifecycleState =
  | "draft"
  | "published"
  | "unpublished"
  | "archived"
  | string;

export interface StatusBadgeProps {
  status: ApplicationLifecycleState | null | undefined;
  className?: string;
  "data-testid"?: string;
}

interface BadgeVariant {
  label: string;
  color: string;
  background: string;
}

const VARIANTS: Record<string, BadgeVariant> = {
  draft: { label: "Draft", color: "#444", background: "#e6e6e6" },
  published: { label: "Published", color: "#085c40", background: "#d4edda" },
  unpublished: { label: "Unpublished", color: "#856404", background: "#fff3cd" },
  archived: { label: "Archived", color: "#721c24", background: "#f8d7da" },
  unknown: { label: "Unknown", color: "#666", background: "#f0f0f0" },
};

const Pill = styled.span<{ $bg: string; $fg: string }>`
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
  text-transform: capitalize;
`;

function pickVariant(status: ApplicationLifecycleState | null | undefined): BadgeVariant {
  if (!status) return VARIANTS.unknown;

  if (status.startsWith("publish")) {
    return VARIANTS.published;
  }
  if (status === "archived") {
    return VARIANTS.archived;
  }
  if (status === "draft") {
    return VARIANTS.draft;
  }

  return VARIANTS.unknown;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  "data-testid": dataTestId,
}) => {
  const variant = pickVariant(status);
  return (
    <Pill
      className={className}
      data-testid={dataTestId ?? `status-badge-${variant.label.toLowerCase()}`}
      $bg={variant.background}
      $fg={variant.color}
    >
      {variant.label}
    </Pill>
  );
};

export default StatusBadge;
