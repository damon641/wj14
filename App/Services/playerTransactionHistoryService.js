'use strict';
var Sys = require('../../Boot/Sys');

const mongoose = require('mongoose');
const playerAllTransactions  = mongoose.model('playerAllTransactions');

module.exports = {
  getAllData: async function(query){
    try {
      return await playerAllTransactions.find(query).lean();
    }
    catch (error) {
      Sys.Log.info('getAllPlayerTransectionHistrory Service Error in playerTransectionHistory : ' + error);
    }
  },

  getByDataNew: async function(query, length,start,sort){
        try {
          return  await playerAllTransactions.find(query).limit(parseInt(length)).skip(parseInt(start)).sort(sort).lean();  // setOption(sort, limit,skip)
        } catch (e) {
          console.log("Error",e);
          throw new Error('error in getByData' + e.message);
        }
  },
}
