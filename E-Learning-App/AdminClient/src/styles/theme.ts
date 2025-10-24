// src/theme.ts
import { createTheme } from "@mui/material/styles";

// Bảng màu của bạn
export const palette = {
  primary: "#088395",    // Xanh đậm
  secondary: "#00B8A9",   // Xanh ngọc
  background: "#F8FAFC",  // Nền xám rất nhạt
  paper: "#FFFFFF",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  danger: "#EF4444",
  divider: "#E2E8F0",
};

export const theme = createTheme({
  palette: {
    primary: {
      main: palette.primary,
    },
    secondary: {
      main: palette.secondary,
    },
    background: {
      default: palette.background,
      paper: palette.paper,
    },
    text: {
      primary: palette.textPrimary,
      secondary: palette.textSecondary,
    },
    divider: palette.divider,
    error: {
      main: palette.danger,
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    h4: { fontWeight: 700, color: palette.textPrimary },
    h5: { fontWeight: 600, color: palette.textPrimary },
    h6: { fontWeight: 600, color: palette.textPrimary },
  },
  shape: {
    borderRadius: 12, // Bo góc lớn hơn cho giao diện hiện đại
  },
  components: {
    // Tùy chỉnh style mặc định cho các component
    MuiButton: {
      defaultProps: {
        disableElevation: true, // Bỏ đổ bóng mặc định
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
        containedPrimary: {
            color: 'white',
            background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`,
            transition: 'all 0.3s ease',
            '&:hover': {
                boxShadow: `0 6px 20px ${palette.primary}50`,
                transform: 'translateY(-2px)',
            }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Ghi đè style mặc định
        }
      }
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 16, // Bo góc cho Card
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    transform: 'translateY(-2px)'
                }
            }
        }
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                }
            }
        }
    },
    MuiSelect: {
        styleOverrides: {
            root: {
                borderRadius: 8,
            }
        }
    }
  },
});