const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PlayerSchema = new Schema({
	uniqId : {
		type : 'string',
		required : true
	},
	device_id: {
		type: 'string',
		required: true
	},
	appid: {
		type: 'string',
		default: ''
	},
	
	latitude:{
		type: 'number',
		default: 0.0
	},
	longitude:{
		type: 'number',
		default: 0.0
	},
	
	username: {
		type: 'string',
		default: ''
		//required: true
	},
	firstname: {
		type: 'string',
		default: ''
		// required: true
	},
	lastname: {
		type: 'string',
		default: ''
		// required: true
	},
	profilePic: {
		type: 'number',
		default: 0
	},
	isFb: {
		type: 'boolean',
		default: false
		//required: true
	},
	profilePicId: {
		type: 'number',
		default: 0
		// required: true
	},
	fbProfileUrl: {
		type: 'string',
		default: ''
		// required: true
	},
	email: {
		type: 'string',
		default: ''
	},
	password: {
		type: 'string',
		default: ''
	},
	mobile: {
		type: 'number',
		default: ''
		// required: true
	},
	gender: {
		type: 'string',
		default: ''
		// required: true
	},
	chips: {
		type: 'number',
		required: true
	},
	activationCode: {
		type: 'string',
		default: ''
	},
	status: {
		type: 'string',
		default: 'active'
	},
	sessionId: {
		type: 'string',
		default: ''
	},
	socketId: {
		type: 'string',
		default: ''
	},
	rating: {
		type: 'number',
		default: 0
	},
	isBot: {
		type: 'boolean',
		default: false
	},
	isCash: {
		type: 'boolean',
		default: true
	},
	agentRole:{
		type:'string',
	},
	agentId: {
		type:'string',
	},
	seniorAgentId: {
		type:'string',
		default: ''
	},
	masterAgentId: {
		type:'string',
		default: ''
	},
	isLatest: {
		type:'string',
		default:'0',
	},
	statistics:{
		type: 'object',
	},
	fcmId: {
		type: 'string',
	},
	platform_os: {
		type: 'string',
		default: 'other'
	},
	accountNumber: {
		type: 'string',
		default: ''
	},
	HTMLToken: {
		type: String,
		default: null
	},
	loginToken: {
		type: 'string',
		default: null
	}, // For checking the player is loggedin or not and also for preventing old login
	identifiertoken: {
		type: 'string',
		default: ''
	}, // For identifying player from token in logging in via web to webgl
	updatedAt : { type: Date, default: Date.now() },
	createdAt : { type: Date, default: Date.now() }
},{ collection: 'player',versionKey: false });

mongoose.model('player', PlayerSchema);