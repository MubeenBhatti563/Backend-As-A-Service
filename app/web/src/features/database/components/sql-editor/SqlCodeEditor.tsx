"use client";

import { useEffect, useRef } from "react";
import Editor, { useMonaco, type OnMount } from "@monaco-editor/react";
import { Box, Stack, Typography } from "@mui/material";

interface TableInfo {
  name: string;
  columns?: Array<{ name: string; type?: string }>;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  schema: string;
  onRun?: () => void;
  tables?: TableInfo[];
}

const SQL_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "JOIN",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "ON",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "AND",
  "OR",
  "NOT",
  "IN",
  "EXISTS",
  "BETWEEN",
  "LIKE",
  "ILIKE",
  "IS NULL",
  "IS NOT NULL",
  "AS",
  "DISTINCT",
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "CREATE TABLE",
  "ALTER TABLE",
  "DROP TABLE",
  "ADD COLUMN",
  "DROP COLUMN",
  "ENABLE ROW LEVEL SECURITY",
  "DISABLE ROW LEVEL SECURITY",
  "CREATE POLICY",
  "DROP POLICY",
];

export function SqlCodeEditor({
  value,
  onChange,
  schema,
  onRun,
  tables = [],
}: Props) {
  const onRunRef = useRef(onRun);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  const tablesRef = useRef(tables);
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  const handleEditorMount: OnMount = (editor, monaco) => {
    // 1. Define custom dark theme matching the BaaS UI palette
    monaco.editor.defineTheme("baas-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "60A5FA", fontStyle: "bold" },
        { token: "string", foreground: "34D399" },
        { token: "number", foreground: "FBBF24" },
        { token: "comment", foreground: "6B7280", fontStyle: "italic" },
        { token: "delimiter", foreground: "9CA3AF" },
        { token: "identifier", foreground: "F3F4F6" },
      ],
      colors: {
        "editor.background": "#090D16",
        "editor.foreground": "#F3F4F6",
        "editorLineNumber.foreground": "#4B5563",
        "editorLineNumber.activeForeground": "#9CA3AF",
        "editor.selectionBackground": "#1E293B",
        "editor.lineHighlightBackground": "#0F172A40",
        "editorCursor.foreground": "#60A5FA",
        "editorWidget.background": "#0E131F",
        "editorWidget.border": "#1E293B",
      },
    });
    monaco.editor.setTheme("baas-dark");

    // 2. Register keyboard shortcut: Cmd+Enter (Mac) / Ctrl+Enter (Win/Linux) to run query
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunRef.current?.();
    });

    // 3. Register auto-completion provider for PostgreSQL
    const disposable = monaco.languages.registerCompletionItemProvider("pgsql", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const currentTables = tablesRef.current;
        const suggestions: any[] = [];

        // Table name suggestions
        currentTables.forEach((t) => {
          suggestions.push({
            label: t.name,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: t.name,
            detail: `Table (${schema})`,
            range,
          });

          // Column name suggestions
          t.columns?.forEach((c) => {
            suggestions.push({
              label: `${t.name}.${c.name}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: c.name,
              detail: `${t.name} column (${c.type ?? "any"})`,
              range,
            });
          });
        });

        // Keyword suggestions
        SQL_KEYWORDS.forEach((kw) => {
          suggestions.push({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            range,
          });
        });

        return { suggestions };
      },
    });

    return () => {
      disposable.dispose();
    };
  };

  return (
    <Stack
      spacing={2}
      useFlexGap
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: "#090D16",
        border: "1px solid",
        borderColor: "border.default",
        borderRadius: "12px",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Typography
            component="div"
            variant="code"
            sx={{
              fontSize: 11,
              lineHeight: "14px",
              color: "text.disabled",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            SQL Workspace
          </Typography>
          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: "4px",
              bgcolor: "background.elevated",
              color: "text.secondary",
              typography: "code",
              fontSize: 10,
            }}
          >
            ⌘ / Ctrl + ↵ to run
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center" }}>
          <Box
            aria-hidden
            sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }}
          />
          <Typography
            component="div"
            variant="code"
            sx={{ fontSize: 11, lineHeight: "14px", color: "text.secondary" }}
          >
            {schema} schema
          </Typography>
        </Stack>
      </Stack>

      <Box
        sx={{
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "border.default",
        }}
      >
        <Editor
          height="280px"
          defaultLanguage="pgsql"
          value={value}
          onChange={(val) => onChange(val ?? "")}
          onMount={handleEditorMount}
          loading={
            <Box
              sx={{
                height: 280,
                display: "grid",
                placeItems: "center",
                color: "text.disabled",
                typography: "code",
                fontSize: 13,
                bgcolor: "#090D16",
              }}
            >
              Loading SQL Editor…
            </Box>
          }
          options={{
            fontSize: 13,
            fontFamily: "var(--font-mono, monospace)",
            minimap: { enabled: false },
            lineNumbers: "on",
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            cursorBlinking: "smooth",
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: "all",
          }}
        />
      </Box>
    </Stack>
  );
}
