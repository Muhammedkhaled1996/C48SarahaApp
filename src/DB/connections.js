import mongoose from "mongoose";
import { DB_URI } from "../config.js";
import { MessagesModel, UserModel } from "./module/index.js";
import { connectRedis } from "./redis.connection.js";

export const bootstrapDB = async (app, port) => {
  try {
    await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 30000 });
    console.log(`DB Connected Successfully ❤️`);
    await UserModel.syncIndexes();
    await MessagesModel.syncIndexes();
    await connectRedis()
    app.listen(port, () => {
      console.log(`server starting in port ${port} 👌`);
    });
  } catch (error) {
    console.log(error);
    console.log(`Fail To Connect in DB 😢`);
  }
};
