import type { Metadata } from "next";
import { DangerZoneView } from "@/features/settings";

export const metadata: Metadata = { title: "Danger Zone" };

export default function ProjectSettingsDangerZonePage() {
  return <DangerZoneView />;
}
