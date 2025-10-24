// src/components/RichTextEditor/Toolbar.tsx
import React from "react";
import { type Editor } from "@tiptap/react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Tooltip,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TitleIcon from "@mui/icons-material/Title";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import LinkIcon from "@mui/icons-material/Link";

interface ToolbarProps {
  editor: Editor | null;
}

export const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) return null;

  const setLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  return (
    <Box
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        p: 1,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
      }}
    >
      {/* --- Inline formatting --- */}
      <ToggleButtonGroup size="small" aria-label="text formatting">
        <ToggleButton
          value="bold"
          selected={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Tooltip title="Bold">
            <FormatBoldIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Tooltip title="Italic">
            <FormatItalicIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="underline"
          selected={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Tooltip title="Underline">
            <FormatUnderlinedIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="strike"
          selected={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Tooltip title="Strikethrough">
            <FormatStrikethroughIcon />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider flexItem orientation="vertical" sx={{ mx: 1 }} />

      {/* --- Block elements --- */}
      <ToggleButtonGroup size="small" aria-label="block formatting">
        <ToggleButton
          value="heading"
          selected={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Tooltip title="Heading">
            <TitleIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="blockquote"
          selected={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Tooltip title="Quote">
            <FormatQuoteIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="bulletList"
          selected={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <Tooltip title="Bullet list">
            <FormatListBulletedIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="orderedList"
          selected={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <Tooltip title="Numbered list">
            <FormatListNumberedIcon />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider flexItem orientation="vertical" sx={{ mx: 1 }} />

      {/* --- Alignment --- */}
      <ToggleButtonGroup size="small" aria-label="text alignment">
        <ToggleButton
          value="left"
          selected={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <Tooltip title="Align left">
            <FormatAlignLeftIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="center"
          selected={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <Tooltip title="Center">
            <FormatAlignCenterIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="right"
          selected={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <Tooltip title="Align right">
            <FormatAlignRightIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="justify"
          selected={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <Tooltip title="Justify">
            <FormatAlignJustifyIcon />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider flexItem orientation="vertical" sx={{ mx: 1 }} />

      {/* --- Link --- */}
      <ToggleButton value="link" onClick={setLink}>
        <Tooltip title="Insert link">
          <LinkIcon />
        </Tooltip>
      </ToggleButton>
    </Box>
  );
};
