const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const errorReportValidationSchema = new Schema({
    gameNumber: { type: 'string', default: '' },
    gameId: { type: 'string', default: '' },
    roomId: {
      type: 'string',
      default: ''
    }, 
    pot: {
      type: 'number',
      default: 0
    },
    validationType: {
      type: 'string',
      default: ''
    },
    excessAmount: {
      type: 'number',
      default: 0
    },           
    gameTotalChips: { type: 'number', default: '0' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

}, { collection: 'errorReportValidation', versionKey: false });

mongoose.model('errorReportValidation', errorReportValidationSchema);
