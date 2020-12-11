'use strict';

const mongoose = require('mongoose');
var Sys = require('../../../Boot/Sys');
const Model  = mongoose.model('playerCashTransaction');


module.exports = {

  	insertData: async function(data){
        try {
          	return await Model.create(data);
        } catch (e) {
          	console.log("Error",e);
          	throw new Error('error in insertData'+ e.message);
        }
	},

	getCount: async function(data){
	  try {
	        return  await Model.countDocuments(data);
	      } catch (e) {
	        console.log("Error",e);
	        throw new Error('error in getCount'+ e.message);
	  }
	},
  	

}
