const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AddVideoSchema = new Schema({
    name: {
        type: 'string',
        required: true
    },
    video_name: {
        type: 'string',
        required: true
    },
    chips: {
        type: 'number'
    },
    status: {
        type: 'string',
        required: true
    },
}, { collection: 'addvideo' });
mongoose.model('addvideo', AddVideoSchema);