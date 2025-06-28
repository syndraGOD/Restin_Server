const utcFromTimestamp = (time) => {
  const hour9 = 32400000;
  return new Date(time * 1000 + hour9); //32400000 = 9시간 / utc 시간 한국시간맞추기
};

const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "configFiles/.env" });
const secretKey = process.env.JWT_SECRET_KEY;

const generateToken = (payload) => {
  const hour = 60 * 60;
  const day = hour * 24;
  const month = day * 30;

  const now = Math.floor(Date.now() / 1000); // 현재 시각 (초 단위)
  const tokenExp = day * 90; // 1일을 초 단위로 환산
  const expirationTime = now + tokenExp;

  const options = {
    algorithm: "HS256", // algorithms를 algorithm으로 변경
    iat: now,
    exp: expirationTime,
  };

  const newPayload = {
    ...payload,
    iat: options.iat,
    exp: options.exp,
  };

  const token = jwt.sign(newPayload, secretKey, {
    algorithm: options.algorithm,
  }); // options 수정
  return token;
};

const refreshToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, secretKey, {
      algorithms: ["HS256"], // verify에서는 algorithms 사용 가능
    });

    const payload = {
      userId: decodedToken.userId,
      userType: decodedToken.userType,
    };
    const newToken = generateToken(payload);
    return newToken;
  } catch (error) {
    console.error("error refreshing token", error);
    return null;
  }
};

module.exports = { jwt, generateToken, refreshToken, utcFromTimestamp };
