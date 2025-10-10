require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routes/index");
const PORT = process.env.PORT;

const app = express();
// Khi có domain client thì chuyển sang dùng cái này
// app.use(
//   cors({
//     origin: process.env.CLIENT_DOMAIN,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
app.use(cors());
app.use(express.json());
router(app);

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
