'use strict';

const mongoose = require('mongoose');
var Sys = require('../../../../Boot/Sys');
const regularPricePoolModel  = mongoose.model('regularPricePool');

module.exports = {
  getPricePoolDataSelect: async function(data,property){
        try {
          console.log(data);
          return  await regularPricePoolModel.find(data).select(property);
        } catch (e) {
          console.log("Error",e);
        }
  },
}

