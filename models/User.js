import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    telephone: { type: String, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
    idNumber: { type: String, trim: true },
    filmsFavoris: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Film' }],
    isActive: { type: Boolean, default: true },
    refreshTokenVersion: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpire: { type: Date, select: false },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
