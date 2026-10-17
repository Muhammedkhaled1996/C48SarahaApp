import { NotFoundException } from "../../common/exceptions/errors.exceptions.js";
import { createOne, deleteOne, find, findById, findOne, paginate } from "../../common/repository/db.repository.js";
import { MessagesModel } from "../../DB/module/messege.model.js";
import { UserModel } from "../../DB/module/user.model.js";

export const createMessage = async ({ content, receiverId } = {}, files = {}, user = undefined) => {
  const checkReciverExists = await findById({ model: UserModel, id: receiverId });

  if (!checkReciverExists) {
    throw NotFoundException({ message: "Invalid reciverId" });
  }

  const message = await createOne({
    model: MessagesModel,
    data: { content, receiverId, attachments: files.map((ele) => ele.path), ...(user ? { senderId: user._id } : {}) },
  });
  return message;
};

export const getAllMessages = async (user, { type, key, page, limit } = {}) => {
  let filter = {};

  switch (type) {
    case "0":
      filter = {
        receiverId: user._id,
      };
      break;
    case "1":
      filter = {
        senderId: user._id,
      };
      break;
    case "2":
      filter = {
        $or: [{ receiverId: user._id }, { senderId: user._id }],
      };
      break;
  }

  if (key && key.trim().length > 0) {
    filter.content = { $regex: key.trim(), $options: "i" };
  }

  const messages = await paginate({
    model: MessagesModel,
    filter,
    limit,
    page,
  });

  if (!messages) {
    throw NotFoundException({ message: "no messages found" });
  }

  return messages;
};

export const deleteMesssage = async (user, { messageId }) => {
  const data = await deleteOne({ model: MessagesModel, filter: { _id: messageId, receiverId: user._id } });

  if (!data.deletedCount) {
    throw NotFoundException({ message: "Invalid message id" });
  }
  return data;
};

export const getMessageById = async (user, { messageId }) => {
  const data = await findOne({ model: MessagesModel, filter: { _id: messageId, receiverId: user._id } });

  if (!data) {
    throw NotFoundException({ message: "Invalid message id" });
  }
  return data;
};
