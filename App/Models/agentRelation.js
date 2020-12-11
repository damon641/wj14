const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const agentRelationSchema = new Schema({
	
	parentId :{
		type: Schema.Types.ObjectId, 
		ref: 'Agent'
	},
	childId:{
		type: Schema.Types.ObjectId, 
		ref: 'Agent'
	},
	isAdmin:{
		type: 'string',
	},
	level:{
		type:'string',
	},
	role:{
		type:'string',
		default:''
	},
	createdAt : { type: Date, default: Date.now() },
	updatedAt : { type: Date, default: Date.now() },
	
},{ collection: 'agentRelation' ,versionKey: false });
mongoose.model('AgentRelation', agentRelationSchema);
