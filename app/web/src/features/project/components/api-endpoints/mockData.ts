import type { EndpointGroup } from "./types";

const userResponse = {
  id: "sample-user-id",
  email: "user@example.com",
  status: "active",
};

function endpoint(
  id: string,
  method: EndpointGroup["endpoints"][number]["method"],
  path: string,
  summary: string,
  access: EndpointGroup["endpoints"][number]["access"],
): EndpointGroup["endpoints"][number] {
  const url = `https://api.example.test${path.replaceAll(":id", "sample-id")}`;
  const responseExample =
    method === "DELETE"
      ? JSON.stringify({ success: true })
      : JSON.stringify(userResponse, null, 2);

  return {
    id,
    method,
    path,
    summary,
    access,
    description: `${summary}. This is a sample endpoint preview; it is not connected to a live project API.`,
    snippets: {
      typescript: [
        "const response = await fetch(",
        `  "${url}",`,
        `  { headers: { Authorization: "Bearer <project-key>" } },`,
        ");",
        "const data = await response.json();",
      ].join("\n"),
      javascript: [
        `fetch("${url}", {`,
        `  headers: { Authorization: "Bearer <project-key>" },`,
        "})",
        "  .then((response) => response.json())",
        "  .then((data) => console.log(data));",
      ].join("\n"),
      curl: [
        `curl -X ${method} \\`,
        `  "${url}" \\`,
        `  -H "Authorization: Bearer <project-key>"`,
      ].join("\n"),
    },
    responseExample,
  };
}

export const SAMPLE_ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    id: "users",
    title: "Users resource · sample",
    endpoints: [
      endpoint("users-list", "GET", "/api/v1/users", "List users", "authenticated"),
      endpoint("users-create", "POST", "/api/v1/users", "Create a user", "authenticated"),
      endpoint("users-get", "GET", "/api/v1/users/:id", "Get a user by ID", "authenticated"),
      endpoint("users-update", "PATCH", "/api/v1/users/:id", "Update a user", "authenticated"),
      endpoint("users-delete", "DELETE", "/api/v1/users/:id", "Delete a user", "authenticated"),
    ],
  },
  {
    id: "posts",
    title: "Posts resource · sample",
    endpoints: [
      endpoint("posts-list", "GET", "/api/v1/posts", "List public posts", "public"),
      endpoint("posts-create", "POST", "/api/v1/posts", "Create a post", "authenticated"),
      endpoint("posts-get", "GET", "/api/v1/posts/:id", "Get a post by ID", "public"),
    ],
  },
];
