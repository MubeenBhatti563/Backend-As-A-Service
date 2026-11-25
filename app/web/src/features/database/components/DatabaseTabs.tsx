"use client";

import { projectDatabaseBase } from "../constants";
import type { DatabaseTabValue } from "../types";
import { SectionTabs } from "./SectionTabs";

interface Props {
  projectId: string;
  value: DatabaseTabValue;
  dense?: boolean;
}

export function DatabaseTabs({ projectId, value, dense }: Props) {
  const base = projectDatabaseBase(projectId);

  return (
    <SectionTabs<DatabaseTabValue>
      ariaLabel="Database sections"
      value={value}
      dense={dense}
      tabs={[
        { value: "tables", label: "Tables", href: base },
        { value: "sql-editor", label: "SQL Editor", href: `${base}/sql-editor` },
        { value: "relationships", label: "Relationships", href: `${base}/relationships` },
        { value: "indexes", label: "Indexes", href: `${base}/indexes` },
      ]}
    />
  );
}
