const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingSchema = new Schema({
			defaultChips: {
				type: 'number',
				default: 0
				// required: true
			},
		 	rakePercenage: {
				type: 'number',
				default: 0
				// required: true
			},
			expireTime : {
				type: 'number',
				// required: true
			},
			maintenance:Schema.Types.Mixed,	
			BackupDetails:Schema.Types.Mixed,
			chipsBought: {
				type: 'number',
				default: 0,
			},
			processId: {
				type: 'number',
			    default: 0
			},
			android_version:{
				type: 'number',
				default: 0
			},
			ios_version:{
				type: 'number',
				default: 0
			},
			android_store_link:{
				type: 'string'
			},
			ios_store_link:{
				type: 'string',
			},
			multitable_status:{
				type: 'string',
			},
			systemChips: {
				type: 'number',
				default: 0
			},
			adminExtraRakePercentage:{
				type: 'number',
				default: 0
			},
			
	},{ collection: 'setting' });
mongoose.model('setting', SettingSchema);
 
