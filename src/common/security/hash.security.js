import bcrypt from "bcrypt";
import argon2 from "argon2";

// export const hashed = async ({ plainText, rounds = 12, minor = "b" } = {}) => {
//   const salt = await bcrypt.genSalt(rounds, minor);
//   return await bcrypt.hash(plainText, salt);
// };

// export const compared = async ({ plainText, ciperText } = {}) => {
//   return await bcrypt.compare(plainText, ciperText);
// };

export const hashed = async ({ plainText } = {}) => {
  try {
    const hashedValue = await argon2.hash(plainText, {
      type: argon2.argon2id, //  النوع الموصى به
      memoryCost: 65536, //  استهلاك الذاكرة: 64 ميجابايت (بالكيلوبايت)
      timeCost: 3, //  عدد الدورات عبر الذاكرة
      parallelism: 4, //  عدد المسارات (Threads)
    });
    return hashedValue;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password", { cause: { status: 500 } });
  }
};

export const compared = async ({ ciperText, plainText } = {}) => {
  try {
    // ترجع true إذا كانت كلمة المرور صحيحة، و false إذا كانت خاطئة
    return await argon2.verify(ciperText, plainText);
  } catch (error) {
    console.error("Error verifying password:", error);
    throw new Error("Failed to verify password", { cause: { status: 500 } });
  }
};
