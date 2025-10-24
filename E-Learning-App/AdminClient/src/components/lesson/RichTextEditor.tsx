import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { Box } from "@mui/material";
import { Toolbar } from "./Toolbar";

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit, // Gồm bold, italic, strike, heading, quote, list,...
      Underline,
      Link.configure({
        openOnClick: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "white",
      }}
    >
      <Toolbar editor={editor} />
      <Box
        sx={{
          p: 2,
          minHeight: 250,
          "& .ProseMirror": {
            outline: "none",
            fontFamily: "inherit",
            lineHeight: 1.6,
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};
