"use client";

import { tableSectionHref } from "../constants";
import type { TableTabValue } from "../types";
import { SectionTabs } from "./SectionTabs";

interface Props {
  projectId: string;
  tableName: string;
  value: TableTabValue;
}

export function TableDetailTabs({ projectId, tableName, value }: Props) {
  const href = (s: Parameters<typeof tableSectionHref>[2]) =>
    tableSectionHref(projectId, tableName, s);

  return (
    <SectionTabs<TableTabValue>
      ariaLabel="Table sections"
      value={value}
      tabs={[
        { value: "data", label: "Data", href: href("") },
        { value: "structure", label: "Structure", href: href("structure") },
        { value: "relationships", label: "Relationships", href: href("relationships") },
        { value: "indexes", label: "Indexes", href: href("indexes") },
      ]}
    />
  );
}
