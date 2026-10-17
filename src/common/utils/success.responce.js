export const successResponce = ({
  res,
  message = "done",
  data = undefined,
  status = 200,
} = {}) => {
  return res.status(status).json({ message, status, data });
};
