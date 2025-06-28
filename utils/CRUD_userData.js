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
} = require("firebase/firestore");
const UserForm = require("../models/userDataForm.js");
const RESForm = require("../models/inPacketForm.js");

const colName = "USER";
const {
  firebaseDateToJSDate,
  jsDateToFirebaseDate,
} = require("./firebaseDateConverter.js");

// 사용자 생성 함수
const db_user_create = async (userData) => {
  const newUserForm = new UserForm({
    ...userData,
  });
  const obj_userData = {
    ...newUserForm,
  };
  try {
    const userRef = doc(db, colName, obj_userData.userId); //obj_userData.userId);
    await setDoc(userRef, obj_userData);
    console.log("New User Created / nick : ", obj_userData.profile.nick);
    return new RESForm({
      resultCode: 200,
      text: "User created successfully",
    });
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error creating user",
      error,
    });
  }
};

// 사용자 읽기 함수 (non-query)
const db_user_read = async (userId) => {
  try {
    const userRef = doc(db, colName, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return new RESForm({
        resultCode: 200,
        text: "User retrieved successfully",
        data: userSnap.data(),
      });
    } else {
      return new RESForm({
        resultCode: 404,
        text: "User not found",
      });
    }
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error retrieving user",
      error,
    });
  }
};

// 쿼리 기반 사용자 읽기 함수
const db_user_read_query = async (fieldName, value) => {
  try {
    const userCollectionRef = collection(db, colName);
    const q = query(userCollectionRef, where(fieldName, "==", value));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs.map((doc) => doc.data());
      // console.log(82, userData);
      // 여기에 비활성화된 유저는 검색 안되게 추가
      return new RESForm({
        resultCode: 200,
        text: "User(s) found successfully",
        data: userData[0].userId,
      });
    } else {
      return new RESForm({
        resultCode: 404,
        text: "No user found with the specified field and value",
        data: null,
      });
    }
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error reading user data",
      data: null,
      error,
    });
  }
};

// 사용자 업데이트 함수
const db_user_update = async (userId, userData) => {
  try {
    const userRef = doc(db, colName, userId);
    await updateDoc(userRef, userData);
    return new RESForm({
      resultCode: 200,
      text: "User updated successfully",
    });
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error updating user",
      error,
    });
  }
};

// 사용자 삭제 함수
const db_user_delete = async (userId) => {
  try {
    const userRef = doc(db, colName, userId);
    await deleteDoc(userRef);
    return new RESForm({
      resultCode: 200,
      text: "User deleted successfully",
    });
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error deleting user",
      error,
    });
  }
};

// let a;

// a = db_user_create({ userId: "Asd", profile: { name: "hello" } });
// a = db_user_update("hanwol", {
//   "profile.name": "hello",
//   "address.addressId": "test",
// });
// a = db_user_delete("hanwol");
// a.then((result) => {
//   console.log(result);
//   process.exit(1);
// });

module.exports = {
  db_user_create,
  db_user_read,
  db_user_read_query,
  db_user_update,
  db_user_delete,
};
