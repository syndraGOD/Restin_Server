const { db, storage } = require("../configFiles/firebaseConfig.js");
const { ref, getDownloadURL, listAll } = require("firebase/storage");
const { verifyTokenMiddleware } = require("../controllers/auth");

const express = require("express");
const router = express.Router();

router.get("/announce_list", verifyTokenMiddleware, async (req, res, next) => {
  try {
    const pathRef = ref(storage, `AnnounceImage`);
    const imageList = await listAll(pathRef);
    const imageURLs = await Promise.all(
      imageList.items.map((item) => getDownloadURL(item))
    );
    // imageURLs.sort((a, b) => {
    //     return b.usage.startTime.seconds - a.usage.startTime.seconds;
    //   })
    res.status(200).json({
      success: true,
      data: imageURLs,
    });
  } catch (error) {
    console.log(error);
  }
});
// router.get('/')
module.exports = router;
