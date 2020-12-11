const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const playerCashTransactionSchema = new Schema({
	playerId           : { type: 'string', required: true },
      chips              : { type: 'string' },
      cash              : { type: 'string', required: true },
      message            : { type: 'string', required: true },                     
      transactionNumber : { type: 'string' },
      beforeBalance      : { type: 'string' },                   
      afterBalance      : { type: 'string' },
      status           : { type: 'string', required: true },
	createdAt  		: { type : Date, default : Date.now }

},{ collection: 'playerCashTransaction',versionKey: false });

mongoose.model('playerCashTransaction', playerCashTransactionSchema);
