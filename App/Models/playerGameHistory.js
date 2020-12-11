const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const playerGameSchema = new Schema({
	player  : { type: Schema.Types.ObjectId, ref: 'player' },
    // game  : { type: Schema.Types.ObjectId, ref: 'game' },
    room  : { type: Schema.Types.ObjectId, ref: 'room' },
    isTournament: { type: 'boolean', required: true },
    tournamentType: { type: 'string', required: true }, // sng/regular
    tournament: { type: 'string', required: true }, // Tournament ID if is Tournament
    type: { type: 'string', required: true }, // texas/omaha
	status : { type: 'string', required: true }, // running/finished
	
	createdAt : { type: Date, default: Date.now() },
	updatedAt : { type: Date, default: Date.now() },
	
},{ collection: 'playerGameHistory',versionKey: false  });
mongoose.model('playerGameHistory', playerGameSchema);
