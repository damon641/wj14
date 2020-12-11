const { Schema, model } = require('mongoose');
const acctNumUpdateReqSchema = new Schema(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: 'player'
    },
    title: {
      type: String,
      default: ' '
    },
    description: {
      type: String,
      default: ' '
    },
    accountNumber: {
      type: String,
      required: true
    },
    action: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true, collection: 'acctNumUpdateReq', versionKey: false }
);
model('acctNumUpdateReq', acctNumUpdateReqSchema);
