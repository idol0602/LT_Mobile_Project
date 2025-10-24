import { palette } from "../../styles/palette";

export const vocabPageStyles = {
  container: {
    p: 4,
    bgcolor: palette.background,
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 3,
  },
  title: {
    fontWeight: "bold",
    color: palette.primary,
  },
  addButton: {
    background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`,
    color: "white",
    borderRadius: 3,
    px: 3,
    py: 1,
    fontWeight: "bold",
    "&:hover": {
      background: `linear-gradient(90deg, ${palette.secondary}, ${palette.primary})`,
    },
  },
  searchBox: {
    p: 2,
    mb: 2,
    border: "1px solid #E0E7EF",
    borderRadius: 3,
    backgroundColor: "white",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      "& fieldset": { borderColor: "#D0D8E0" },
      "&:hover fieldset": { borderColor: palette.primary },
    },
  },
  tableWrapper: {
    borderRadius: 3,
    overflow: "hidden",
    boxShadow: 3,
  },
  tableHead: { background: palette.primary },
  tableHeadCell: {
    color: "white",
    fontWeight: "bold",
    borderRight: "1px solid rgba(255,255,255,0.2)",
  },
  image: {
    width: 60,
    height: 60,
    objectFit: "cover",
    borderRadius: 8,
  },
  editButton: { color: palette.primary },
  deleteButton: { color: palette.danger },
};
