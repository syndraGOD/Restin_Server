const { db } = require("../configFiles/firebaseConfig.js");
const {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} = require("firebase/firestore");
const RESForm = require("../models/inPacketForm.js");

const colNamePoint = "POINT_TICKETS";
const colNameRequest = "POINT_REQUEST_TICKETS";

// 포인트 요청 티켓 생성
const db_pointRequest_create = async (pointRequestTicket) => {
  const { pointRequestTicketId } = pointRequestTicket;
  try {
    const ticketRef = doc(db, colNameRequest, pointRequestTicketId);
    await setDoc(ticketRef, pointRequestTicket);
    return new RESForm({
      resultCode: 200,
      data: pointRequestTicket,
    });
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error creating point request ticket",
      error,
    });
  }
};

// 포인트 요청 티켓 조회
const db_pointRequest_read = async (pointRequestTicketId) => {
  try {
    const ticketRef = doc(db, colNameRequest, pointRequestTicketId);
    const ticketSnap = await getDoc(ticketRef);

    if (ticketSnap.exists()) {
      return new RESForm({
        resultCode: 200,
        data: ticketSnap.data(),
      });
    }
    return new RESForm({
      resultCode: 404,
      text: "Point request ticket not found",
    });
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error reading point request ticket",
      error,
    });
  }
};

// 포인트 요청 티켓 업데이트
const db_pointRequest_update = async (pointRequestTicketId, updateData) => {
  try {
    const ticketRef = doc(db, colNameRequest, pointRequestTicketId);
    await updateDoc(ticketRef, updateData);
    return new RESForm({
      resultCode: 200,
    });
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error updating point request ticket",
      error,
    });
  }
};

// 포인트 변동 내역 생성
const db_pointTicket_create = async (pointTicket) => {
  const { pointTicketId } = pointTicket;
  try {
    const ticketRef = doc(db, colNamePoint, pointTicketId);
    await setDoc(ticketRef, pointTicket);
    return new RESForm({
      resultCode: 200,
      data: pointTicket,
    });
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error creating point ticket",
      error,
    });
  }
};

// 유저의 포인트 요청 목록 조회
const db_pointRequest_readByUser = async (userId) => {
  try {
    const ticketColRef = collection(db, colNameRequest);
    const q = query(ticketColRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const tickets = [];
    querySnapshot.forEach((doc) => {
      tickets.push(doc.data());
    });

    return new RESForm({
      resultCode: 200,
      data: tickets,
    });
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error reading user point requests",
      error,
    });
  }
};

module.exports = {
  db_pointRequest_create,
  db_pointRequest_read,
  db_pointRequest_update,
  db_pointTicket_create,
  db_pointRequest_readByUser,
};
