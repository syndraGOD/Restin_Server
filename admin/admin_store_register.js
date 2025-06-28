let menuCount = 0;

function addMenuItem() {
  const menuItems = document.getElementById("menuItems");
  const menuItem = document.createElement("div");
  menuItem.className = "menu-item";
  menuItem.innerHTML = `
    <input type="text" name="menu[${menuCount}].name" placeholder="메뉴명">
    <input type="number" name="menu[${menuCount}].price" placeholder="가격">
    <button type="button" onclick="this.parentElement.remove()">삭제</button>
  `;
  menuItems.insertBefore(menuItem, menuItems.lastElementChild);
  menuCount++;
}

// 스토어 목록 로드
async function loadStores() {
  try {
    const response = await fetch("stores", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      cachedStores = data.stores;
      displayStores(data.stores);
    } else {
      console.error("스토어 데이터 로드 실패:", data.message);
    }
  } catch (error) {
    console.error("스토어 로드 실패:", error);
  }
}

// 스토어 목록 표시
function displayStores(stores) {
  const storeList = document.getElementById("storeList");
  if (!stores || stores.length === 0) {
    storeList.innerHTML = "<p>등록된 스토어가 없습니다.</p>";
    return;
  }

  //   <button onclick="deleteStore('${store.UUID}')">삭제</button>
  storeList.innerHTML = stores
    .map(
      (store) => `
    <div class="store-item" id="store-${store.UUID}">
      <div class="store-info">
        <h4>${store.name || "이름 없음"}</h4>
        <p>ID: ${store.id || "N/A"}</p>
        <div class="button-group">
          <button onclick="deleteStore('${store.UUID}')">삭제</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  // 디버깅을 위한 콘솔 출력
  console.log("Loaded stores:", stores);
}

// 역 출구별 거리 정보 관리를 위한 배열
let stationDistances = [];

// 역 출구별 거리 정보 추가 함수
function addStationDistance() {
  const exitNumber = document.querySelector('input[name="exitNumber"]').value;
  const distance = document.querySelector('input[name="distance"]').value;

  if (exitNumber && distance) {
    const distanceInfo = {
      exit: exitNumber,
      distance: parseInt(distance),
    };
    stationDistances.push(distanceInfo);
    updateStationDistanceDisplay();

    // 입력 필드 초기화
    document.querySelector('input[name="exitNumber"]').value = "";
    document.querySelector('input[name="distance"]').value = "";
  }
}

// 역 출구별 거리 정보 표시 업데이트
function updateStationDistanceDisplay() {
  const container = document.getElementById("stationDistanceList");
  container.innerHTML = stationDistances
    .map(
      (item, index) => `
    <div class="station-distance-item">
      <span>${item.exit}번 출구에서 도보 ${item.distance}분</span>
      <button onclick="removeStationDistance(${index})">삭제</button>
    </div>
  `
    )
    .join("");
}

// 역 출구별 거리 정보 삭제
function removeStationDistance(index) {
  stationDistances.splice(index, 1);
  updateStationDistanceDisplay();
}

// 지하철 정보를 저장할 배열
let subwayInfoArray = [];

// 지하철 정보 추가 함수
function addSubwayInfo() {
  const line = document.getElementById("subwayLine").value;
  const station = document.getElementById("subwayStation").value;
  const exit = document.getElementById("exitNumber").value;
  const walkTime = document.getElementById("walkTime").value;

  // 입력값 검증
  if (!line || !station || !exit || !walkTime) {
    alert("모든 지하철 정보를 입력해주세요.");
    return;
  }

  // 새로운 지하철 정보 객체 생성
  const subwayInfo = {
    line,
    station,
    exit,
    walkTime,
  };

  // 배열에 추가
  subwayInfoArray.push(subwayInfo);

  // 화면에 표시
  updateSubwayInfoDisplay();

  // 입력 필드 초기화
  document.getElementById("subwayLine").value = "";
  document.getElementById("subwayStation").value = "";
  document.getElementById("exitNumber").value = "";
  document.getElementById("walkTime").value = "";
}

// 지하철 정보 화면 업데이트 함수
function updateSubwayInfoDisplay() {
  const container = document.getElementById("subwayInfoList");
  container.innerHTML = subwayInfoArray
    .map(
      (info, index) => `
        <div class="subway-info-item">
            <span>${info.line}호선 ${info.station}역 ${info.exit}번 출구 (도보 ${info.walkTime}분)</span>
            <button onclick="removeSubwayInfo(${index})" class="delete-button">삭제</button>
        </div>
    `
    )
    .join("");
}

// 지하철 정보 삭제 함수
function removeSubwayInfo(index) {
  subwayInfoArray.splice(index, 1);
  updateSubwayInfoDisplay();
}

// UUID 생성 함수 추가
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 폼 제출 처리 부분 수정
document
  .getElementById("addStoreForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const storeData = {
      UUID: generateUUID(),
      signDate: new Date().toISOString(),
      imgURL: [],
      businessTime: {
        monopen: null,
        monclose: null,
        monbreak: [],
        tueopen: null,
        tueclose: null,
        tuebreak: [],
        wedopen: null,
        wedclose: null,
        wedbreak: [],
        thuopen: null,
        thuclose: null,
        thubreak: [],
        friopen: null,
        friclose: null,
        fribreak: [],
        satopen: null,
        satclose: null,
        satbreak: [],
        sunopen: null,
        sunclose: null,
        sunbreak: [],
      },
      gps: {},
      subwayStation: {},
      stationDistance: {},
    };

    // 폼 데이터 처리
    for (let [key, value] of formData.entries()) {
      console.log(key, value);

      // businessTime 처리 수정
      if (key.includes("businessTime")) {
        const matches = key.match(
          /businessTime\.(mon|tue|wed|thu|fri|sat|sun)(open|close)/
        );
        if (matches) {
          const [, day, type] = matches;
          storeData.businessTime[day + type] = value || null;
        }
      }
      // GPS 처리
      else if (key.startsWith("gps.")) {
        const coord = key.split(".")[1];
        storeData.gps[coord] = value;
      }
      // ���하철 정보 처리
      //   else if (key === "subwayStation.line1") {
      //     storeData.subwayStation.line1 = value.split(",").map((s) => s.trim());
      //   }
      // BusinessAdminPause 처리
      else if (key === "BusinessAdminPause") {
        storeData[key] = value ? value.split(",").map((s) => s.trim()) : [];
      }
      // 나머지 필드 처리
      else {
        storeData[key] = value;
      }
    }

    // 브레이크타임 처리
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    days.forEach((day) => {
      const breakList = document.getElementById(`${day}-break-list`);
      if (breakList) {
        const breakTimes = Array.from(breakList.getElementsByTagName("input"))
          .filter((input) => input.name.includes("break"))
          .map((input) => input.value)
          .filter((value) => value); // 빈 값 제거
        storeData.businessTime[`${day}break`] = breakTimes;
      }
    });

    // 지하철 정보 처리
    if (subwayInfoArray.length > 0) {
      subwayInfoArray.forEach((info) => {
        const lineKey = `line${info.line}`;
        // 해당 호선이 없으면 배열 초기화
        if (!storeData.subwayStation[lineKey]) {
          storeData.subwayStation[lineKey] = [];
        }
        // 해당 호선의 배열에 역 추가
        storeData.subwayStation[lineKey].push(info.station);

        // 역별 거리 정보 저장
        storeData.stationDistance[info.station] = {
          wayOut: info.exit,
          distance: info.walkTime,
        };
      });
    } else {
      alert("지하철 역 정보를 1세트 이상 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storeData),
      });

      const result = await response.json();
      if (result.success) {
        alert("스토어가 성공적으로 추가되었습니다.");
        loadStores();
        e.target.reset();
      } else {
        alert("스토어 추가 실패: " + result.message);
      }
    } catch (error) {
      console.error("스토어 추가 중 오류 발생:", error);
      alert("스토어 추가 중 오류가 발생했습니다.");
    }
  });

// 스토어 수정 폼 표시
function editStore(UUID) {
  const storeElement = document.getElementById(`store-${UUID}`);
  const storeInfo = storeElement.querySelector(".store-info");
  const store = cachedStores.find((s) => s.UUID === UUID);

  storeInfo.innerHTML = `
    <form onsubmit="saveEdit(event, '${UUID}')">
      <div class="form-group">
        <label>스토어 이름</label>
        <input type="text" name="name" value="${store.name}" required>
      </div>
      <div class="form-group">
        <label>주소</label>
        <input type="text" name="address" value="${store.address}" required>
      </div>
      <div class="form-group">
        <label>전화번호</label>
        <input type="text" name="tel" value="${store.tel}" required>
      </div>
      <div class="form-group">
        <label>카테고리</label>
        <input type="text" name="category" value="${store.category}" required>
      </div>
      <div class="form-group">
        <label>오픈 시간</label>
        <input type="time" name="openTime" value="${store.openTime}" required>
      </div>
      <div class="form-group">
        <label>마감 시간</label>
        <input type="time" name="closeTime" value="${store.closeTime}" required>
      </div>
      <div class="form-group">
        <label>브레이크 타임</label>
        <input type="text" name="breakTime" value="${store.breakTime || ""}">
      </div>
      <div class="form-group">
        <label>라스트 오더</label>
        <input type="time" name="lastOrder" value="${store.lastOrder || ""}">
      </div>
      <div class="form-group">
        <label>휴무일</label>
        <input type="text" name="holiday" value="${store.holiday || ""}">
      </div>
      <div class="form-group">
        <label>주차 가능 여부</label>
        <select name="parking">
          <option value="true" ${store.parking ? "selected" : ""}>가능</option>
          <option value="false" ${
            !store.parking ? "selected" : ""
          }>불가능</option>
        </select>
      </div>
      <div class="form-group">
        <label>메뉴</label>
        <div id="editMenuItems">
          ${store.menu
            .map(
              (item, index) => `
            <div class="menu-item">
              <input type="text" name="menu[${index}].name" value="${item.name}" placeholder="메뉴명">
              <input type="number" name="menu[${index}].price" value="${item.price}" placeholder="가격">
              <button type="button" onclick="this.parentElement.remove()">삭제</button>
            </div>
          `
            )
            .join("")}
          <button type="button" onclick="addEditMenuItem()">메뉴 추가</button>
        </div>
      </div>
      <button type="submit">저장</button>
      <button type="button" onclick="loadStores()">취소</button>
    </form>
  `;
}

// 수정 폼에서 메뉴 추가
function addEditMenuItem() {
  const menuItems = document.getElementById("editMenuItems");
  const menuItem = document.createElement("div");
  menuItem.className = "menu-item";
  menuItem.innerHTML = `
    <input type="text" name="menu.name" placeholder="메뉴명">
    <input type="number" name="menu.price" placeholder="가격">
    <button type="button" onclick="this.parentElement.remove()">삭제</button>
  `;
  menuItems.insertBefore(menuItem, menuItems.lastElementChild);
}

// 수사항 저장
async function saveEdit(event, UUID) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const updateData = {};

  // 기본 필드 처리
  for (let [key, value] of formData.entries()) {
    if (!key.includes("menu")) {
      updateData[key] = value;
    }
  }

  // 메뉴 처리
  updateData.menu = [];
  const menuItems = form.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    const name = item.querySelector('input[placeholder="메뉴명"]').value;
    const price = parseInt(
      item.querySelector('input[placeholder="가격"]').value
    );
    if (name && price) {
      updateData.menu.push({ name, price });
    }
  });

  try {
    const response = await fetch(`stores/${UUID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (data.success) {
      alert("스토어가 수정되었습니다.");
      loadStores();
    }
  } catch (error) {
    console.error("스토어 수정 실패:", error);
  }
}

// 스토어 삭제
async function deleteStore(UUID) {
  if (!confirm("정말 이 스토어 제하시겠습니까?")) return;

  try {
    const response = await fetch(`stores/${UUID}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (data.success) {
      alert("스토어가 삭제되었습니다.");
      loadStores();
    }
  } catch (error) {
    console.error("스토어 삭제 실패:", error);
  }
}

// 초기 로드
let cachedStores = [];
loadStores();

// 브레이크타임 추가 함수 수정
function addBreakTime(button, day) {
  const container = button.closest(".break-time-container");
  const startInput = container.querySelector(".break-start");
  const durationInput = container.querySelector(".break-duration");
  const start = startInput.value;
  const duration = parseInt(durationInput.value);

  if (start && duration) {
    // 시작 시간을 기준으로 종료 시간 계산
    let startHour = parseInt(start.slice(0, 2));
    let startMin = parseInt(start.slice(2));

    // 분 단위로 변환하여 계산
    let totalMinutes = startHour * 60 + startMin + duration;
    let endHour = Math.floor(totalMinutes / 60);
    let endMin = totalMinutes % 60;

    // 24시간 형식으로 변환
    endHour = endHour % 24;

    // 종료 시간을 4자리 문자열로 포맷팅
    const endTime = `${String(endHour).padStart(2, "0")}${String(
      endMin
    ).padStart(2, "0")}`;

    // "시작시간종료시간" 형식으로 저장 (예: "13001500")
    const breakTimeValue = `${start}${endTime}`;

    const breakList = document.getElementById(`${day}-break-list`);
    const breakItem = document.createElement("div");
    breakItem.className = "break-time-item";
    breakItem.innerHTML = `
      <span>${formatTime(start)} - ${formatTime(endTime)}</span>
      <button type="button" onclick="removeBreakTime(this)">삭제</button>
      <input type="hidden" name="businessTime.${day}break[]" value="${breakTimeValue}">
    `;
    breakList.appendChild(breakItem);

    // 입력 필드 초기화
    startInput.value = "";
    durationInput.value = "";
  }
}

// 시간 포맷 함수 수정
function formatTime(time) {
  return `${time.slice(0, 2)}:${time.slice(2)}`;
}

// 브레이크타임 삭제 함수
function removeBreakTime(button) {
  button.closest(".break-time-item").remove();
}

// 영업일/휴무일 토글 함수
function toggleBusinessDay(select) {
  const day = select.dataset.day;
  const hoursDiv = document.getElementById(`${day}-hours`);
  if (select.value === "closed") {
    hoursDiv.style.display = "none";
    // null로 설정
    document.querySelector(`input[name="businessTime.${day}open"]`).value = "";
    document.querySelector(`input[name="businessTime.${day}close"]`).value = "";
    // break 목록 초기화
    document.getElementById(`${day}-break-list`).innerHTML = "";
  } else {
    hoursDiv.style.display = "block";
  }
}
