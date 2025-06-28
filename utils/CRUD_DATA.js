const {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  runTransaction,
  setDoc,
} = require("firebase/firestore");
const { db } = require("../configFiles/firebaseConfig");

async function queryWrite(collectionName, docName, data) {
  try {
    const docRef = doc(db, collectionName, docName);
    const result = await setDoc(docRef, data);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Query error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// 컬렉션에서 userId로 쿼리하는 함수
async function queryRead(collectionName, key, value, sorted) {
  try {
    const q = query(collection(db, collectionName), where(key, "==", value));

    const querySnapshot = await getDocs(q);
    const results = [];

    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    if (sorted) {
      results.sort(sorted);
    }
    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Query error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// 조건 쿼리 함수 (정렬 제외)
async function queryReadWithConditions(collectionName, conditions) {
  try {
    let q = collection(db, collectionName);

    // 조건이 있는 경우에만 where 절 적용
    if (conditions && conditions.length > 0) {
      conditions.forEach((condition) => {
        q = query(
          q,
          where(condition.field, condition.operator, condition.value)
        );
      });
    }

    const querySnapshot = await getDocs(q);
    const results = [];

    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Query error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// 문서 업데이트 함수
async function updateData(collectionName, docId, updateData) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, updateData);

    return {
      success: true,
      data: { id: docId },
    };
  } catch (error) {
    console.error("Update error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// 현랜잭션으로 여러 문서 업데이트
async function updateDataWithTransaction(updates) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      // updates 배열 형태: [{collectionName, docId, updateData}, ...]
      for (const update of updates) {
        const docRef = doc(db, update.collectionName, update.docId);
        transaction.update(docRef, update.updateData);
      }
    });

    return {
      success: true,
      data: { message: "Transaction completed successfully" },
    };
  } catch (error) {
    console.error("Transaction error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// 현재 타임스탬프 생성 유틸리티 함수
function getTimestamp() {
  return Timestamp.now();
}

module.exports = {
  queryRead,
  queryReadWithConditions,
  updateData,
  updateDataWithTransaction,
  getTimestamp,
  queryWrite,
};

// 사용 예시:
// const result = await queryByUserId("COLLECTION_NAME", "USER_ID_VALUE");
