const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const promocodeSchema = new Schema({
	name:{
		type: 'string',
		required: true,
	},
	status:{
		type: 'string',
		required: true,
	},
	code: {
		type: 'string',
		required: true,
	},
	image:{
		type: 'string',
		required: true,
	}
},{ collection: 'promocode', versionKey: false });
mongoose.model('Promocode',promocodeSchema);