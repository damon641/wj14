const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SocketSchema = new Schema({
    playerId : { type: 'string' }, // chips sender player id
    receiverId : { type: 'string' }, // chips receiver player id
    chips : { type: 'string' }, //chips transfer
      
},{ collection: 'chipstransfer', versionKey: false });

mongoose.model('chipsTransfer', SocketSchema);