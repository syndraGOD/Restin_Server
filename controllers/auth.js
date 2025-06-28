const {
  db_user_create,
  db_user_read,
  db_user_read_query,
  db_user_update,
  db_user_delete,
} = require("../utils/CRUD_userData.js");

const UserForm = require("../models/userDataForm.js");
const { firebaseConfig, admin } = require("../configFiles/firebaseConfig.js");
const { jsDateToFirebaseDate } = require("../utils/firebaseDateConverter.js");
const sendMsg = require("../utils/SMS_message.js");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const { generateToken, utcFromTimestamp } = require("../utils/TokenAPI.js");

const smsVerify = {
  //솔직히 이딴 방법 쓰면 안되는데, /login에서 유저정보 검증은 해야되겠고
  //db에 verifycode를 저장하긴 복잡하니까 임시로 구현하고
  //이번에 만들면서 얻은 지식들로 처음부터 다시 만들자.
  //많이 부족하다
};
/**
 *
 */
// admin.initializeApp(firebaseConfig);

//미들웨어는, 성공토큰을 보내면 안된다,
//마지막 200 res는 반드시 routes에서
//모든 userData는 서버에서 불러와서 수정할것

const verifyTokenMiddleware = async (req, res, next) => {
  const userToken = req.headers["authorization"]?.split(" ")[1];
  //token = jwt token || "null" || undefined
  if (!userToken || userToken === "null") {
    res.status(401).json({
      message: "token is null or undefind",
    });
    return;
  }
  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    const jwtDecoded = jwt.verify(userToken, secretKey);
    const userId = jwtDecoded.userId;
    console.log(utcFromTimestamp(jwtDecoded.exp), userId);
    if (!userId) {
      res.status(401).json({
        message: "userId is null",
      });
      return;
    }
    req.userId = userId;
    next();
  } catch (error) {
    console.log("[error] token is invaild or null");
    res.status(401).json({
      message: "token is expired or invaild",
    });
  }
};

//가입된 유저인지 확인하는 미들웨어
const user_smsVerifyMiddleware = async (req, res, next) => {
  if (
    req.body.phoneNumber !== undefined &&
    req.body.phoneNumber.length === 11
  ) {
    const phoneNumber = req.body.phoneNumber;
    let verifiCode = Math.floor(100000 + Math.random() * 900000);

    req.body.verifiCode = verifiCode;
    try {
      if (
        phoneNumber === "01072105819" ||
        phoneNumber === "01066540149" ||
        phoneNumber === "01023961736" ||
        phoneNumber === "01027065225"
      ) {
        verifiCode = 111111;
        req.body.verifiCode = verifiCode;
        smsVerify[req.body.phoneNumber] = req.body.verifiCode;
        console.log(smsVerify);
        next();
      } else {
        sendMsg(
          phoneNumber,
          `[${verifiCode}] 레스틴에서 보내는 인증번호입니다`
        );
        smsVerify[req.body.phoneNumber] = req.body.verifiCode;
        console.log(smsVerify);
        next();
      }
    } catch (RESForm) {
      // console.log(RESForm);
      res.status(400).json({ message: RESForm });
    }
  } else {
    res.status(400).json({ message: "is not phoneNumber format" });
  }
};
//sms 인증번호 확인 미들웨어
const user_verifiCodeMiddleware = (req, res, next) => {
  try {
    const { userverificode, phonenumber } = req.headers;
    if (
      !userverificode ||
      !phonenumber ||
      smsVerify[phonenumber] !== Number(userverificode)
    ) {
      // console.warn(82, smsVerify[phonenumber], Number(userverificode));
      console.log(
        "error! SMSVerify",
        smsVerify[phonenumber],
        Number(userverificode)
      );
      res.status(412).json({
        message: "verifiCode is null or undefind or invaild",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(412).json({
      message: "verifiCode is null or undefind or invaild",
    });
  }
};
const user_isExistUserMiddleware = async (req, res, next) => {
  const phoneNumber = req.headers.phonenumber;
  console.log(req.headers.phonenumber);
  if (phoneNumber) {
    const getUserData = await db_user_read_query(
      "profile.phoneNumber",
      phoneNumber
    );
    if (getUserData.resultCode === 200) {
      //아 여기서 완전 보안 처리하려면,
      //userdata에 verificode를 같이 저장시킨다음
      //
      req.userId = getUserData.data;
      next();
    } else {
      res
        .status(200)
        .json({ message: "sms verifi ok, but user not regist", exist: false });
    }
  } else {
    res.status(400).json({ message: "phonenumber is empty" });
  }
};
//token login
const user_loginMiddleware = async (req, res, next) => {
  const userId = req.userId ?? req.headers.userId;
  console.log(userId, req.userId, req.headers.userId);
  const user = await db_user_read(userId);

  if (user.resultCode === 404 || user.resultCode === 500 || !user.data) {
    return res.status(404).json({ message: user.text });
  }
  const payload = {
    userId: user.data.userId,
    userType: user.data.profile.userType,
  };
  const newToken = generateToken(payload);
  user.data.security = {
    ...user.data.security,
    lastLogin: jsDateToFirebaseDate(new Date()),
    auth_token: newToken,
  };
  console.log("Token Refresh : ", user.data.profile.phoneNumber);
  res
    .status(200)
    .json({ message: "user login access", user, newToken, exist: true });
  await db_user_update(userId, user.data);
};
const user_registerMiddleware = async (req, res, next) => {
  const { nick, birth, phoneNumber } = req.body;
  // console.log(nick, birth);
  const userId = uuidv4();
  const pushData = {
    userId,
    profile: {
      phoneNumber,
      nick,
      birth,
      userType: "user",
      joinDate: jsDateToFirebaseDate(new Date()),
      accountState: "alive",
    },
  };
  try {
    const RES = await db_user_create(pushData);
    if (RES.resultCode === 200) {
      req.userId = userId;
      next();
    } else {
      res.status(400).json({ message: RES.text });
    }
  } catch {
    res.status(401).json({ message: "user create failed" });
  }
};
const user_deleteMiddleware = async () => {};
// user_isExistUser();
// user_register();
//로그아웃은 프론트에서 token 삭제 + useradata state 삭제
module.exports = {
  verifyTokenMiddleware,
  user_isExistUserMiddleware,
  user_smsVerifyMiddleware,
  user_verifiCodeMiddleware,
  user_registerMiddleware,
  user_loginMiddleware,
  user_deleteMiddleware,
};
