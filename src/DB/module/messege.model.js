import mongoose from "mongoose";

const messegeSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: function () {
        return this.attachments?.length > 0 ? false : true;
      },
      minLength: 2,
      maxLength: 50000,
    },
    attachments: [String],
    receiverId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    autoIndex: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const MessagesModel = mongoose.models.Messages || mongoose.model("Messages", messegeSchema);
