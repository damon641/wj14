const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const InAppPurchaseSchema = new Schema({
		in_app_purchase_id: {
                type: 'string',
                required: true
            },
            title:{
            	type: 'string',
            	required: true
            },
            description:{
            	type: 'string',
            	required: true
            },
		price: {
            	type: 'number',
            	required: true
            },
            chips: {
				type: 'number',
				required: true
            },
            purchase_type: {
				type: 'string',
				required: true
            },
            start_date: {
				type: Date,
				required: true
		},
		end_date: {
			type: Date,
			required: true
		},
            image: {
            	type: 'string',
            	required: true,
            },
            status: {
                  type: 'string',
            },
            createdAt : { type: Date, default: Date.now() },
            updatedAt : { type: Date, default: Date.now() },
	},{ collection: 'inAppPurchase',versionKey: false  });
mongoose.model('inAppPurchase', InAppPurchaseSchema);
 
