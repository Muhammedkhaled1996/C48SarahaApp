import mongoose from "mongoose";
import { GenderEnum, providerEnum } from "./../../common/enum/index.js";

const privilegeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: Number, required: true, unique: true },
});

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minLength: 2, maxLength: 25 },
    lastName: { type: String, required: true, minLength: 2, maxLength: 25 },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return this.provider == providerEnum.SYSTEM;
      },
    },
    confirmPassword: {
      type: String,
      required: function () {
        return this.provider == providerEnum.SYSTEM;
      },
    },
    phone: String,
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    DOB: Date,
    confirmEmail: Date,
    deletedAt: Date,
    image: String,
    coverImage: [String],
    privileges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Privilege",
      },
    ],
    changeCredentialsTime: Date,
    provider: {
      type: Number,
      enum: Object.values(providerEnum),
      default: providerEnum.SYSTEM,
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

userSchema
  .virtual("userName")
  .set(function (value) {
    if (!value || typeof value !== "string") return;
    const [firstName, ...rest] = value.trim().split(" ");
    this.set({
      firstName: firstName || this.firstName,
      lastName: rest.join(" ") || this.lastName || firstName,
    });
  })
  .get(function () {
    return `${this.firstName || ""} ${this.lastName || ""}`.trim();
  });

export const UserPrivilege =
  mongoose.models.Privilege || mongoose.model("Privilege", privilegeSchema);

export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);
