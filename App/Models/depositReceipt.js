const { Schema, model } = require('mongoose');
const depositReceiptSchema = new Schema(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: 'player'
    },
    depositAmount: {
      type: String,
      default: ' '
    },
    receipt: {
      type: String,
      default: ' '
    },
    status: {
      type: String,
      default: 'Pending'
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
  { timestamps: true, collection: 'depositReceipt', versionKey: false }
);
model('depositReceipt', depositReceiptSchema);
