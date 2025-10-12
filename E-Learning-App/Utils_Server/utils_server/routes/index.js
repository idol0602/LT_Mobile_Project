const utilsController = require("../controllers/index");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

function router(app) {
  app.post("/chat", utilsController.aswerQuestion);
  app.post("/translate", utilsController.translate);
  app.post("/pronoun", upload.single("audio"), utilsController.pronoun);
}
module.exports = router;
