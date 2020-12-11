const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const agentSchema = new Schema({
	
	username: {
		type: 'string',
		required: true
	},
	password: {
		type: 'string',
		required: true
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
		type: 'string',
		default: ''
	},
	email: {
		type: 'string',
		default: ''
	},
	
	mobile: {
		type: 'number',
		default: ''
		
	},
	commission: {
		type: 'string',
		default: '0%'
	},
	status: {
		type: 'string',
		default: 'Block'
	},
	parentId :{
		type: 'string', 
		default: '',
	},
	level:{
		type:'string',
	},
	role:{
		type:'string',
		default:''
	},
	chips: {
		type: 'number',
		default: 0
	},
	temp_chips: {
		type: 'number',
		default: 0
	},
	rake_chips:{
		type: 'number',
		default: 0
	},
	isTransferAllow:{
		type:Boolean,
		default:true // false we can not transfer chips  true we can tranfer chips
	},
	temp_chips_checkbox:{
		type:Boolean,
		default:false // false means amount not add in main balance true means will be add clone job
	},
	isTransfer:{
		type:Boolean,
		default:true // false we can not transfer chips  true we can tranfer chips
	},
	parentObjectId:{
		type: Schema.Types.ObjectId,
		allowNull: true
	},
	createdAt : { type: Date, default: Date.now() },
	updatedAt : { type: Date, default: Date.now() },
	
},{ collection: 'agent',versionKey: false  });

agentSchema.pre('save', async function(next) {
	if(this.parentId){
		this.parentObjectId = mongoose.Types.ObjectId(this.parentId);
	}
	next();
});


mongoose.model('Agent', agentSchema);
