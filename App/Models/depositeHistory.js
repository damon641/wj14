const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TokenSchema = new Schema({
			userId: {
				type: 'string',
				required: true
			},
			qrcode_url: {
				type: 'string',
				default: ''
			},
			txn_id: {
				type: 'string',
				default: ''
			},
			address: {
				type: 'string',
				default: ''
			},
			status_url: {
				type: 'string',
				default: ''
			},
			amount: {
				type: 'number',
				default: ''
			},
			confirms_needed: {
				type: 'string',
				default: ''
			},
			coin_type: {
				type: 'string',
				default: ''
			},
			coin_value: {
				type: 'string',
				default: ''
			},
			flag: {
				type: 'string',
				default: 'active'
			},
			depositAmount: {
				type: 'number',
				default: ''
			},
			walletsAddress : {
				type : 'string',
				default : ''

			},
			pay_type : {
				type : 'string',
				default : ''
			},
			withdrawId: {
				type : 'string',
				default : ''
			},
			status: {
				type: 'string',
				default : 'pending'
			},
			updatedAt : { type: Date, default: Date.now() },
			createdAt : { type: Date, default: Date.now() }

},{ collection: 'depositeHistory' });
mongoose.model('depositeHistory', TokenSchema);
 