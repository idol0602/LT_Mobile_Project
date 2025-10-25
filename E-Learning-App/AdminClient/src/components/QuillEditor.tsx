import React, { useEffect } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css"; // giao diện mặc định

// =================== ĐỊNH NGHĨA KIỂU DỮ LIỆU ===================

interface QuillEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
}) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
    "list",
    "bullet",
    "link",
    "image",
  ];

  const { quill, quillRef } = useQuill({ theme: "snow", modules, formats });

  // Sync nội dung
  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(value || "");
    }
  }, [quill, value]);

  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        onChange(quill.root.innerHTML);
      });
    }
  }, [quill, onChange]);

  return <div ref={quillRef} style={{ height: "320px" }} />;
};
