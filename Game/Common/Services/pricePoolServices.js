'use strict';

const mongoose = require('mongoose');
var Sys = require('../../../Boot/Sys');
const regularPricePoolModel  = mongoose.model('regularPricePool');
const sngPricePoolModel  = mongoose.model('sngPricePool');

module.exports = {
    getPricePoolDataSelect: async function(data,property){
        try {
          //return  await regularPricePoolModel.find(data).select(property);
          return  await regularPricePoolModel.find(data).select(property).limit(1).sort({"minPlayers":-1}); 
        } catch (e) {
          console.log("Error",e);
        }
    },

	getPricePoolData: async function(data, select, setOption){
	  try {
	    return  await regularPricePoolModel.find(data, select, setOption);  // setOption(sort, limit,skip)
	  } catch (e) {
	    //console.log("Error",e);
	    throw new Error('error in getPricePoolData' + e.message);
	  }
	},

	getSngPricePooldata: async function(data, select, setOption){
	  try {
	    return  await sngPricePoolModel.find(data, select, setOption);  // setOption(sort, limit,skip)
	  } catch (e) {
	    //console.log("Error",e);
	    throw new Error('error in getPricePoolData' + e.message);
	  }
	},

}

