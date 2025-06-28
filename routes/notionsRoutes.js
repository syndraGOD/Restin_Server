const express = require("express");
const router = express.Router();

//mjs 모듈을 commonjs에서 가져오기
const getNotionModule = async () => {
  const NotionModule = await import("notion-client");
  return NotionModule;
};
let NotionAPIS;
getNotionModule().then((NotionModule) => {
  const { NotionAPI } = NotionModule;
  NotionAPIS = NotionAPI;
});

const getNotion = async (loc) => {
  const notion = new NotionAPIS();
  const recordMap = await notion.getPage(loc);
  return recordMap;
};
router.get("/:notionPageCode", async (req, res) => {
  console.log("getnotion : ", req.params.notionPageCode);
  try {
    const loc = req.params.notionPageCode;
    // console.log(NotionAPI);
    getNotion(loc).then((notion) => res.send(notion));
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
