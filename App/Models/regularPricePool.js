const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const regularPricePoolSchema = new Schema({
	
	minPlayers: {
		type: 'number',
		drequired: true
	},
	maxPlayers: {
		type: 'number',
		required: true
	},
	place_1: {
		type: 'number',
		dafault: '0'
	},
	place_2: {
		type: 'number',
		dafault: '0'
	},
	place_3: {
		type: 'number',
		dafault: '0'
	},
	place_4: {
		type: 'number',
		dafault: '0'
	},
	place_5: {
		type: 'number',
		dafault: '0'
	},
	place_6: {
		type: 'number',
		dafault: '0'
	},
	place_7: {
		type: 'number',
		dafault: '0'
	},
	place_8: {
		type: 'number',
		dafault: '0'
	},
	place_9: {
		type: 'number',
		dafault: '0'
	},
	place_10: {
		type: 'number',
		dafault: '0'
	},
	place_11_15: {
		type: 'number',
		dafault: '0'
	},
	place_16_20: {
		type: 'number',
		dafault: '0'
	},
	place_21_27: {
		type: 'number',
		dafault: '0'
	},
	place_28_36: {
		type: 'number',
		dafault: '0'
	},
	place_37_45: {
		type: 'number',
		dafault: '0'
	},
	place_46_63: {
		type: 'number',
		dafault: '0'
	},
	place_64_81: {
		type: 'number',
		dafault: '0'
	},
	place_82_99: {
		type: 'number',
		dafault: '0'
	},
	place_100_126: {
		type: 'number',
		dafault: '0'
	},
	place_127_153: {
		type: 'number',
		dafault: '0'
	},
	place_154_189: {
		type: 'number',
		dafault: '0'
	},
	place_190_225: {
		type: 'number',
		dafault: '0'
	},
	place_226_306: {
		type: 'number',
		dafault: '0'
	},
	place_307_378: {
		type: 'number',
		dafault: '0'
	},
	place_379_450: {
		type: 'number',
		dafault: '0'
	},
	place_451_600: {
		type: 'number',
		dafault: '0'
	},
	place_601_750: {
		type: 'number',
		dafault: '0'
	},
	isFreeRoll: { type: 'boolean', default: 'false'},
	createdAt : { type: Date, default: Date.now() },
	updatedAt : { type: Date, default: Date.now() },
	
},{ collection: 'regularPricePool',versionKey: false  });
mongoose.model('regularPricePool', regularPricePoolSchema);
