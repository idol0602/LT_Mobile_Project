import { palette } from "../../styles/palette";

export const vocabFormStyles = {
  dialogPaper: {
    borderRadius: 4,
    p: 1,
    backgroundColor: palette.background,
  },
  dialogTitle: {
    background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
    color: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    fontWeight: "bold",
  },
  avatarBox: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    mb: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    bgcolor: "#E0F7F9",
    mb: 1,
    border: `2px solid ${palette.primary}`,
  },
  uploadBtn: {
    textTransform: "none",
    borderColor: palette.primary,
    color: palette.primary,
    "&:hover": {
      borderColor: palette.secondary,
      backgroundColor: palette.hoverBg,
    },
  },
  cancelBtn: {
    color: palette.textSecondary,
    textTransform: "none",
    fontWeight: "bold",
  },
  saveBtn: {
    background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`,
    color: "white",
    borderRadius: 2,
    textTransform: "none",
    fontWeight: "bold",
    "&:hover": {
      background: `linear-gradient(90deg, ${palette.secondary}, ${palette.primary})`,
    },
  },
};
