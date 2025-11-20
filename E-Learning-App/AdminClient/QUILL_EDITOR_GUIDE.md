# 📝 Hướng Dẫn Sử Dụng Quill Editor Chuyên Nghiệp

## ✨ Tính Năng Mới

Quill editor đã được nâng cấp với các tính năng định dạng chuyên nghiệp:

### 🎨 Định Dạng Văn Bản

- **Bold** (Ctrl/Cmd + B): Chữ đậm
- **Italic** (Ctrl/Cmd + I): Chữ nghiêng
- **Underline** (Ctrl/Cmd + U): Gạch chân
- **Strikethrough**: Gạch ngang

### 🌈 Màu Sắc

- **Text Color**: Chọn màu cho chữ (palette đầy đủ)
- **Background Color**: Chọn màu nền cho text (highlight)

### 📐 Typography

- **Headers**: H1, H2, H3, H4, H5, H6
  - H1: Tiêu đề lớn nhất
  - H2-H6: Tiêu đề phụ giảm dần
- **Font Family**: Sans Serif (mặc định), Serif, Monospace
- **Font Size**: Small, Normal, Large, Huge

### 📋 Danh Sách & Căn Chỉnh

- **Ordered List**: Danh sách đánh số (1, 2, 3...)
- **Unordered List**: Danh sách bullet points (•)
- **Indent**: Tăng/giảm lề (→ ←)
- **Text Alignment**: Left, Center, Right, Justify

### 🔤 Script & Định Dạng Đặc Biệt

- **Superscript**: Chỉ số trên (x²)
- **Subscript**: Chỉ số dưới (H₂O)
- **Blockquote**: Trích dẫn (với viền màu xanh)
- **Code Block**: Khối code (nền xám)

### 🔗 Media & Links

- **Link**: Chèn liên kết URL
- **Image**: Chèn hình ảnh
- **Video**: Chèn video (YouTube, Vimeo, etc.)

### 🧹 Công Cụ Khác

- **Clean**: Xóa tất cả định dạng, chỉ giữ text thuần

## 🎯 Sử Dụng Trong Các Module

### Grammar Lessons

File: `Step2_Grammar.tsx`

- Editor hiển thị với placeholder: "Enter grammar lesson content..."
- Tự động lưu HTML content vào field `readingContent`
- Console log để debug: `✏️ Grammar content changed:`

### Reading Lessons

File: `Step2_Reading.tsx` và `EditReadingModal.tsx`

- Editor hiển thị với placeholder: "Nhập nội dung bài đọc..."
- Hỗ trợ chèn hình ảnh và video cho bài đọc

## 🎨 Customization

### CSS Tùy Chỉnh

File: `src/styles/quill-custom.css`

Các tùy chỉnh đã áp dụng:

- **Toolbar**: Gradient background, rounded corners, shadow
- **Buttons**: Hover effect với màu primary (#088395)
- **Dropdowns**: Modern styling với shadow
- **Editor**: Min-height 250px, padding, font sizing
- **Content**: Styled blockquotes, code blocks, images
- **Focus State**: Border color và shadow khi focus
- **Scrollbar**: Custom scrollbar styling
- **Responsive**: Điều chỉnh cho mobile

### Màu Chủ Đạo

- Primary: `#088395` (Teal)
- Hover: `rgba(8, 131, 149, 0.1)`
- Active: `rgba(8, 131, 149, 0.15)`

## 💾 Lưu Trữ Dữ Liệu

Content được lưu dưới dạng HTML trong field `readingContent`:

```javascript
{
  name: "Grammar Lesson 1",
  level: "Beginner",
  topic: "Present Simple",
  type: "grammar",
  readingContent: "<h2>Present Simple Tense</h2><p>The <strong>present simple</strong> is used for...</p>",
  questions: [...]
}
```

## 🔧 Cấu Hình Toolbar

Toolbar được cấu hình trong `modules.toolbar`:

```javascript
modules: {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    ["clean"],
  ],
}
```

## 🐛 Debug

Các console logs để debug:

- `✏️ Grammar content changed:` - Khi content thay đổi
- `📤 Sending grammar lesson data:` - Khi save
- `📝 Grammar content:` - HTML content đang được gửi

## 📱 Responsive

Editor tự động điều chỉnh trên các màn hình:

- Desktop: Full toolbar, min-height 250px
- Mobile: Compact toolbar, min-height 200px, reduced padding

## 🚀 Performance

- Quill instance được tạo 1 lần duy nhất (useRef)
- Event listeners được cleanup khi unmount
- Content chỉ update khi cần thiết (tránh re-render)

## 🎓 Tips & Best Practices

1. **Sử dụng Headers đúng cách**:

   - H1 cho tiêu đề chính
   - H2-H3 cho các phần
   - H4-H6 cho tiêu đề phụ nhỏ

2. **Màu sắc**:

   - Dùng màu để highlight điểm quan trọng
   - Không lạm dụng quá nhiều màu

3. **Code Block**:

   - Dùng cho code examples
   - Dùng cho formulas phức tạp

4. **Images**:

   - Upload ảnh có kích thước hợp lý
   - Ảnh tự động scale về max-width: 100%

5. **Lists**:
   - Ordered list cho các bước tuần tự
   - Unordered list cho các điểm không theo thứ tự

## 🔄 Updates Log

**Version 2.0** (Current)

- ✅ Thêm màu sắc text và background
- ✅ Thêm font family và font size
- ✅ Thêm 6 levels headers (H1-H6)
- ✅ Thêm superscript/subscript
- ✅ Thêm indent controls
- ✅ Thêm blockquote và code block
- ✅ Thêm video support
- ✅ Custom CSS với theme màu primary
- ✅ Responsive design
- ✅ Improved UX với hover effects

**Version 1.0** (Old)

- Basic toolbar: H1-H3, Bold, Italic, Lists, Link

## 📞 Support

Nếu có vấn đề hoặc cần thêm tính năng, vui lòng liên hệ team development.
