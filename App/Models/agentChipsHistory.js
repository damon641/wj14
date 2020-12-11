const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const agentChipSchema = new Schema({
	agent_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Agent'
	},
	transfer_chips:{
		type: 'number'	
	},
	temp_chips:{
		type: 'number'	
	},
	main_chips: {
		type: 'number'
	},
	update_chips: {
		type: 'number'
	},
	type: {
		type: 'string'
	},
	
	createdAt : { type: Date, default: Date.now() },
	updatedAt : { type: Date, default: Date.now() },
	
},{ collection: 'agentChipsHistory',versionKey: false  });
mongoose.model('agentChipsHistory', agentChipSchema);
