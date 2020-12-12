const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CurrencySchema = new Schema({
			currencyCode: {
				type: 'string',
                required: true,
				unique : true,
				uppercase: true
			},
			usdPerUnit: {
				type: 'string',
				required: true
			}
},{ collection: 'currency' });

mongoose.model('currency', CurrencySchema);
 
