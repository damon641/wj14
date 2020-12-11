const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const newsSchema = new Schema({
	
	title: {
		type: 'string',
		required: true
	},
	shortDesc: {
		type: 'string',
		required: true
	},
	longDesc: {
		type: 'string',
		required: true
	},
	
	createdAt : { type: Date, default: Date.now() },
	updatedAt : { type: Date, default: Date.now() },
	
},{ collection: 'news',versionKey: false  });
mongoose.model('News', newsSchema);
