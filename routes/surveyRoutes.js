const express = require("express");
const router = express.Router();
const { verifyTokenMiddleware } = require("../controllers/auth.js");
const {
  existSurveyMiddleware,
  createSurveyMiddleware,
} = require("../controllers/survey.js");

router.get(
  "/exist/WHERE_USE_LOCATION",
  verifyTokenMiddleware,
  existSurveyMiddleware,
  (req, res) => {
    res.status(200).json({ message: "WHERE_USE_LOCATION exist" });
  }
);

router.post(
  "/submit/WHERE_USE_LOCATION",
  verifyTokenMiddleware,
  createSurveyMiddleware,
  (req, res) => {
    res.status(200).json({ message: "WHERE_USE_LOCATION created" });
  }
);

module.exports = router;
