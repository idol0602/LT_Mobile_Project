import { GlobalStyles } from "@mui/material";

export const GlobalStyle = () => (
  <GlobalStyles
    styles={{
      body: {
        // --- THAY ĐỔI TẠI ĐÂY ---
        backgroundColor: "#F4F5F7", // Màu nền xám lạnh, hiện đại
        color: "#1E293B",
        margin: 0,
        fontFamily: "'Inter', sans-serif",
      },
      "*::-webkit-scrollbar": {
        width: "8px",
      },
      "*::-webkit-scrollbar-thumb": {
        backgroundColor: "#CBD5E1", // Màu thanh cuộn nhạt hơn
        borderRadius: "10px",
      },
      a: {
        textDecoration: "none",
        color: "inherit",
      },
    }}
  />
);
