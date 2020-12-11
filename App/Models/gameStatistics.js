const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const gameStatisticsSchema = new Schema({
	game: {
		type: Schema.Types.ObjectId,
		ref: 'game',
	},
	player:{
		type: Schema.Types.ObjectId,
		ref: 'player'
	},
	result: {   // won or lost
		type: 'string',
		required: true,
	},
	chips: {
		type: 'string',
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	}
},{collection: 'gameStatistics', versionKey: false});
	
mongoose.model('gameStatistics', gameStatisticsSchema);