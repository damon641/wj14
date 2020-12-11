const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: {
    type: 'string',
    required: true
  },
  email: {
    type: 'string',
    required: true
  },
  role: {
    type: 'string',
    required: true
  },
  password: {
    type: 'string',
    required: true
  },
  avatar: {
    type: 'string'
  },
  status: {
    type: 'string',
    defaultsTo: 'active'
  },
  resetPasswordToken:{
    type:'string',
  },
  resetPasswordExpires:{
    type:'string',
  },
  status: {
    type: 'string',
    default: 'active'
  },
  chips: {
    type: 'number',
    default: 10000000
  },
  temp_chips: {
    type: 'number'
  },
  rake_chips: {
    type: 'number',
    default :0
  },
  isTransferAllow:{
    type: 'boolean',
    default :true
  },
  isSuperAdmin:{
    type: 'boolean',
    default :false
  },
  extraRakeChips: {
    type: 'number',
    default :0
  },
},{ collection: 'user' });
mongoose.model('user', UserSchema);
