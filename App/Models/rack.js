const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const rackSchema = new Schema({
		  	rackAmount: { type: 'string', required: true },
            gameId: { type: 'string', default: '' }, 
            roomId: { type: 'string', default: '' }, 
            createdAt: { type: Date, default: Date.now() },
},{ collection: 'rack' });

mongoose.model('rack', rackSchema);
 

 