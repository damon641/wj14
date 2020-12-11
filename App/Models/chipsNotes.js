const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SocketSchema = new Schema({
    requestById : { type: 'string' }, // chips request by id
    requestToId : { type: 'string' }, // chips request to id
    note : { type: 'string' }, //chips request notes
    type : { type: 'string' } //chips request notes
      
},{ collection: 'chipsnote', versionKey: false });

mongoose.model('chipsNote', SocketSchema);