// @ts-check

/**
 * @typedef {Object} StoreInfo
 * @property {string} [UUID] - 입력X, 고유DB인식코드
 * @property {number} [id] - 가게 고유번호, 1~ 순차적으로증가
 * @property {Object} [signDate] - 수정X, 가게를 Restin에 등록한 날짜
 * @property {string} [name] - 가게 이름
 * @property {string} [storeOwnerName] - store 대표 성함
 * @property {string} [accountHolder] - settlementAccount의 입금자명
 * @property {string} [settlementAccount] - 정산 계좌
 * @property {number} [unitPrice] - 분당 단가
 * @property {string} [location] - 가게 주소
 * @property {Object} [subwayStation] - 지하철역 정보
 * @property {Array<string>} [subwayStation.line1] - 1호선 역 목록
 * @property {Array<Object>} [stationDistance] - 역 출구별 거리 정보 [{ "수원-3번출구": 1 }]
 * @property {Object} [gps] - GPS 좌표
 * @property {string} [gps.Latitude] - 위도
 * @property {string} [gps.longitude] - 경도
 * @property {Object} [businessTime] - 영업시간 정보
 * @property {string} [businessTime.monopen] - 월요일 오픈시간 (ex: "0930")
 * @property {string} [businessTime.monclose] - 월요일 마감시간 (ex: "1800")
 * @property {Array<string>} [businessTime.monbreak] - 월요일 브레이크타임 ["13001500"]
 * @property {string} [businessTime.tueopen] - 화요일 오픈시간
 * @property {string} [businessTime.tueclose] - 화요일 마감시간
 * @property {Array<string>} [businessTime.tuebreak] - 화요일 브레이크타임
 * @property {string} [businessTime.wedopen] - 수요일 오픈시간
 * @property {string} [businessTime.wedclose] - 수요일 마감시간
 * @property {Array<string>} [businessTime.wedbreak] - 수요일 브레이크타임
 * @property {string} [businessTime.thuopen] - 목요일 오픈시간
 * @property {string} [businessTime.thuclose] - 목요일 마감시간
 * @property {Array<string>} [businessTime.thubreak] - 목요일 브레이크타임
 * @property {string} [businessTime.friopen] - 금요일 오픈시간
 * @property {string} [businessTime.friclose] - 금요일 마감시간
 * @property {Array<string>} [businessTime.fribreak] - 금요일 브레이크타임
 * @property {string} [businessTime.satopen] - 토요일 오픈시간
 * @property {string} [businessTime.satclose] - 토요일 마감시간
 * @property {Array<string>} [businessTime.satbreak] - 토요일 브레이크타임
 * @property {string} [businessTime.sunopen] - 일요일 오픈시간
 * @property {string} [businessTime.sunclose] - 일요일 마감시간
 * @property {Array<string>} [businessTime.sunbreak] - 일요일 브레이크타임
 * @property {number} [allowMaxUserCount] - 최대 사용자 수 제한 (0: 제한없음, 1~999: 설정값)
 * @property {boolean} [BusinessState] - true = 기본값, false = 휴폐업 또는 일시정지
 * @property {Array} [BusinessAdminPause] - 설정x 임시휴무일 ["2024.10.11", 기간]
 * @property {string} [ownerCall] - store 대표, 개인 전화번호
 * @property {string} [storeCall] - store 가게 전화번호
 * @property {string} [insta] - 인스타그램 계정 (null 입력시 없음)
 * @property {string} [wifiId] - 와이파이 아이디 (null 입력시 없음)
 * @property {string} [wifiPw] - 와이파이 비밀번호 (null 입력시 없음)
 * @property {string} [toiletManLocation] - 남자 화장실 위치
 * @property {string} [toiletManPw] - 남자 화장실 비밀번호
 * @property {string} [toiletWomanLocation] - 여자 화장실 위치
 * @property {string} [toiletWomanPw] - 여자 화장실 비밀번호
 * @property {Array<string>} [imgURL] - 이미지 URL 목록
 */

class StoreForm {
  /**
   * @param {StoreInfo} args - 가게 정보 객체
   */
  constructor(args) {
    this.UUID = args.UUID ?? null;
    this.id = args.id ?? null;
    this.signDate = args.signDate ?? null;
    this.name = args.name ?? null;
    this.storeOwnerName = args.storeOwnerName ?? null;
    this.accountHolder = args.accountHolder ?? null;
    this.settlementAccount = args.settlementAccount ?? null;
    this.unitPrice = args.unitPrice ?? null;
    this.location = args.location ?? null;
    this.subwayStation = args.subwayStation ?? {};
    this.stationDistance = args.stationDistance ?? {};
    this.gps = {
      Latitude: args.gps?.Latitude ?? null,
      longitude: args.gps?.longitude ?? null,
    };
    this.businessTime = {
      monopen: args.businessTime?.monopen ?? null,
      monclose: args.businessTime?.monclose ?? null,
      monbreak: args.businessTime?.monbreak ?? [],
      tueopen: args.businessTime?.tueopen ?? null,
      tueclose: args.businessTime?.tueclose ?? null,
      tuebreak: args.businessTime?.tuebreak ?? [],
      wedopen: args.businessTime?.wedopen ?? null,
      wedclose: args.businessTime?.wedclose ?? null,
      wedbreak: args.businessTime?.wedbreak ?? [],
      thuopen: args.businessTime?.thuopen ?? null,
      thuclose: args.businessTime?.thuclose ?? null,
      thubreak: args.businessTime?.thubreak ?? [],
      friopen: args.businessTime?.friopen ?? null,
      friclose: args.businessTime?.friclose ?? null,
      fribreak: args.businessTime?.fribreak ?? [],
      satopen: args.businessTime?.satopen ?? null,
      satclose: args.businessTime?.satclose ?? null,
      satbreak: args.businessTime?.satbreak ?? [],
      sunopen: args.businessTime?.sunopen ?? null,
      sunclose: args.businessTime?.sunclose ?? null,
      sunbreak: args.businessTime?.sunbreak ?? [],
    };
    this.allowMaxUserCount = args.allowMaxUserCount ?? 0;
    this.BusinessState = args.BusinessState ?? true;
    this.BusinessAdminPause = args.BusinessAdminPause ?? null;
    this.ownerCall = args.ownerCall ?? null;
    this.storeCall = args.storeCall ?? null;
    this.insta = args.insta ?? null;
    this.wifiId = args.wifiId ?? null;
    this.wifiPw = args.wifiPw ?? null;
    this.toiletManLocation = args.toiletManLocation ?? null;
    this.toiletManPw = args.toiletManPw ?? "비밀번호 없음";
    this.toiletWomanLocation = args.toiletWomanLocation ?? null;
    this.toiletWomanPw = args.toiletWomanPw ?? "비밀번호 없음";
    this.imgURL = args.imgURL ?? [];
  }
}

module.exports = StoreForm;
