const express = require("express");
const router = express.Router();
const { verifyTokenMiddleware } = require("../controllers/auth.js");

const { Expo } = require("expo-server-sdk");
const expo = new Expo();
router.use(verifyTokenMiddleware);

router.post("/tokenPush", (req, res) => {
  const { userId } = req;
  const noti_token = req.body.noti_token.data;
  //   console.log(Expo.isExpoPushToken(noti_token));

  const sendMsg = {
    to: noti_token,
    title: "테스트",
    body: "하이하이",
    sound: "default",
    data: { withSome: "data" },
  };
  try {
    setTimeout(async () => {
      let chunks = expo.chunkPushNotifications([sendMsg]);
      let tickets = [];

      for (let chunk of chunks) {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log("Tickets:", noti_token, ticketChunk);
        tickets.push(...ticketChunk);
      }
      console.log("알림 전송 성공");
    }, 5000);
  } catch (error) {
    console.error("알림 전송 실패:", error);
  }
  res.status(200).json({ message: "user start usage", data: req.userData });
});

module.exports = router;
//'ExponentPushToken[eRFV5TMRwxB3YUrzRQiwwq]'
