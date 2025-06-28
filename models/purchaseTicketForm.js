/**
 * 결제 기록 정보.
 * @typedef {Object} PurchaseRecord
 * @property {?string} purchaseId - 거래 식별자.
 * @property {?string} userId - 사용자 고유 식별자.
 * @property {?string} storeId - 결제가 이루어진 상점의 식별자.
 * @property {?string} usageLogTicketId - 관련된 사용 기록의 식별자.
 * @property {?number} amount - 결제 금액.
 * @property {?string} paymentMethod - 결제 수단 (예: 신용카드, 페이팔).
 * @property {?string} pointTicketId - 결제 수단 (예: 신용카드, 페이팔).
 * @property {?string} status - 결제 상태 (예: 완료, 취소, 환불).
 * @property {?Date} purchaseDate - 구매 날짜.
 * @property {?Date} refundDate - 환불 날짜 (해당되는 경우).
 */
class PurchaseTicketForm {
  constructor(args) {
    this.userId = args.userId ?? null;
    this.purchaseTicketId = args.purchaseTicketId ?? null;
    this.pointTicketId = args.pointTicketId ?? null;
    this.usageLogTicketId = args.usageLogTicketId ?? null;
    this.userInfo = args.userInfo ?? null;
    this.storeId = args.storeId ?? null;
    this.storeUUID = args.storeUUID ?? null;
    this.amount = args.amount ?? null;
    this.purchaseDate = args.purchaseDate ?? null;
    this.paymentMethod = args.paymentMethod ?? null;
    this.status = args.status ?? null;
    this.refundDate = args.refundDate ?? null;
    this.storeName = args.storeName ?? null;
    this.selectedPayment = args.selectedPayment ?? null;
  }
}

module.exports = PurchaseTicketForm;
