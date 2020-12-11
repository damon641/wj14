const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const rackCapSchema = new Schema({
			stack: {
				type: 'string',
				defaultsTo: 0
			},
			rake: {
				type: 'number',
				defaultsTo: 0
			},
			player2Cap: {
				type: 'number',
				defaultsTo: 0
			},
			player3Cap: {
				type: 'number',
				defaultsTo: 0
			},
			player5Cap: {
				type: 'number',
				defaultsTo: 0
			},
		
	},{ collection: 'rackCap' });
mongoose.model('rackCap', rackCapSchema);
 
