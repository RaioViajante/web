import type { ReactNode } from "react";

type PageContainerProps = {
  as: "header" | "main" | "footer";
  className?: string;
  children: ReactNode;
};

export function PageContainer({
  as: Element,
  className = "",
  children,
}: PageContainerProps) {
  return (
    <Element className={`page-container ${className}`}>{children}</Element>
  );
}
