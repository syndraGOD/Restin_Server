const express = require("express");
const router = express.Router();
const { verifyTokenMiddleware } = require("../controllers/auth.js");
const { db_store_read_all } = require("../utils/CRUD_storeData.js");

// 민감 정보를 제거하는 함수
const removeSensitiveInfo = (storeData) => {
  const filteredData = storeData.map((store) => {
    const {
      ownerCall,
      storeOwnerName,
      accountHolder,
      signDate,
      ...publicStoreInfo
    } = store;

    return publicStoreInfo;
  });
  return filteredData;
};

// 토큰 검증 후 스토어 데이터 반환 (민감 정보 제외)
router.get("/getStoreData", verifyTokenMiddleware, async (req, res) => {
  try {
    const result = await db_store_read_all();

    const filterResult = result.data.filter((store) => {
      // console.log(store.BusinessState);
      if (store.BusinessState === "true" || store.BusinessState === true) {
        return true;
      }
    });

    if (result.resultCode === 200) {
      const publicData = removeSensitiveInfo(filterResult);

      res.status(200).json({
        success: true,
        data: publicData,
      });
    } else {
      res.status(result.resultCode).json({
        success: false,
        message: result.text,
      });
    }
  } catch (error) {
    console.error("스토어 데이터 조회 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

module.exports = router;
