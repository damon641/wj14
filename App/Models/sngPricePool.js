const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sngPricePoolSchema = new Schema({
	
	winner: {
		type: 'string',
		required: true
	},
	firstRunnerUp: {
		type: 'string',
		required: true
	},
	secondRunnerUp: {
		type: 'string',
		required: true
	},

	fr_winner: {
		type: 'string',
		required: false,
		default: 0,
	},
	fr_firstRunnerUp: {
		type: 'string',
		required: false,
		default: 0,
	},
	fr_secondRunnerUp: {
		type: 'string',
		required: false,
		default: 0,
	},
	createdAt : { type: Date, default: Date.now() },
	updatedAt : { type: Date, default: Date.now() },
	
},{ collection: 'sngPricePool' });
mongoose.model('sngPricePool', sngPricePoolSchema);
