const utilsController = require("../controllers/index");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

function router(app) {
  // Health check endpoints
  app.get("/", (req, res) => {
    res.json({
      status: "OK",
      message: "Utils Server is running",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      service: "Utils Server",
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/chat", utilsController.aswerQuestion);
  app.post("/translate", utilsController.translate);
  app.post("/pronoun", upload.single("audio"), utilsController.pronoun);
}
module.exports = router;
