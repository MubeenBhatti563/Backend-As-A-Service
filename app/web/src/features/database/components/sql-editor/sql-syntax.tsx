import type { ReactNode } from "react";

export const SQL_COLORS = { keyword: "#FF7B72", string: "#A5D6FF", number: "#79C0FF" } as const;
const KEYWORDS = ["SELECT", "DISTINCT", "FROM", "WHERE", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET", "DESC", "ASC", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE", "RETURNING", "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "PRIMARY KEY", "LEFT JOIN", "INNER JOIN", "JOIN", "ON", "AND", "OR", "NOT", "NULL", "AS", "IN", "LIKE", "TRUE", "FALSE"];
const KEYWORD_SOURCE = KEYWORDS.map((keyword) => keyword.replace(/ /g, "\\s+")).join("|");
const TOKEN_RE = new RegExp(`('(?:[^']|'')*'|\\b\\d+(?:\\.\\d+)?\\b|\\b(?:${KEYWORD_SOURCE})\\b)`, "gi");

export function highlightSql(sql: string): ReactNode[] {
  return sql.split(TOKEN_RE).map((part, index) => {
    if (index % 2 === 0) return part;
    const color = part.startsWith("'") ? SQL_COLORS.string : /^\d/.test(part) ? SQL_COLORS.number : SQL_COLORS.keyword;
    return <span key={index} style={{ color }}>{part}</span>;
  });
}
