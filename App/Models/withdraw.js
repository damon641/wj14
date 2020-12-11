const { Schema, model } = require('mongoose');
const withdrawSchema = new Schema(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: 'player'
    },
    withdrawAmount: {
      type: String,
      default: ' '
    },
    status: {
      type: String,
      default: 'Pending'
    },
    remainingChips: {
      type: Number,
      default: 0
    },
    seen: {
      type: Boolean,
      default: false
    },
    action: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true, collection: 'withdraw', versionKey: false }
);
model('withdraw', withdrawSchema);
