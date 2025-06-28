const {
  user_isExistUserMiddleware,
  user_loginMiddleware,
  user_registerMiddleware,
  verifyTokenMiddleware,
  user_smsVerifyMiddleware,
  user_verifiCodeMiddleware,
} = require("../controllers/auth.js");

// register, login 등 모든 절차가 token을 거쳐야함

//전화번호 인증 후 - firebase 회원가입 O / USER DB X
//0. 프론트 - 전화번호 인증 / fb regis clear token ㅇ
// 기존의 유저인지 확인 - db에 데이터 있는지 확인해야함
//1. 프론트 - restin.co.kr/auth/isExist으로 get
//2. 백 - isLogin만 res
//2-1. (if not exist) 프론트 : 기본 정보 입력 밑 이용약관 동의 후 regis
//3. 프론트에서 res ? auth/login get : auth/register post(token, profile send)

//3-1. regis => status 200 ok
//3-2. front : go 4-1
//4. login => userdata res
const express = require("express");
const router = express.Router();

//firebase auth uuid
//sms 전송
router.post("/smsVerify", user_smsVerifyMiddleware, (req, res) => {
  res.status(200).json({ message: "SMS send  complete" });
});
//sms code verifi
router.post(
  "/register",
  user_registerMiddleware,
  user_loginMiddleware,
  (req, res) => {
    res
      .status(200)
      .json({ message: "user create complete", userId: req.userId });
  }
);
// Firebase auth를 사용하여, 원래 모든 진입시점에 token이 있었으나,
// 중간에 fb auth를 제거하여, 임시적으로 순서를 변경하여 register 및 smsverify때는 토큰인증 패스
// router.use(verifyTokenMiddleware);
router.get(
  "/login",
  verifyTokenMiddleware,
  user_loginMiddleware,
  (req, res) => {}
);
router.get(
  "/login_smsCodeVerify",
  user_verifiCodeMiddleware,
  user_isExistUserMiddleware,
  user_loginMiddleware,
  (req, res) => {
    //     res
    //       .status(200)
    //       .json({
    //         message: "who is exist user",
    // //userData
    //       });
  }
);

module.exports = router;

/*
한울 계정정보
userId : gIdgd6w8ymdM35ASp5UQfiApMWu2
token: eyJhbGciOiJSUzI1NiIsImtpZCI6ImU2YWMzNTcyNzY3ZGUyNjE0ZmM1MTA4NjMzMDg3YTQ5MjMzMDNkM2IiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcmVzdGluLWQ1NzBlIiwiYXVkIjoicmVzdGluLWQ1NzBlIiwiYXV0aF90aW1lIjoxNzMwNzg0MTQ0LCJ1c2VyX2lkIjoiZ0lkZ2Q2dzh5bWRNMzVBU3A1VVFmaUFwTVd1MiIsInN1YiI6ImdJZGdkNnc4eW1kTTM1QVNwNVVRZmlBcE1XdTIiLCJpYXQiOjE3MzA3ODQxNDQsImV4cCI6MTczMDc4Nzc0NCwicGhvbmVfbnVtYmVyIjoiKzgyMTA3MjEwNTgxOSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzgyMTA3MjEwNTgxOSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.KNRkwuE8QfVfd8Da0izyzF6cof9LvsMPnN2MVAeTsD4q2nToOutdQECqmLUieSlf82Br8YqNZS3MjMJ9EdQ3aD6xXdmkmEN5yGO7pgTUoizcX-PzKkLG0t9syS0_W9Q6jtAuYtgdKm8Uhid9laTCsX_-wdHCcLxViHw-d_l6qTdBBCWVdUTpUjPOoAMBKuqEW_NgeHtvHXTN3rjuJ4TIIFOIs57zIWc9fzTgjdEFJ0e2UQb0jeY5rcZadTFRnIz2sHseHHq-oxPO1vW9Jw-Ga7_FdgBSt-WBzd79IiwsYS_6-xbzec2wBei7mSfHx_G-GkvCl5-jJnMkjn7hSobW_g
phonenumber : 1072105819
displayName : hanwol 
birthday : 990212
*/
