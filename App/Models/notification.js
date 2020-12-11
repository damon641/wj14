const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const newsSchema = new Schema({
	
	notification: {
		type: 'string',
	},
	
},{ collection: 'notification',versionKey: false  });
mongoose.model('notification', newsSchema);