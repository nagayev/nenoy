//See docs in DOCS.MD
type ErrorsType = {
  BUSY_LOGIN: number;
  INVALID_LOGIN: number;
  INVALID_TOKEN: number;
};
const errors: ErrorsType = {
  BUSY_LOGIN: 0,
  INVALID_LOGIN: 1,
  INVALID_TOKEN: 2,
};
export { errors };
