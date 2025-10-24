// src/components/RichTextEditor/Toolbar.tsx
import React from "react";
import { type Editor } from "@tiptap/react";
import { Box, ToggleButton, ToggleButtonGroup, Divider } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined"; // Thêm
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough"; // Thêm
import FormatQuoteIcon from "@mui/icons-material/FormatQuote"; // Thêm
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TitleIcon from "@mui/icons-material/Title"; // Thêm

interface ToolbarProps {
  editor: Editor | null;
}

export const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) return null;

  return (
    <Box
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        p: 1,
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      <ToggleButtonGroup size="small" aria-label="text formatting">
        <ToggleButton
          value="bold"
          selected={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBoldIcon />
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalicIcon />
        </ToggleButton>
        <ToggleButton
          value="underline"
          selected={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FormatUnderlinedIcon />
        </ToggleButton>
        <ToggleButton
          value="strike"
          selected={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <FormatStrikethroughIcon />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider flexItem orientation="vertical" sx={{ mx: 1 }} />

      <ToggleButtonGroup size="small" aria-label="block formatting">
        <ToggleButton
          value="heading"
          selected={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <TitleIcon />
        </ToggleButton>
        <ToggleButton
          value="blockquote"
          selected={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <FormatQuoteIcon />
        </ToggleButton>
        <ToggleButton
          value="bulletList"
          selected={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulletedIcon />
        </ToggleButton>
        <ToggleButton
          value="orderedList"
          selected={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumberedIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
