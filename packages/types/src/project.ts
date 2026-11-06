export interface CreateProjectInput {
  name: string;
  description?: string;
  region: string;
}

export interface ProjectData {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  schemaName: string;
  description: string | null;
  deploymentRegion: string;
  status: "ACTIVE" | "PAUSED" | "PENDING";
  ownerId: string;
}

export interface CreateProjectResponse {
  project: ProjectData;
  keys: {
    anon: string;
    service: string;
  };
}
