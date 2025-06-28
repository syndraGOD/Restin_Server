class PointTicketForm {
  //해당 form은 point를 사용하거나 충전하거나 환불하거나 등의 모든 기록을 남김
  constructor(args) {
    this.userId = args.userId ?? null;
    this.pointTicketId = args.pointTicketId ?? null;
    this.amount = args.amount ?? null;
    this.requestTicket = args.requestTicket ?? null;
    this.purchaseTicket = args.purchaseTicket ?? null;
    this.beforeAmount = args.beforeAmount ?? null;
    this.afterAmount = args.afterAmount ?? null;
    this.description = args.description ?? null;
    this.requestDate = args.requestDate ?? new Date();
    this.storeUUID = args.storeUUID ?? null;
  }
}
module.exports = PointTicketForm;
