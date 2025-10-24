// src/components/StatCards.tsx
import React from "react";
import { Box } from "@mui/material";
import { BookOpen, Zap, FileText, MessageSquare, Package } from "lucide-react";
import { StatCard } from "./StatCard";

// Định nghĩa kiểu dữ liệu cho props
interface Stats {
  totalWords: number;
  countByPos: {
    name: string;
    count: number;
  }[];
}

interface StatCardsProps {
  stats: Stats;
}

// Cấu hình icon và màu sắc
const partOfSpeechConfig: Record<string, { icon: any; color: string }> = {
  noun: { icon: BookOpen, color: "#0891b2" },
  verb: { icon: Zap, color: "#10b981" },
  adjective: { icon: FileText, color: "#f59e0b" },
  adverb: { icon: MessageSquare, color: "#8b5cf6" },
  default: { icon: Package, color: "#71717a" },
};

export function StatCards({ stats }: StatCardsProps) {
  console.log("Rendering StatCards with stats:", stats); // Debug line
  return (
    // 1. SỬ DỤNG BOX VỚI CSS GRID THAY VÌ MUI GRID
    <Box
      sx={{
        display: "grid", // Kích hoạt layout lưới
        gap: 3, // Khoảng cách giữa các thẻ
        mb: 4, // Margin bottom
        // Cấu hình responsive cho các cột
        gridTemplateColumns: {
          xs: "1fr", // 1 cột trên màn hình điện thoại
          sm: "repeat(2, 1fr)", // 2 cột trên màn hình máy tính bảng
          lg: "repeat(5, 1fr)", // 4 cột trên màn hình lớn
        },
      }}
    >
      {/* Thẻ Total Words */}
      <StatCard
        icon={BookOpen}
        label="Total Words"
        value={stats.totalWords}
        color="#18181b"
      />

      {/* Tự động tạo các thẻ cho 3 loại từ phổ biến nhất */}
      {stats.countByPos.slice(0, 4).map((posStat) => {
        const configKey =
          posStat.name.toLowerCase() as keyof typeof partOfSpeechConfig;
        const config =
          partOfSpeechConfig[configKey] || partOfSpeechConfig.default;

        // 2. Không cần <Grid item> nữa, component con sẽ tự động điền vào lưới
        return (
          <StatCard
            key={posStat.name}
            icon={config.icon}
            label={posStat.name}
            value={posStat.count}
            color={config.color}
          />
        );
      })}
    </Box>
  );
}
