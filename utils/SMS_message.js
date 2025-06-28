const RESForm = require("../models/inPacketForm");
const msgModule = require("coolsms-node-sdk").default;
const apiKey = "NCSS7ZTFPWCTQJCC";
const apiSecret = "G7TBDKLPBPXDTBJ3XMJFI1OUTPY2SDQB";
const fromNumber = "07080959289";
const messageService = new msgModule(apiKey, apiSecret);

module.exports = sendMsg = (phoneNumber, message) => {
  try {
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
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "msg 전송 실패",
      error,
    });
  }
};
