// @ts-check
/**
 * Firebase Timestamp object format.
 * @typedef {Object} FirebaseDateObject
 * @property {number} seconds - UTC seconds since epoch (1970-01-01T00:00:00Z).
 * @property {number} nanoseconds - Fractional seconds in nanoseconds.
 */

/**
 * 사용자 이용 시간 정보.
 * @typedef {Object} UserUsage
 * @property {?string} userId - 사용자 고유 식별자.
 * @property {?string} usageLogId - 사용 기록 식별자.
 * @property {?FirebaseDateObject} startTime - 시작 시간.
 * @property {?FirebaseDateObject} endTime - 종료 시간.
 * @property {?number} totalUsageDuration - 총 사용 시간 (초).
 * @property {?string} purchaseTicketId - 결제 티켓 식별자.
 * @property {?number} storeId - 결제 티켓 식별자.
 * @property {?string} storeUUID - 결제 티켓 식별자.
 */

/**
 * 사용자 이용 시간 정보를 관리하는 클래스.
 */
class UsageTicketForm {
  /**
   * @param {Partial<UserUsage>} usage - 사용자 이용 시간 정보.
   */
  constructor(usage = {}) {
    /**
     * @type {UserUsage}
     */
    this.usage = {
      userId: usage.userId ?? null,
      usageLogId: usage.usageLogId ?? null,
      startTime: usage.startTime ?? null,
      endTime: usage.endTime ?? null,
      totalUsageDuration: usage.totalUsageDuration ?? null,
      storeId: usage.storeId ?? null,
      storeUUID: usage.storeUUID ?? null,
      purchaseTicketId: usage.purchaseTicketId ?? null,
    };
  }
}

module.exports = UsageTicketForm;
