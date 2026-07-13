import mongoose from 'mongoose';
const { Schema } = mongoose;

const eventSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  imageUrl: String,
  imagePublicId: String,
  eventLoc: {
    type: String,
    required: true
  },
  whatsappLink: {
    type: String,
    required: false
  },
  eventDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
