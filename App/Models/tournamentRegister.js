const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tournamentRegisterSchema = new Schema({
        roomId : { type: Schema.Types.ObjectId, ref: 'room' }, // 
        playerId : { type: Schema.Types.ObjectId, ref: 'player' }, // type: Schema.Types.ObjectId, ref: 'player'
},{ collection: 'tournamentRegister', versionKey: false });

mongoose.model('tournamentRegister', tournamentRegisterSchema);