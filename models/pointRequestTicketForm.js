class PointRequestTicketForm {
  constructor(args) {
    this.info = {
      userId: args.userId ?? null,
      pointRequestTicketId: args.pointRequestTicketId ?? null,
      requestDate: args.requestDate ?? null,
      status: args.status ?? null, //cancel or pending or complete
    };
    //밑에는 승인 후
    this.after = {
      approvalDate: args.approvalDate ?? null,
      userNewAmount: args.userNewAmount ?? null,
      adminId: args.adminId ?? null,
      adminMemo: args.adminMemo ?? null,
      completeDate: args.completeDate ?? null,
    };
    //취소 요청
    this.cancel = {
      cancelDate: args.cancelDate ?? null,
      cancelReason: args.cancelReason ?? null,
    };
    this.charge = {
      chargeAmount: args.chargeAmount ?? null,
      bonusRate: args.bonusRate ?? null,
    };
  }
}
module.exports = PointRequestTicketForm;
