const express = require("express");
const router = express.Router();
const { verifyTokenMiddleware } = require("../controllers/auth");
const { db_user_read } = require("../utils/CRUD_userData");
const { db } = require("../configFiles/firebaseConfig.js");
const { v4: uuidv4 } = require("uuid");
const {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} = require("firebase/firestore");
const PurchaseTicketForm = require("../models/purchaseTicketForm");
const PointTicketForm = require("../models/pointTicketForm");
const UsageTicketForm = require("../models/usageTicketForm");
const fetch = require("node-fetch");
const { queryRead } = require("../utils/CRUD_DATA.js");
const { firebaseDateToJSDate } = require("../utils/firebaseDateConverter.js");
const PORTONE_API_SECRET =
  "v2ncCChqZBpgIkyufFjksTIzcHCrVLWnkWo3l42s4tKYBvfQCwEZfGdx01ul91eSkdUst7MKveLhJF2X";

router.post("/usage/portone", verifyTokenMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentId, paymentMethod, selectedPayment } = req.body;
    console.log(
      "payment_portone_request : ",
      userId,
      "paymentId : ",
      paymentId
    );
    // 요청의 body로 paymentId가 오기를 기대합니다.

    // 1. 포트원 결제내역 단건조회 API 호출
    const paymentResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: { Authorization: `PortOne ${PORTONE_API_SECRET}` },
      }
    );
    if (!paymentResponse.ok)
      throw new Error(`paymentResponse: ${await paymentResponse.json()}`);
    const payment = await paymentResponse.json();
    // console.log("portone RES : ", payment);

    // 2. 고객사 내부 주문 데이터의 가격과 실제 지불된 금액을 비교합니다.

    // 유저 데이터 조회
    const userRes = await db_user_read(userId);
    if (userRes.resultCode !== 200) {
      return res.status(400).json({
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      });
    } // 코드 개같이 짜놔서 죄송합니다.. 초기에 공부하면서 만들었어서..

    //결제대기건이 남ㅇ있는지 확인
    const ifusageIngRef = await queryRead(
      "USAGE_WAIT_PURCHASE_TICKET",
      "usage.userId",
      userId
    );
    if (ifusageIngRef.data.length === 0) {
      return res.status(400).json({
        success: false,
        error: "결제대기건이 없습니다.",
      });
    }

    const usageTotalAmount = userRes.data.usage.totalUsagePrice;
    if (usageTotalAmount === payment.amount.total) {
      switch (payment.status) {
        case "VIRTUAL_ACCOUNT_ISSUED": {
          throw new Error(`가상계좌 관련 기능이 없는데 가상 계좌 코드가 떴음`);
          const paymentMethod = payment.paymentMethod;
          // 가상 계좌가 발급된 상태입니다.
          // 계좌 정보를 이용해 원하는 로직을 구성하세요.
          break;
        }
        case "PAID": {
          //정상적인 결제가 이루어졌습니다.
          //
          //
          //
          //
          //
          //
          //
          //
          //
          //
          //
          // 구매 티켓 생성
          const purchaseTicketUUID = paymentId;
          const purchaseTicket = new PurchaseTicketForm({
            purchaseTicketId: purchaseTicketUUID,
            usageLogTicketId: userRes.data.usage.usageLogId,
            userId: userRes.data.userId,
            userInfo: {
              phoneNumber: userRes.data.profile.phoneNumber,
              nick: userRes.data.profile.nick,
            },
            storeId: userRes.data.usage.storeId,
            storeUUID: userRes.data.usage.storeUUID,
            purchaseDate: new Date(),
            amount: userRes.data.usage.totalUsagePrice,
            paymentMethod: paymentMethod,
            status: "complete",
            selectedPayment: selectedPayment,
          });

          // 초기화된 usage 데이터 생성
          const newUsage = new UsageTicketForm({ userId: userRes.data.userId });

          // 구매 티켓 저장
          const purchaseRef = doc(db, "PURCHASE_TICKET", purchaseTicketUUID);
          await setDoc(purchaseRef, { ...purchaseTicket });

          // USAGE_WAIT_PURCHASE_TICKET에서 데이터 가져오기
          const usageIngRef = doc(
            db,
            "USAGE_WAIT_PURCHASE_TICKET",
            userRes.data.usage.usageLogId
          );
          const usageEndRef = doc(
            db,
            "USAGE_END_TICKET",
            userRes.data.usage.usageLogId
          );
          // USAGE_WAIT_PURCHASE_TICKET의 데이터를 USAGE_END_TICKET으로 이동
          await setDoc(usageEndRef, {
            usage: {
              ...userRes.data.usage,
              status: "complete",
              purchaseTicketId: purchaseTicketUUID,
              pointTicketId: null,
              endDate: new Date(),
            },
          });

          // USAGE_WAIT_PURCHASE_TICKET 문서 삭제
          await deleteDoc(usageIngRef);

          // 유저의 포인트 잔액과 usage 데이터 업데이트
          const userRef = doc(db, "USER", userId);

          await updateDoc(userRef, {
            usage: { ...newUsage.usage },
          });
          const New_userRes = await db_user_read(userId);

          res.status(200).json({
            success: true,
            data: {
              purchaseAmount: userRes.data.usage.totalUsagePrice,
              usageDurationMinutes:
                userRes.data.usage.totalUsageDurationMinutes,
              selectedPayment: selectedPayment,
            },
            userData: New_userRes.data,
          });
          //
          //
          //
          //
          //
          //
          //
          //
          console.log("payment complete :", userId, usageTotalAmount);
          break;
        }
      }
    } else {
      // 결제 금액이 불일치하여 위/변조 시도가 의심됩니다.
      console.log("결제 금액이 불일치하여 위/변조 시도가 의심됩니다.");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/usage/point", verifyTokenMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const purchaseTicketUUID = uuidv4();
    const pointTicketUUID = uuidv4();

    // 유저 데이터 조회
    const userRes = await db_user_read(userId);
    if (userRes.resultCode !== 200) {
      return res.status(400).json({
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      });
    }
    //결제대기건이 남ㅇ있는지 확인
    const ifusageIngRef = await queryRead(
      "USAGE_WAIT_PURCHASE_TICKET",
      "usage.userId",
      userId
    );
    // console.log(ifusageIngRef.data);
    if (ifusageIngRef.data.length === 0) {
      return res.status(400).json({
        success: false,
        error: "결제대기건이 없습니다.",
      });
    }

    const currentPoint = userRes.data.point.amount || 0;
    const totalAmount = userRes.data.usage.totalUsagePrice;

    // 포인트 잔액 확인
    if (currentPoint < totalAmount) {
      return res.status(400).json({
        success: false,
        error: "포인트가 부족합니다.",
      });
    }

    // 구매 티켓 생성
    const purchaseTicket = new PurchaseTicketForm({
      purchaseTicketId: purchaseTicketUUID,
      pointTicketId: pointTicketUUID,
      usageLogTicketId: userRes.data.usage.usageLogId,
      userId: userRes.data.userId,
      userInfo: {
        phoneNumber: userRes.data.profile.phoneNumber,
        nick: userRes.data.profile.nick,
      },
      storeId: userRes.data.usage.storeId,
      storeUUID: userRes.data.usage.storeUUID,
      purchaseDate: new Date(),
      amount: userRes.data.usage.totalUsagePrice,
      paymentMethod: "point",
      status: "complete",
    });

    // 포인트 차감 기록
    const pointTicket = new PointTicketForm({
      userId: userRes.data.userId,
      pointTicketId: pointTicketUUID,
      amount: -userRes.data.usage.totalUsagePrice,
      beforeAmount: currentPoint,
      afterAmount: currentPoint - totalAmount,
      description: "서비스 이용",
      purchaseTicket: purchaseTicketUUID,
      storeUUID: userRes.data.usage.storeUUID,
    });

    // 초기화된 usage 데이터 생성
    const newUsage = new UsageTicketForm({ userId: userRes.data.userId });

    // 구매 티켓 저장
    const purchaseRef = doc(db, "PURCHASE_TICKET", purchaseTicketUUID);
    await setDoc(purchaseRef, { ...purchaseTicket });

    // 포인트 티켓 저장
    const pointRef = doc(db, "POINT_TICKET", pointTicketUUID);
    await setDoc(pointRef, { ...pointTicket });

    // USAGE_ING_TICKET에서 데이터 가져오기
    const usageIngRef = doc(
      db,
      "USAGE_WAIT_PURCHASE_TICKET",
      userRes.data.usage.usageLogId
    );
    const usageEndRef = doc(
      db,
      "USAGE_END_TICKET",
      userRes.data.usage.usageLogId
    );
    // USAGE_WAIT_PURCHASE_TICKET의 데이터를 USAGE_END_TICKET으로 이동
    await setDoc(usageEndRef, {
      usage: {
        ...userRes.data.usage,
        status: "complete",
        purchaseTicketId: purchaseTicketUUID,
        pointTicketId: pointTicketUUID,
        endDate: new Date(),
      },
    });

    // USAGE_WAIT_PURCHASE_TICKET 문서 삭제
    await deleteDoc(usageIngRef);

    // 유저의 포인트 잔액과 usage 데이터 업데이트
    const userRef = doc(db, "USER", userId);

    await updateDoc(userRef, {
      "point.amount": currentPoint - totalAmount,
      "point.lastUpdated": new Date(),
      usage: { ...newUsage.usage },
    });
    const New_userRes = await db_user_read(userId);

    res.status(200).json({
      success: true,
      data: {
        purchaseAmount: userRes.data.usage.totalUsagePrice,
        usageDurationMinutes: userRes.data.usage.totalUsageDurationMinutes,
        selectedPayment: "point",
      },
      userData: New_userRes.data,
    });
    console.log("purchase complete", userId);
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 결제 내역 조회
router.get("/loglist", verifyTokenMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const purchaseLogList = await queryRead(
      "USAGE_END_TICKET",
      "usage.userId",
      userId,
      (a, b) => {
        return b.usage.startTime.seconds - a.usage.startTime.seconds;
      }
    );
    let newPurchaseLogList = purchaseLogList.data.map((item) => {
      return {
        storeUUID: item.usage.storeUUID,
        // description: item.usage.description,
        date:
          firebaseDateToJSDate(item.usage.startTime)
            .toLocaleDateString()
            .replaceAll(" ", "")
            .slice(0, 10) +
          " " +
          firebaseDateToJSDate(item.usage.startTime)
            .toLocaleTimeString("en-GB")
            .slice(0, 5),
        // .slice(),
        changePoint: item.usage.totalUsagePrice,
        // afterPoint: item.afterAmount,
        // isDelete: false,
      };
    });
    // console.log(newPurchaseLogList);
    //empty array?
    if (newPurchaseLogList.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    } else {
      return res.status(200).json({ success: true, data: newPurchaseLogList });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
module.exports = router;
