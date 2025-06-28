const { db } = require("../configFiles/firebaseConfig.js");
const {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  where,
  query,
  getDocs,
  addDoc,
} = require("firebase/firestore");

const colNameING = "USAGE_ING_TICKET";
const colNameWAIT = "USAGE_WAIT_PURCHASE_TICKET";
const colNameEND = "USAGE_END_TICKET";
const {
  firebaseDateToJSDate,
  jsDateToFirebaseDate,
} = require("./firebaseDateConverter.js");
const RESForm = require("../models/inPacketForm.js");
const UsageTicketForm = require("../models/usageTicketForm.js");

const db_usageTicket_create = async (usage) => {
  const { usageLogId } = usage;
  const newUserForm = new UsageTicketForm({
    ...usage,
  });
  const obj_userData = {
    ...newUserForm,
  };
  try {
    const userRef = doc(db, colNameING, usageLogId); //obj_userData.userId);
    await setDoc(userRef, obj_userData);
    console.log("New UsageTicket / code : ", usageLogId);
    return new RESForm({
      resultCode: 200,
    });
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error creating usageTicket",
      error,
    });
  }
};
const db_usageTicket_isuse = async (userId) => {
  const userColRef = collection(db, colNameING);
  const q = query(userColRef, where("usage.userId", "==", userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return new RESForm({
      resultCode: 200,
    });
  } else {
    const usageData = querySnapshot.docs[0].data();
    return new RESForm({
      resultCode: 500,
      data: usageData,
    });
  }
};
const db_usageTicket_end = async (usage) => {
  const { usageLogId } = usage;
  const oldRef = doc(db, colNameING, usageLogId);
  const newRef = doc(db, colNameWAIT, usageLogId);

  const newUsageForm = new UsageTicketForm({
    ...usage,
  });
  const obj_usageData = {
    ...newUsageForm,
  };
  try {
    await setDoc(newRef, obj_usageData);
    try {
      await deleteDoc(oldRef);
      return new RESForm({
        resultCode: 200,
      });
    } catch (error) {
      console.log(2, error);
      return new RESForm({
        resultCode: 500,
        text: error,
      });
    }
  } catch (error) {
    console.log(1, error);
    return new RESForm({
      resultCode: 500,
      text: error,
    });
  }
};
const db_usageTicket_delete = async (colName, ticketNumber) => {};
module.exports = {
  db_usageTicket_create,
  db_usageTicket_delete,
  db_usageTicket_isuse,
  db_usageTicket_end,
};
