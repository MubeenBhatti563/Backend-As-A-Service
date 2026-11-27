export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type EndpointAccess = "authenticated" | "public";
export type CodeLanguage = "typescript" | "javascript" | "curl";

export interface Endpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  access: EndpointAccess;
  description: string;
  snippets: Record<CodeLanguage, string>;
  responseExample: string;
}

export interface EndpointGroup {
  id: string;
  title: string;
  endpoints: Endpoint[];
}
