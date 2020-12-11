const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const wallet = new Schema({
			playerId: {
				type: 'string',
				default: ''
			},
			currencyType: {
				type: 'string',
				default: ''
			},
			amount: {
				type: 'number',
				default: ''
			},
			updatedAt : { type: Date, default: Date.now() },
			createdAt : { type: Date, default: Date.now() }
	},{ collection: 'wallet' });
mongoose.model('wallet', wallet);
 
