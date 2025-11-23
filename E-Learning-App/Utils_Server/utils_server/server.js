require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routes/index");
const PORT = process.env.PORT || 3000;

const app = express();
// Khi có domain client thì chuyển sang dùng cái này
// app.use(
//   cors({
//     origin: process.env.CLIENT_DOMAIN,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
router(app);

app.listen(PORT, "0.0.0.0", () =>
  console.log("Server running on port " + PORT)
);
