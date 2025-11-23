import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Tabs,
  Tab,
  Typography,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

interface User {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: "user" | "admin";
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

interface Achievement {
  _id: string;
  name: string;
  description: string;
  difficulty: string;
  rewards: number;
  unlockedAt: string;
}

interface CompletedLesson {
  _id: string;
  lessonId: {
    _id: string;
    name: string;
    category: string;
  };
  category: string;
  score: number;
  completionTime: number;
  completedAt: string;
}

interface UserProgress {
  totalAppTime: number;
  reading: {
    currentLesson: number;
    totalLessons: number;
    completedLessons: number;
    completedPercent: number;
  };
  listening: {
    currentLesson: number;
    totalLessons: number;
    completedLessons: number;
    completedPercent: number;
  };
  grammar: {
    currentLesson: number;
    totalLessons: number;
    completedLessons: number;
    completedPercent: number;
  };
  vocab: {
    currentLesson: number;
    totalLessons: number;
    completedLessons: number;
    completedPercent: number;
  };
}

interface UserDetailDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://192.168.1.52:5050";

export const UserDetailDialog: React.FC<UserDetailDialogProps> = ({
  open,
  onClose,
  user,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [completedLessons, setCompletedLessons] = useState<CompletedLesson[]>(
    []
  );
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && user) {
      fetchUserDetails();
    }
  }, [open, user, tabValue]);

  const fetchUserDetails = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // Fetch based on tab
      if (tabValue === 1) {
        // Achievements tab - only show unlocked achievements
        const response = await fetch(
          `${API_BASE}/api/achievements/user/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          // Filter only unlocked achievements and extract achievement data
          const unlockedAchievements = (data.data || [])
            .filter((item: any) => item.unlocked)
            .map((item: any) => ({
              ...item.achievement,
              unlockedAt: item.unlockedAt,
              progress: item.progress,
            }));
          setAchievements(unlockedAchievements);
        }
      } else if (tabValue === 2) {
        // Completed Lessons tab
        const response = await fetch(
          `${API_BASE}/api/progress/${user._id}/completed-lessons`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCompletedLessons(data.data || []);
        }
      } else if (tabValue === 0) {
        // Profile tab - fetch progress
        const response = await fetch(
          `${API_BASE}/api/progress/user/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUserProgress(data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Không thể tải thông tin chi tiết");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "reading":
        return "primary";
      case "listening":
        return "secondary";
      case "grammar":
        return "success";
      case "vocabulary":
        return "warning";
      default:
        return "default";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "bronze":
        return "#CD7F32";
      case "silver":
        return "#C0C0C0";
      case "gold":
        return "#FFD700";
      case "platinum":
        return "#E5E4E2";
      case "diamond":
        return "#B9F2FF";
      default:
        return "#8B5CF6";
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={user.avatar}
              alt={user.fullName}
              sx={{ width: 56, height: 56 }}
            >
              {user.fullName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">{user.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<SchoolIcon />} label="Thông tin" />
          <Tab icon={<TrophyIcon />} label="Thành tựu" />
          <Tab icon={<CheckCircleIcon />} label="Bài học" />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 400 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab 0: Profile & Progress */}
            {tabValue === 0 && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid sx={{ xs: 6 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: "100%",
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: 2,
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Vai trò
                        </Typography>
                        <Chip
                          label={user.role === "admin" ? "Admin" : "User"}
                          color={user.role === "admin" ? "primary" : "default"}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid sx={{ xs: 6 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: "100%",
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: 2,
                          borderColor: "success.main",
                        },
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Trạng thái
                        </Typography>
                        <Chip
                          label={
                            user.isVerified ? "Đã xác thực" : "Chưa xác thực"
                          }
                          color={user.isVerified ? "success" : "warning"}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid sx={{ xs: 6 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: "100%",
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: 2,
                          borderColor: "info.main",
                        },
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Ngày tạo
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="500">
                          {formatDate(user.createdAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid sx={{ xs: 6 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: "100%",
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: 2,
                          borderColor: "warning.main",
                        },
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <TimerIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Thời gian học
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="primary">
                          {userProgress?.totalAppTime
                            ? formatTime(userProgress.totalAppTime)
                            : "0m"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {userProgress && (
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <TrendingUpIcon />
                      Tiến độ học tập
                    </Typography>

                    {/* Reading Progress */}
                    <Card
                      variant="outlined"
                      sx={{
                        mb: 2,
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: 3,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <CardContent sx={{ pb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                          }}
                        >
                          <Typography variant="body1" fontWeight="600">
                            📖 Reading
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight="500"
                          >
                            {userProgress.reading.completedLessons}/
                            {userProgress.reading.totalLessons} bài
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={userProgress.reading.completedPercent}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: "rgba(25, 118, 210, 0.1)",
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="primary"
                          fontWeight="600"
                          sx={{ mt: 1, textAlign: "right" }}
                        >
                          {userProgress.reading.completedPercent.toFixed(1)}%
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Listening Progress */}
                    <Card
                      variant="outlined"
                      sx={{
                        mb: 2,
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: 3,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <CardContent sx={{ pb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                          }}
                        >
                          <Typography variant="body1" fontWeight="600">
                            🎧 Listening
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight="500"
                          >
                            {userProgress.listening.completedLessons}/
                            {userProgress.listening.totalLessons} bài
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={userProgress.listening.completedPercent}
                          color="secondary"
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: "rgba(156, 39, 176, 0.1)",
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="secondary"
                          fontWeight="600"
                          sx={{ mt: 1, textAlign: "right" }}
                        >
                          {userProgress.listening.completedPercent.toFixed(1)}%
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Grammar Progress */}
                    <Card
                      variant="outlined"
                      sx={{
                        mb: 2,
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: 3,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <CardContent sx={{ pb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                          }}
                        >
                          <Typography variant="body1" fontWeight="600">
                            ✍️ Grammar
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight="500"
                          >
                            {userProgress.grammar.completedLessons}/
                            {userProgress.grammar.totalLessons} bài
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={userProgress.grammar.completedPercent}
                          color="success"
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: "rgba(46, 125, 50, 0.1)",
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="success.main"
                          fontWeight="600"
                          sx={{ mt: 1, textAlign: "right" }}
                        >
                          {userProgress.grammar.completedPercent.toFixed(1)}%
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Vocabulary Progress */}
                    <Card
                      variant="outlined"
                      sx={{
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: 3,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <CardContent sx={{ pb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                          }}
                        >
                          <Typography variant="body1" fontWeight="600">
                            📚 Vocabulary
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight="500"
                          >
                            {userProgress.vocab.completedLessons}/
                            {userProgress.vocab.totalLessons} bài
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={userProgress.vocab.completedPercent}
                          color="warning"
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: "rgba(237, 108, 2, 0.1)",
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="warning.main"
                          fontWeight="600"
                          sx={{ mt: 1, textAlign: "right" }}
                        >
                          {userProgress.vocab.completedPercent.toFixed(1)}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Box>
            )}

            {/* Tab 1: Achievements */}
            {tabValue === 1 && (
              <Box>
                {achievements.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      color: "text.secondary",
                    }}
                  >
                    <TrophyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography>Chưa có thành tựu nào</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2.5}>
                    {achievements.map((achievement) => (
                      <Grid sx={{ xs: 12, sm: 6 }} key={achievement._id}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: "100%",
                            borderLeft: 4,
                            borderLeftColor: getDifficultyColor(
                              achievement.difficulty
                            ),
                            transition: "all 0.3s",
                            "&:hover": {
                              boxShadow: 4,
                              transform: "translateY(-4px)",
                              borderLeftWidth: 6,
                            },
                          }}
                        >
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "start",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 56,
                                  height: 56,
                                  borderRadius: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: `${getDifficultyColor(
                                    achievement.difficulty
                                  )}20`,
                                }}
                              >
                                <TrophyIcon
                                  sx={{
                                    fontSize: 32,
                                    color: getDifficultyColor(
                                      achievement.difficulty
                                    ),
                                  }}
                                />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="h6"
                                  gutterBottom
                                  fontWeight="600"
                                >
                                  {achievement.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1.5, lineHeight: 1.6 }}
                                >
                                  {achievement.description}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Chip
                                    label={
                                      achievement.difficulty?.toUpperCase() ||
                                      "UNKNOWN"
                                    }
                                    size="small"
                                    sx={{
                                      bgcolor: getDifficultyColor(
                                        achievement.difficulty
                                      ),
                                      color: "#fff",
                                      fontWeight: 600,
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <CalendarIcon sx={{ fontSize: 14 }} />
                                    {formatDate(achievement.unlockedAt)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Tab 2: Completed Lessons */}
            {tabValue === 2 && (
              <Box>
                {completedLessons.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      color: "text.secondary",
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography>Chưa hoàn thành bài học nào</Typography>
                  </Box>
                ) : (
                  <List>
                    {completedLessons.map((lesson, index) => (
                      <React.Fragment key={lesson._id}>
                        <ListItem
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 2,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="500">
                              {lesson.lessonId?.name || "Unknown Lesson"}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 2,
                                mt: 1,
                                alignItems: "center",
                              }}
                            >
                              <Chip
                                label={lesson.category}
                                size="small"
                                color={getCategoryColor(lesson.category) as any}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                <TrendingUpIcon
                                  fontSize="small"
                                  sx={{
                                    verticalAlign: "middle",
                                    mr: 0.5,
                                    fontSize: 16,
                                  }}
                                />
                                Điểm: {lesson.score}%
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(lesson.completedAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </ListItem>
                        {index < completedLessons.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
