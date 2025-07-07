const {
  queryRead,
  queryWrite,
  getTimestamp,
} = require("../utils/CRUD_DATA.js");

const existSurveyMiddleware = async (req, res, next) => {
  const { userId } = req;
  const surveyDoc = await queryRead("SURVEY", "userId", userId);
  if (surveyDoc.success) {
    if (
      surveyDoc.data.length > 0 &&
      surveyDoc.data.some((doc) => doc.USE_FG === "Y")
    ) {
      next();
    } else {
      res.status(400).json({ message: "WHERE_USE_LOCATION not exist" });
    }
  } else {
    res.status(400).json({ message: `error: ${surveyDoc?.error}` });
  }
};

const createSurveyMiddleware = async (req, res, next) => {
  const { userId } = req;
  const userDoc = (await queryRead("USER", "userId", userId))?.data[0];
  const { contents } = req.body;
  if (!contents) {
    res.status(400).json({ message: `contents is null ${req.body}` });
    return;
  }
  if (userDoc && contents?.length >= 2) {
    const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    const newSurveyDoc = {
      userId: userId,
      USE_FG: "Y",
      REG_DT: now.toISOString().split(".")[0],
      contents: contents,
      profile: userDoc.profile,
    };
    const docName = `survey_result_${userId}`;
    const surveyDoc = await queryWrite("SURVEY", docName, newSurveyDoc);

    if (surveyDoc.success) {
      next();
      global.sendDiscordWebhook(process.env.DISCORD_SURVEY, "설문 제출", "사용지역 조사 설문", "닉네임 : " + userDoc.profile.nick + "\n" + "설문 내용 : " + contents);
    } 
    else {
      res.status(400).json({ message: `error: ${surveyDoc?.error}` });
    }
  } else {
    res.status(400).json({ message: `contents is null` });
  }
};

module.exports = { existSurveyMiddleware, createSurveyMiddleware };
