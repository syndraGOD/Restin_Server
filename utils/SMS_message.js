const RESForm = require("../models/inPacketForm");
const msgModule = require("coolsms-node-sdk").default;
const apiKey = process.env.COOLSMS_API_KEY;
const apiSecret = process.env.COOLSMS_API_SECRET;
const fromNumber = process.env.COOLSMS_FROM_NUMBER;
const messageService = new msgModule(apiKey, apiSecret);



module.exports = sendMsg = async (phoneNumber, message) => {
  try {
    if(process.env.NODE_ENV === "production"){
      messageService
        .sendOne({
          to: phoneNumber,
          from: fromNumber,
          text: message,
        })
        .then((res) => {
          return new RESForm({
            resultCode: 200,
            text: "정상접수",
          });
        });
    }else{
      global.sendDiscordWebhook('', "SMS", "문자 발송", "수신자 : " + phoneNumber + "\n" + message);

    } 
  } catch (error) {
    console.error('SMS 메시지 전송 실패:', error);
    return new RESForm({
      resultCode: 500,
      text: "msg 전송 실패",
      error,
    });
  }
};
