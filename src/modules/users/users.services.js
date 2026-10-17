import { UserModel } from "./../../DB/module/user.model.js";
import { NotFoundException } from "./../../common/exceptions/index.js";

export const Profile = (user) => {
  return user;
};

export const update = async (user, { userName }) => {
  const existingUser = await UserModel.findById(user.id);

  if (!existingUser) {
    throw NotFoundException("user not found");
  }

  existingUser.userName = userName;
  await existingUser.save();

  return existingUser;
};
