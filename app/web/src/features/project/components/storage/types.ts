export type BucketAccess = "Public" | "Private";

export interface Bucket {
  id: string;
  name: string;
  access: BucketAccess;
  fileCount: number;
  sizeBytes: string;
  createdAt: string;
}

export interface StorageSettings {
  cdnBaseUrl: string | null;
  cacheTtlSeconds: number;
}

export interface StorageStat {
  id: string;
  label: string;
  value: string;
  indicator?: string;
}
