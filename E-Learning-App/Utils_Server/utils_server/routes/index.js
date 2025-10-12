const utilsController = require("../controllers/index");

function router(app) {
  app.post("/chat", utilsController.aswerQuestion);
  app.post("/translate", utilsController.translate);
  app.post("/pronoun", utilsController.pronoun);
}
module.exports = router;
