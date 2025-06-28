const express = require("express");
const router = express.Router();
const PointTicketForm = require("../models/pointTicketForm");
const PointRequestTicketForm = require("../models/pointRequestTicketForm");
// const {  } = require("../middleware/auth");
const { verifyTokenMiddleware } = require("../controllers/auth");
const { db_user_read } = require("../utils/CRUD_userData");
const { db } = require("../configFiles/firebaseConfig.js");
const { v4: uuidv4 } = require("uuid");
const {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} = require("firebase/firestore");
const { queryRead } = require("../utils/CRUD_DATA.js");
const { firebaseDateToJSDate } = require("../utils/firebaseDateConverter.js");

const colNamePoint = "POINT_TICKET";
const colNameRequest = "POINT_REQUEST_TICKET";

// 포인트 요청 확인 미들웨어
const checkExistingRequest = async (req, res, next) => {
  try {
    const userId = req.userId;

    // 기존 신청건 확인
    const requestColRef = collection(db, colNameRequest);
    const q = query(
      requestColRef,
      where("info.userId", "==", userId),
      where("info.status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);

    // �� 정보를 req.body에 추가
    req.body.existingRequest = !querySnapshot.empty
      ? querySnapshot.docs[0].data()
      : null;
    next();
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 포인트 충전 요청
router.post(
  "/request/charge",
  verifyTokenMiddleware,
  checkExistingRequest,
  async (req, res) => {
    try {
      const { chargeAmount, existingRequest } = req.body;
      const userId = req.userId;

      // 기존 요청이 있으면 거부
      if (existingRequest) {
        return res.status(409).json({
          success: false,
          error: "이미 처리 중인 충전/환불 요청이 있습니다.",
        });
      }

      // 유저 데이터 조회
      const userRes = await db_user_read(userId);
      if (userRes.resultCode !== 200) {
        return res.status(400).json({
          success: false,
          error: "사용자 정보를 찾을 수 없습니다.",
        });
      }

      // 충전 금액별 보너스율 확인
      let bonusRate = 0;
      switch (chargeAmount) {
        case 5000:
          bonusRate = 0;
          break;
        case 10000:
          bonusRate = 0.03;
          break;
        case 30000:
          bonusRate = 0.05;
          break;
        case 50000:
          bonusRate = 0.06;
          break;
        case 100000:
          bonusRate = 0.075;
          break;
        default:
          return res.status(400).json({
            success: false,
            error:
              "올바르지 않은 충전 금액입니다. (5000, 10000, 30000, 50000, 100000원 중 선택)",
          });
      }
      // 포인트 충전 요청 티켓 생성
      const pointRequestTicket = new PointRequestTicketForm({
        userId,
        pointRequestTicketId: uuidv4(),
        // userCurrentAmount: userRes.data.point?.amount || 0,
        requestDate: new Date(),
        status: "pending",
        chargeAmount,
        bonusRate,
      });
      // console.log({ ...pointRequestTicket });

      // Firebase에 저장
      const ticketRef = doc(
        db,
        colNameRequest,
        pointRequestTicket.info.pointRequestTicketId
      );
      await setDoc(ticketRef, { ...pointRequestTicket });

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

//포인트 충전 취소 요청
router.delete(
  "/request/charge",
  verifyTokenMiddleware,
  checkExistingRequest,
  async (req, res) => {
    try {
      const { existingRequest } = req.body;
      const userId = req.userId;
      const requestColRef = collection(db, colNameRequest);
      //firebase에서 삭제
      const ticketRef = doc(
        db,
        colNameRequest,
        existingRequest.info.pointRequestTicketId
      );
      await deleteDoc(ticketRef);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

// 포인트 환불 요청
router.post("/request/refund", verifyTokenMiddleware, async (req, res) => {
  try {
    const { refundAmount, reason } = req.body;
    const userId = req.userId;

    const userRes = await db_user_read(userId);
    if (userRes.resultCode !== 200) {
      return res.status(400).json({
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      });
    }

    const pointRequestTicket = new PointRequestTicketForm({
      userId,
      pointRequestTicketId: uuidv4(),
      userCurrentAmount: userRes.data.point?.amount || 0,
      requestDate: new Date(),
      status: "pending",
      chargeAmount: -refundAmount,
    });

    // Firebase에 저장
    const ticketRef = doc(
      db,
      colNameRequest,
      pointRequestTicket.pointRequestTicketId
    );
    await setDoc(ticketRef, pointRequestTicket);

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 포인트 변동 내역 기록 미들웨어
const recordPointChange = async (req, res, next) => {
  try {
    const userId = req.userId;
    let amount, description, linkedTicketId;

    // 포인트 충전/환불 승인 시
    if (req.baseUrl.includes("/point") && req.path.includes("/admin/approve")) {
      const ticketRef = doc(db, colNameRequest, req.body.pointRequestTicketId);
      const ticketSnap = await getDoc(ticketRef);
      const requestTicket = ticketSnap.data();

      amount = requestTicket.chargeAmount;
      if (requestTicket.bonusRate) {
        amount += requestTicket.chargeAmount * requestTicket.bonusRate;
      }
      description = amount > 0 ? "포인트 충전" : "포인트 환불";
      linkedTicketId = requestTicket.pointRequestTicketId;
    }
    // 결제 시 (purchaseRoutes에서 사용)
    else if (req.baseUrl.includes("/purchase")) {
      amount = -req.body.totalAmount; // 결제는 포인트 차감이므로 음수
      description = "서비스 이용";
      linkedTicketId = req.purchaseTicketId; // purchaseRoutes에서 설정한 값
    }

    const userRes = await db_user_read(userId);
    if (userRes.resultCode !== 200) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    const beforeAmount = userRes.data.point?.amount || 0;
    const afterAmount = beforeAmount + amount;

    const pointTicket = new PointTicketForm({
      userId,
      pointTicketId: uuidv4(),
      amount,
      beforeAmount,
      afterAmount,
      description,
      requestTicket: req.baseUrl.includes("/point") ? linkedTicketId : null,
      purchaseTicket: req.baseUrl.includes("/purchase") ? linkedTicketId : null,
    });

    // Firebase에 저장
    const ticketRef = doc(db, colNamePoint, pointTicket.pointTicketId);
    await setDoc(ticketRef, pointTicket);

    // 다음 미들웨어에서 사용할 수 있도록 데이터 전달
    req.pointTicket = pointTicket;
    next();
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 관리자용 - 포인트 충전/환불 요청 승인
// router.post("/admin/approve", recordPointChange, async (req, res) => {
//   try {
//     const { pointRequestTicketId, adminMemo, status } = req.body;

//     const updateData = {
//       status,
//       "admin.adminId": req.userId,
//       "admin.adminMemo": adminMemo,
//       "admin.completeDate": new Date(),
//       approvalDate: new Date(),
//       userNewAmount: req.pointTicket.afterAmount, // recordPointChange에서 계산된 값
//     };

//     // Firebase 업데이트
//     const ticketRef = doc(db, colNameRequest, pointRequestTicketId);
//     await updateDoc(ticketRef, updateData);

//     res.status(200).json({ success: true });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// });

// // 포인트 충전/환불 요청 취소
// router.post("/request/cancel", verifyTokenMiddleware, async (req, res) => {
//   try {
//     const { pointRequestTicketId, cancelReason } = req.body;

//     const updateData = {
//       status: "cancel",
//       "cancel.cancelDate": new Date(),
//       "cancel.cancelReason": cancelReason,
//     };

//     // Firebase 업데이트
//     const ticketRef = doc(db, colNameRequest, pointRequestTicketId);
//     await updateDoc(ticketRef, updateData);

//     res.status(200).json({ success: true });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// });

// 포인트 요청 상태 확인
router.get(
  "/request/state",
  verifyTokenMiddleware,
  checkExistingRequest,
  async (req, res) => {
    try {
      const { existingRequest } = req.body;

      if (!existingRequest) {
        return res.status(400).json({
          success: false,
          error: "진행 중인 요청이 없습니다.",
        });
      }
      console.log(existingRequest);
      res.status(200).json({
        success: true,
        requestTicket: existingRequest,
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

// 포인트 내역 조회
router.get(
  "/loglist",
  verifyTokenMiddleware,
  checkExistingRequest,
  async (req, res) => {
    try {
      const userId = req.userId;
      const { existingRequest } = req.body;
      const pointLogList = await queryRead(
        colNamePoint,
        "userId",
        userId,
        (a, b) => {
          return b.requestDate - a.requestDate;
        }
      );
      let newPointLogList = pointLogList.data.map((item) => {
        return {
          storeUUID: item.storeUUID,
          description: item.description,
          date:
            firebaseDateToJSDate(item.requestDate)
              .toLocaleDateString()
              .replaceAll(" ", "")
              .slice(0, 10) +
            " " +
            firebaseDateToJSDate(item.requestDate)
              .toLocaleTimeString("en-GB")
              .slice(0, 5),
          // .slice(),
          changePoint: item.amount,
          afterPoint: item.afterAmount,
          isDelete: false,
        };
      });
      if (existingRequest) {
        const newDate = existingRequest.info.requestDate;
        newPointLogList = [
          {
            description: "포인트 충전 (처리중)",
            date:
              firebaseDateToJSDate(existingRequest.info.requestDate)
                .toLocaleDateString()
                .replaceAll(" ", "")
                .slice(0, 10) +
              " " +
              firebaseDateToJSDate(existingRequest.info.requestDate)
                .toLocaleTimeString("en-GB")
                .slice(0, 5),
            changePoint: existingRequest.charge.chargeAmount,
            isDelete: true,
          },
          ...newPointLogList,
        ];
      }
      //empty array?
      if (newPointLogList.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      } else {
        return res.status(200).json({ success: true, data: newPointLogList });
      }
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;
