//See docs in DOCS.MD
export {};
type ErrorsType = {
  BUSY_LOGIN: number;
  INVALID_LOGIN: number;
  INVALID_TOKEN: number;
  VOTE: number;
};
const errors: ErrorsType = {
  BUSY_LOGIN: 0,
  INVALID_LOGIN: 1,
  INVALID_TOKEN: 2,
  VOTE:3
};
module.exports = errors;
