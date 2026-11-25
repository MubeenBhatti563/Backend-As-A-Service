import type { RelationshipsData } from "./er-types";

export async function getRelationshipsData(projectId: string): Promise<RelationshipsData> {
  void projectId;

  return {
    tables: [
      {
        id: "users",
        name: "users",
        x: 40,
        y: 60,
        columns: [
          { name: "id", type: "uuid", key: "pk" },
          { name: "name", type: "varchar" },
          { name: "email", type: "varchar" },
          { name: "role", type: "varchar" },
        ],
      },
      {
        id: "posts",
        name: "posts",
        x: 540,
        y: 60,
        columns: [
          { name: "id", type: "uuid", key: "pk" },
          { name: "user_id", type: "uuid", key: "fk" },
          { name: "title", type: "varchar" },
          { name: "body", type: "text" },
        ],
      },
      {
        id: "comments",
        name: "comments",
        x: 840,
        y: 60,
        columns: [
          { name: "id", type: "uuid", key: "pk" },
          { name: "post_id", type: "uuid", key: "fk" },
          { name: "user_id", type: "uuid", key: "fk" },
          { name: "body", type: "text" },
        ],
      },
      {
        id: "profiles",
        name: "profiles",
        x: 420,
        y: 280,
        columns: [
          { name: "id", type: "uuid", key: "pk" },
          { name: "user_id", type: "uuid", key: "fk" },
          { name: "avatar_url", type: "varchar" },
          { name: "bio", type: "text" },
        ],
      },
      {
        id: "categories",
        name: "categories",
        x: 840,
        y: 320,
        columns: [
          { name: "id", type: "uuid", key: "pk" },
          { name: "name", type: "varchar" },
        ],
      },
    ],
    relations: [
      {
        id: "users-posts",
        from: { table: "users", column: "id" },
        to: { table: "posts", column: "user_id" },
        cardinality: "1:N",
        tone: "secondary",
      },
      {
        id: "posts-comments",
        from: { table: "posts", column: "id" },
        to: { table: "comments", column: "post_id" },
        cardinality: "1:N",
        tone: "warning",
      },
      {
        id: "users-profiles",
        from: { table: "users", column: "id" },
        to: { table: "profiles", column: "user_id" },
        cardinality: "1:1",
        tone: "info",
        dashed: true,
      },
      {
        id: "users-comments",
        from: { table: "users", column: "id" },
        to: { table: "comments", column: "user_id" },
        cardinality: "1:N",
        tone: "secondary",
        dashed: true,
      },
    ],
  };
}
