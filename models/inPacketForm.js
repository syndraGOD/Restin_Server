class RESForm {
  constructor({ resultCode = null, text = null, data = null, error = null }) {
    this.resultCode = resultCode;
    this.text = text;
    this.data = data;
    this.error = error;
  }
}
module.exports = RESForm;
