import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  passHash: {
    type: String,
    required: true,
    select: false
  },
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
