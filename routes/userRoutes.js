const {
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  collection,
  query,
  where,
  Timestamp,
  runTransaction,
} = require("firebase/firestore");
const { db } = require("../configFiles/firebaseConfig.js");
const { verifyTokenMiddleware } = require("../controllers/auth.js");
const {
  usage_isUsing,
  usage_start,
  usage_stop,
} = require("../controllers/usage.js");

const express = require("express");
const router = express.Router();

router.use(verifyTokenMiddleware);

router.post("/usage/start", usage_start, (req, res) => {
  res.status(200).json({ message: "user start usage", data: req.userData });
});
router.post("/usage/stop", usage_stop, (req, res) => {
  res.status(200).json({ message: "user stoped usage", data: req.userData });
});
router.post("/usage/isUsage", usage_isUsing, (req, res) => {
  res.status(200).json({
    message: `user is usage !${req.startTime}!`,
    startTime: req.startTime,
  });
});
router.post("/usage/storeUsageCount", async (req, res) => {
  const { storeInfo } = req.body;
  const { uuid } = storeInfo;
  const storeDocRef = doc(db, "STORE", uuid);
  const storeDocSnap = await getDoc(storeDocRef);
  if (!storeDocSnap.exists()) return;
  let snapData = storeDocSnap.data();
  const storeAllowMaxCount = Number(snapData.allowMaxUserCount);
  q = query(
    collection(db, "USAGE_ING_TICKET"),
    where("usage.storeUUID", "==", uuid)
  );
  const querySnapshot = await getDocs(q);
  let storeCurrentUsageCount = 0;
  querySnapshot.forEach((doc) => storeCurrentUsageCount++);
  res.status(200).json({
    storeAllowMaxCount,
    storeCurrentUsageCount,
  });
});
router.put("/userdata", async (req, res) => {
  try {
    const { userId } = req;
    const { nick } = req.body;
    const docRef = doc(db, "USER", userId);
    await updateDoc(docRef, { "profile.nick": nick });
    res.status(200).json({ message: "user data update complete" });
    console.log("complete");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "user data update failed" });
  }
});
router.delete("/userdata", async (req, res) => {
  try {
    const { userId } = req;
    const docRef = doc(db, "USER", userId);
    await deleteDoc(docRef);
    res.status(200).json({ message: "user data update complete" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "user data update failed" });
  }
});
module.exports = router;
