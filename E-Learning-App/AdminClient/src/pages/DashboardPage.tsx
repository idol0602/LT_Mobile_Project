import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  MenuBook as MenuBookIcon,
  Book as VocabularyIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Analytics as AnalyticsIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import axios from "axios";

const API_BASE_URL = "http://localhost:5050/api";

interface DashboardStats {
  totalVocabularies: number;
  totalLessons: number;
  totalUsers: number;
  totalAchievements: number;
  lessonsByType: {
    vocab: number;
    listen: number;
    grammar: number;
    reading: number;
  };
  lessonsByLevel: {
    Beginner: number;
    Intermediate: number;
    Advanced: number;
  };
  recentActivity: any[];
}

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch vocabularies stats
      const vocabRes = await axios.get(`${API_BASE_URL}/vocabularies/stats`);
      const totalVocabularies = vocabRes.data.total || 0;

      // Fetch lessons
      const lessonsRes = await axios.get(`${API_BASE_URL}/lessons`, {
        params: { page: 1, limit: 1000 },
      });
      const lessons = lessonsRes.data.data || [];
      const totalLessons = lessonsRes.data.total || lessons.length;

      // Count by type and level
      const lessonsByType = {
        vocab: lessons.filter((l: any) => l.type === "vocab").length,
        listen: lessons.filter((l: any) => l.type === "listen").length,
        grammar: lessons.filter((l: any) => l.type === "grammar").length,
        reading: lessons.filter((l: any) => l.type === "reading").length,
      };

      const lessonsByLevel = {
        Beginner: lessons.filter((l: any) => l.level === "Beginner").length,
        Intermediate: lessons.filter((l: any) => l.level === "Intermediate")
          .length,
        Advanced: lessons.filter((l: any) => l.level === "Advanced").length,
      };

      // Fetch achievements
      const achievementsRes = await axios.get(`${API_BASE_URL}/achievements`);
      const totalAchievements = achievementsRes.data.data?.length || 0;

      // Fetch users (assuming you have this endpoint)
      let totalUsers = 0;
      try {
        const usersRes = await axios.get(`${API_BASE_URL}/users`);
        totalUsers = usersRes.data.total || usersRes.data.data?.length || 0;
      } catch (err) {
        console.log("Users endpoint not available");
      }

      // Recent activity - get latest lessons
      const recentActivity = lessons
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      setStats({
        totalVocabularies,
        totalLessons,
        totalUsers,
        totalAchievements,
        lessonsByType,
        lessonsByLevel,
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box p={4}>
        <Typography>Không thể tải dữ liệu Dashboard</Typography>
      </Box>
    );
  }

  const statCards = [
    {
      label: "Tổng số từ vựng",
      value: stats.totalVocabularies,
      icon: <VocabularyIcon sx={{ fontSize: 40 }} />,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      trend: "+12%",
    },
    {
      label: "Bài học",
      value: stats.totalLessons,
      icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
      color: "#10B981",
      bgColor: "#ECFDF5",
      trend: "+8%",
    },
    {
      label: "Người dùng",
      value: stats.totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
      trend: "+23%",
    },
    {
      label: "Thành tựu",
      value: stats.totalAchievements,
      icon: <TrophyIcon sx={{ fontSize: 40 }} />,
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
      trend: "+5%",
    },
  ];

  const typeLabels: { [key: string]: string } = {
    vocab: "Từ vựng",
    listen: "Nghe",
    grammar: "Ngữ pháp",
    reading: "Đọc",
  };

  const typeColors: { [key: string]: string } = {
    vocab: "#3B82F6",
    listen: "#10B981",
    grammar: "#F59E0B",
    reading: "#8B5CF6",
  };

  const levelColors: { [key: string]: string } = {
    Beginner: "#10B981",
    Intermediate: "#F59E0B",
    Advanced: "#EF4444",
  };

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
          color: "white",
          boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <SchoolIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Dashboard Quản Trị
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Tổng quan hệ thống học tiếng Anh
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((item, index) => (
          <Grid sx={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "1px solid #E5E7EB",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: item.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={item.trend}
                    size="small"
                    sx={{
                      bgcolor: "#ECFDF5",
                      color: "#10B981",
                      fontWeight: 600,
                    }}
                  />
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}
                  mb={1}
                >
                  {item.label}
                </Typography>
                <Typography variant="h4" fontWeight="bold" color={item.color}>
                  {item.value.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Lessons by Type */}
        <Grid sx={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <AnalyticsIcon sx={{ color: "#667EEA", fontSize: 28 }} />
                <Typography variant="h6" fontWeight="bold">
                  Bài học theo loại
                </Typography>
              </Stack>

              <Stack spacing={2.5}>
                {Object.entries(stats.lessonsByType).map(([type, count]) => {
                  const total = stats.totalLessons || 1;
                  const percentage = ((count / total) * 100).toFixed(1);
                  return (
                    <Box key={type}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mb={1}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          {typeLabels[type]}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count} ({percentage}%)
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Number(percentage)}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: `${typeColors[type]}20`,
                          "& .MuiLinearProgress-bar": {
                            bgcolor: typeColors[type],
                            borderRadius: 5,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Lessons by Level */}
        <Grid sx={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <TimerIcon sx={{ color: "#F59E0B", fontSize: 28 }} />
                <Typography variant="h6" fontWeight="bold">
                  Bài học theo cấp độ
                </Typography>
              </Stack>

              <Stack spacing={2.5}>
                {Object.entries(stats.lessonsByLevel).map(([level, count]) => {
                  const total = stats.totalLessons || 1;
                  const percentage = ((count / total) * 100).toFixed(1);
                  return (
                    <Box key={level}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mb={1}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          {level}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count} ({percentage}%)
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Number(percentage)}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: `${levelColors[level]}20`,
                          "& .MuiLinearProgress-bar": {
                            bgcolor: levelColors[level],
                            borderRadius: 5,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid sx={{ xs: 12 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                🔥 Bài học mới nhất
              </Typography>

              <Stack spacing={2}>
                {stats.recentActivity.map((lesson: any, index: number) => (
                  <Paper
                    key={lesson._id || index}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid #E5E7EB",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "#F9FAFB",
                        borderColor: "#667EEA",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{
                            bgcolor: typeColors[lesson.type] || "#3B82F6",
                            width: 48,
                            height: 48,
                          }}
                        >
                          {lesson.type === "vocab" && <VocabularyIcon />}
                          {lesson.type === "listen" && <MenuBookIcon />}
                          {lesson.type === "grammar" && <SchoolIcon />}
                          {lesson.type === "reading" && <MenuBookIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {lesson.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {lesson.topic} • {typeLabels[lesson.type]}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={lesson.level}
                          size="small"
                          sx={{
                            bgcolor: `${levelColors[lesson.level]}15`,
                            color: levelColors[lesson.level],
                            fontWeight: 600,
                            border: `1px solid ${levelColors[lesson.level]}40`,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {lesson.createdAt
                            ? new Date(lesson.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;
