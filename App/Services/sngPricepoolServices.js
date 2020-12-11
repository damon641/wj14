'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const sngPricepoolModel  = mongoose.model('sngPricePool');


module.exports = {


	getPricepoolData: async function(data){
    try {
      return await sngPricepoolModel.findOne(data);
    } catch (e) {
      console.log("Error", e);
      return new Error(e);
    }
	 },


  updatePricepoolData: async function(condition, data){
        try {
          await sngPricepoolModel.update(condition, data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  insertPricepoolData: async function(data){
        try {
          await sngPricepoolModel.create(data);
        } catch (e) {
          console.log("Error",e);
        }
  },


}
