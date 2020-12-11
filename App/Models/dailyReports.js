const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reportsSchema = new Schema({
	userId: {
		type: 'string',
		default: ''
	},
	username: {
		type: 'string',
		default: ''
	},
	chips: {
		type: 'number',
		default: '0'
	},
	role: {
		type: 'string',
		default: ''
		
	},
	email: {
		type: 'string',
		default: ''
		
	},
	parentId: {
		type: 'string',
		default: ''
	},
	level: {
		type: 'number',
		
	},
	agentId: {
		type: 'string',
		default: ''
		
	},
	agentRole: {
		type: 'string',
		default: ''
	},
	main_chips: {
		type: 'number',
		default: '0'
	},
	rake_chips: {
		type: 'number',
		default: '0'
	},
	createdAt : { type: Date, default: Date.now() },
	updatedAt : { type: Date, default: Date.now() },
	
},{ collection: 'dailyReports',versionKey: false  });
mongoose.model('dailyReports',reportsSchema);
