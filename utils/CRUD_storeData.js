const { db, storage } = require("../configFiles/firebaseConfig.js");
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
const { ref, getDownloadURL, listAll } = require("firebase/storage");
const StoreForm = require("../models/storeDataForm.js");
const RESForm = require("../models/inPacketForm.js");
// const { getImgList, getImg } = require("./storage");

const colName = "STORE";
let cachedStoreData = []; // 캐시된 스토어 데이터
let lastFetchTime = null; // 마지막 데이터 갱신 시간

// 스토어 데이터 새로고침 함수
const fetchStoreDataWithImages = async () => {
  try {
    const storeCollectionRef = collection(db, colName);
    const querySnapshot = await getDocs(storeCollectionRef);

    if (querySnapshot.empty) {
      console.log("No stores found");
      cachedStoreData = [];
      return;
    }

    const storesData = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        try {
          const pathRef = ref(storage, `StoreImage/store(${data.id})`);
          const imageList = await listAll(pathRef);
          const imageURLs = await Promise.all(
            imageList.items.map((item) => getDownloadURL(item))
          );
          return { ...data, imgURL: imageURLs };
        } catch (error) {
          console.error(`Error fetching images for store ${data.id}:`, error);
          return { ...data, imgURL: [] };
        }
      })
    );

    cachedStoreData = storesData;
    lastFetchTime = new Date();
    console.log("Store data cache refreshed at:", lastFetchTime);
    // console.log(cachedStoreData);
  } catch (error) {
    console.error("Error fetching store data:", error);
    cachedStoreData = [];
  }
};

// 서버 시작 시 초기 데이터 로드
fetchStoreDataWithImages();

// 1분마다 데이터 새로고침
setInterval(fetchStoreDataWithImages, 30 * 60 * 1000);

// 스토어 읽기 함수 (non-query) - 캐시 사용
const db_store_read = async (UUID) => {
  try {
    const storeData = cachedStoreData.find((store) => store.UUID === UUID);
    if (storeData) {
      return new RESForm({
        resultCode: 200,
        text: "Store retrieved successfully",
        data: storeData,
      });
    } else {
      return new RESForm({
        resultCode: 404,
        text: "Store not found",
      });
    }
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error retrieving store",
      error,
    });
  }
};

// 쿼리 기반 스토어 읽기 함수 - 캐시 사용
const db_store_read_query = async (fieldName, value) => {
  try {
    const storeData = cachedStoreData.find(
      (store) => store[fieldName] === value
    );
    if (storeData) {
      return new RESForm({
        resultCode: 200,
        text: "Store(s) found successfully",
        data: storeData,
      });
    } else {
      return new RESForm({
        resultCode: 404,
        text: "No store found with the specified field and value",
        data: null,
      });
    }
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error reading store data",
      data: null,
      error,
    });
  }
};

// 모든 스토어 데이터 읽기 함수 - 캐시 사용
const db_store_read_all = async () => {
  try {
    if (cachedStoreData.length > 0) {
      return new RESForm({
        resultCode: 200,
        text: "All stores retrieved successfully",
        data: cachedStoreData,
      });
    } else {
      return new RESForm({
        resultCode: 404,
        text: "No stores found",
        data: [],
      });
    }
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error retrieving stores",
      error,
    });
  }
};

// 스토어 생성 함수 - 캐시 갱신 포함
const db_store_create = async (storeData) => {
  try {
    // 모든 스토어 데이터를 가져와서 최대 id 값을 찾음
    const allStoresResult = await db_store_read_all();
    let maxId = 0;

    if (allStoresResult.resultCode === 200 && allStoresResult.data.length > 0) {
      maxId = Math.max(...allStoresResult.data.map((store) => store.id || 0));
    }

    // storeData에 새로운 id 할당
    const newStoreData = {
      ...storeData,
      id: maxId + 1,
    };

    const newStoreForm = new StoreForm({
      ...newStoreData,
    });
    const obj_storeData = {
      ...newStoreForm,
    };
    // console.log(storeData);
    // console.log(newStoreData);
    // console.log(newStoreForm);
    console.log(obj_storeData);
    const storeRef = doc(db, colName, obj_storeData.UUID);
    await setDoc(storeRef, obj_storeData);
    await fetchStoreDataWithImages(); // 캐시 갱신
    console.log("New Store Created / name : ", obj_storeData.name);
    return new RESForm({
      resultCode: 200,
      text: "Store created successfully",
    });
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: error,
      error,
    });
  }
};

// 스토어 업데이트 함수 - 캐시 갱신 포함
const db_store_update = async (UUID, storeData) => {
  try {
    const storeRef = doc(db, colName, UUID);
    await updateDoc(storeRef, storeData);
    await fetchStoreDataWithImages(); // 캐시 갱신
    return new RESForm({
      resultCode: 200,
      text: "Store updated successfully",
    });
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error updating store",
      error,
    });
  }
};

// 스토어 삭제 함수 - 캐시 갱신 포함
const db_store_delete = async (UUID) => {
  try {
    const storeRef = doc(db, colName, UUID);
    await deleteDoc(storeRef);
    await fetchStoreDataWithImages(); // 캐시 갱신
    return new RESForm({
      resultCode: 200,
      text: "Store deleted successfully",
    });
  } catch (error) {
    return new RESForm({
      resultCode: 500,
      text: "Error deleting store",
      error,
    });
  }
};

module.exports = {
  db_store_create,
  db_store_read,
  db_store_read_query,
  db_store_read_all,
  db_store_update,
  db_store_delete,
};
