const express = require("express");
const router = express.Router();
const session = require("express-session");
const path = require("path");
const {
  db_store_create,
  db_store_read,
  db_store_read_all,
  db_store_update,
  db_store_delete,
} = require("../utils/CRUD_storeData");
const {
  queryReadWithOrder,
  updateData,
  getTimestamp,
  queryReadWithConditions,
  queryRead,
} = require("../utils/CRUD_DATA.js");
const { collection, doc, getDoc, setDoc } = require("firebase/firestore");
const { db } = require("../configFiles/firebaseConfig.js");
const { ADMIN_ACCOUNTS } = require("../configFiles/config.js");
const { v4: uuidv4 } = require("uuid");

// admin 라우터에만 세션 미들웨어 적용
router.use(
  session({
    secret: "admin-secret-key",
    resave: false,
    saveUninitialized: false,
    //saveUninitialized: false, 설명
    //혹시 내가 js파일을 수정하고 저장하면 사용자가 가지고 있는 쿠키는? 설명해줘
    //
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60, // 1시간
    },
  })
);

// 정적 파일 제공을 위한 미들웨어 추가
router.use(express.static(path.join(__dirname)));

// 여러 관리자 계정 정보

// 관리자 인증 미들웨어
const adminAuthMiddleware = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.status(401).json({
      success: false,
      message: "관리자 로그인이 필요합니다.",
    });
  }
  next();
};

// 슈퍼관리자 권한 체크 미들웨어
const superAdminAuthMiddleware = (req, res, next) => {
  if (!req.session.isAdmin || req.session.adminInfo.role !== "super") {
    return res.status(403).json({
      success: false,
      message: "슈퍼관리자 권한이 필요합니다.",
    });
  }
  next();
};

// 로그인 처리
router.post("/login", (req, res) => {
  const { adminId, password } = req.body;

  const admin = ADMIN_ACCOUNTS.find(
    (account) => account.adminId === adminId && account.password === password
  );

  if (admin) {
    req.session.isAdmin = true;
    req.session.adminInfo = {
      adminId: admin.adminId,
      name: admin.name,
      role: admin.role,
    };
    res.json({
      success: true,
      adminInfo: {
        name: admin.name,
        role: admin.role,
      },
    });
  } else {
    res.json({
      success: false,
      message: "잘못된 로그인 정보입니다.",
    });
  }
});

// 관리자 인증 확인
router.get("/check-auth", adminAuthMiddleware, (req, res) => {
  res.json({
    success: true,
    adminInfo: req.session.adminInfo,
  });
});

// 스토어 목록 조회
router.get("/stores", adminAuthMiddleware, async (req, res) => {
  try {
    const result = await db_store_read_all();

    if (result.resultCode === 200) {
      res.json({
        success: true,
        stores: result.data,
      });
    } else {
      res.status(result.resultCode).json({
        success: false,
        message: result.text,
        stores: [],
      });
    }
  } catch (error) {
    console.error("Store read error:", error);
    res.status(500).json({
      success: false,
      message: "스토어 목록 조회 실패",
      stores: [],
    });
  }
});

// 개별 스토어 조회
router.get("/stores/:UUID", adminAuthMiddleware, async (req, res) => {
  try {
    const result = await db_store_read(req.params.UUID);
    if (result.resultCode === 200) {
      res.json({
        success: true,
        store: result.data,
      });
    } else {
      res.status(result.resultCode).json({
        success: false,
        message: result.text,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "스토어 조회 실패",
    });
  }
});

// 스토어 생성
router.post("/stores", adminAuthMiddleware, async (req, res) => {
  try {
    // console.log(req.body);
    const result = await db_store_create(req.body);
    if (result.resultCode === 200) {
      res.json({
        success: true,
        message: "스토어가 성공적으로 생성되었습니다.",
      });
    } else {
      console.log(result.text);
      res.status(result.resultCode).json({
        success: false,
        message: result.text,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "스토어 생성 실패",
    });
  }
});

// 스토어 수정
router.put("/stores/:UUID", adminAuthMiddleware, async (req, res) => {
  try {
    const result = await db_store_update(req.params.UUID, req.body);
    if (result.resultCode === 200) {
      res.json({
        success: true,
        message: "스토어가 성공적으로 수정되었습니다.",
      });
    } else {
      res.status(result.resultCode).json({
        success: false,
        message: result.text,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "스토어 수정 실패",
    });
  }
});

// 스토어 삭제
router.delete("/stores/:UUID", adminAuthMiddleware, async (req, res) => {
  try {
    const result = await db_store_delete(req.params.UUID);
    if (result.resultCode === 200) {
      res.json({
        success: true,
        message: "스토어가 성공적으로 삭제되었습니다.",
      });
    } else {
      res.status(result.resultCode).json({
        success: false,
        message: result.text,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "스토어 삭제 실패",
    });
  }
});

// 로그아웃
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// HTML 페이지 라우트
router.get("/", (req, res) => {
  if (req.session.isAdmin) {
    res.sendFile(path.join(__dirname, "./admin_dashboard.html"));
  } else {
    res.sendFile(path.join(__dirname, "./admin_login.html"));
  }
});

// CSS와 JS 파일에 대한 접근 권한 설정
router.get("/admin_dashboard.css", adminAuthMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "admin_dashboard.css"));
});

router.get("/admin_dashboard.js", adminAuthMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "admin_dashboard.js"));
});

// 캐시 컨트롤 설정
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

// 스토어 목록 페이지
router.get("/store-list", adminAuthMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "./admin_store_list.html"));
});

router.get("/store-list.js", adminAuthMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "admin_store_list.js"));
});
router.get("/store-list.css", adminAuthMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "admin_store_list.css"));
});

// 스토어 등록 페이지
router.get("/store-register", adminAuthMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "./admin_store_register.html"));
});

router.get("/store-register.js", adminAuthMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "admin_store_register.js"));
});
router.get("/store-register.css", adminAuthMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "admin_store_register.css"));
});
router.get("/point-request", adminAuthMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "./admin_point_request.html"));
});

// 포인트 충전 요청 목록 조회
router.get("/point-requests", adminAuthMiddleware, async (req, res) => {
  try {
    const conditions = [
      {
        field: "info.status",
        operator: "==",
        value: "pending",
      },
    ];

    const result = await queryReadWithConditions(
      "POINT_REQUEST_TICKET",
      conditions
    );

    if (result.success) {
      // JavaScript로 데이터 정렬
      console.log(result.data);
      const sortedData = result.data.sort((a, b) => {
        const dateA = a.info.requestDate;
        const dateB = b.info.requestDate;
        return dateB - dateA; // 내림차순 정렬
      });

      res.json({
        success: true,
        requests: sortedData,
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error,
      });
      console.log(result.error);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "포인트 충전 요청 목록 조회 실패",
    });
    console.log(error);
  }
});

// 포인트 충전 요청 승인/거부 처리
router.post(
  "/point-requests/:id/:action",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const { id, action } = req.params;
      const currentTime = getTimestamp();
      let updateFields;

      //다시 티켓 조회해서 유저id가져오고, 유저id로 유더 데이터 조회해서 포인트 알아냄
      const request_ticket = (
        await queryRead("POINT_REQUEST_TICKET", "info.pointRequestTicketId", id)
      ).data[0];
      const userId = request_ticket.info.userId;

      if (action === "approve") {
        updateFields = {
          "info.status": "approved",
          "after.approvalDate": currentTime,
          // "after.adminId": req.session.adminInfo.adminId,
          "after.completeDate": currentTime,
          "after.adminMemo": "승인 완료",
        };

        const userDataDoc = doc(collection(db, "USER"), userId);
        const userData = (await getDoc(userDataDoc)).data();
        const totalPoint =
          userData.point.amount +
          request_ticket.charge.chargeAmount *
            (request_ticket.charge.bonusRate + 1);

        const pointTicketId = uuidv4();
        const pointLog = {
          afterAmount: totalPoint,
          amount:
            request_ticket.charge.chargeAmount *
            (request_ticket.charge.bonusRate + 1),
          beforeAmount: userData.point.amount,
          description: "포인트 충전",
          pointTicketId: pointTicketId,
          requestTicket: request_ticket.info.pointRequestTicketId,
          requestDate: new Date(),
          userId: userId,
        };
        const pointLogUpdateResult = await setDoc(
          doc(collection(db, "POINT_TICKET"), pointTicketId),
          pointLog
        );
        const pointUpdateResult = await updateData("USER", userId, {
          "point.amount": totalPoint,
        });
      } else if (action === "reject") {
        updateFields = {
          "info.status": "rejected",
          "cancel.cancelDate": currentTime,
          "cancel.cancelReason": req.body.reason,
          // "after.adminId": req.session.adminInfo.adminId,
          "after.completeDate": currentTime,
          "after.adminMemo": `거부 사유: ${req.body.reason}`,
        };
      }

      // throw new Error("test");

      const result = await updateData("POINT_REQUEST_TICKET", id, updateFields);

      if (result.success) {
        res.json({
          success: true,
          message: `포인트 충전 요청이 ${
            action === "approve" ? "승인" : "거부"
          }되었습니다.`,
        });
        console.log(
          `포인트 충전 요청이 ${
            action === "approve" ? "승인" : "거부"
          }되었습니다.`
        );
      } else {
        console.log(result.error);
        res.status(500).json({
          success: false,
          message: result.error,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "처리 중 오류가 발생했습니다.",
      });
    }
  }
);

// CSS와 JS 파일에 대한 접근 권한 설정에 추가
router.get("/point-request.css", adminAuthMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "admin_point_request.css"));
});

router.get("/point-request.js", adminAuthMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "admin_point_request.js"));
});

module.exports = router;
