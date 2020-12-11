const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const rackHistorySchema = new Schema({
	player: { type: Schema.Types.ObjectId, ref: 'player' },
	//game: { type: Schema.Types.ObjectId, ref: 'game' },
	game: {type: 'string',required: true},
	rackFromId: {type: 'string',required: true},
	rackToId: {type: 'string',required: true},
	rackFrom: {type: 'string',required: true},
	rackTo: {type: 'string',required: true},
	won: {type: 'number',default: ''},
	rackPercent: {type: 'string',required: true},
	totalRack: {type: 'number',required: true},
	gameNumber: {type: 'string',default: '0'},
	rackToAfter_balance: {type: 'number',default: ''},
	rackToBefore_balance: {type: 'number',default: ''
},
	createdAt: { type: Date, default: Date.now() },
	updatedAt: { type: Date, default: Date.now() },
}, { collection: 'rackHistory', versionKey: false });
mongoose.model('rackHistory', rackHistorySchema);
