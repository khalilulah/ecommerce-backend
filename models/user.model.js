import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "enter a name"],
    },
    email: {
      type: String,
      required: [true, " enter an email"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "please fill avalid email address"],
    },
    password: {
      type: String,
      required: [true, "enter a password"],
      minLength: 6,
    },
    cartItems: [
      {
        quantity: {
          type: Number,
          default: 1,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  { timestamps: true }
);

//hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};
const User = mongoose.model("commerceUser", userSchema);
export default User;
