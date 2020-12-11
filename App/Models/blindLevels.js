const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const blindLevelsSchema = new Schema({
			blindLevelName: {
				type: 'string',
				required: true
			},
			blindLevels :{
				type: 'array',
			},
},{ collection: 'blindLevels' });

mongoose.model('blindLevels', blindLevelsSchema);
 
