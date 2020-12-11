'use strict';
var Sys = require('../../../../Boot/Sys');

const mongoose = require('mongoose');
const chipModel  = mongoose.model('chipsHistory');
// const gameModel  = mongoose.model('game');
const allUsersTransactionHistoryModel = mongoose.model('allUsersTransactionHistory');


module.exports = {

    create: async function(data){
        try {
          let gameSave = new chipModel(data);
          game = await chipModel.save()
			    return  await chipModel.find(data);
        } catch (error) {
            Sys.Log.info('Room Service Error in getByData : ' + error);
        }
    },
    getSingleData: async function(query){
        try {
          return await allUsersTransactionHistoryModel.findOne(query).lean();
        }
        catch (error) {
          console.log('ChipsServices Error in getSingleData : ' + error);
          return new Error(error);
        }
      },

      createAgentTransaction: async function(data){
        try {
          // let transactionSave = new transactionModel(data);
          // transaction = await transactionModel.save()
          return  await allUsersTransactionHistoryModel.create(data);
        } catch (error) {
            Sys.Log.info('Room Service Error in createTransaction : ' + error);
        }
    },
    insertData: async function(data){
      try {
          return await allUsersTransactionHistoryModel.create(data);
      } catch (e) {
    console.log("AllUsersTransactionHistoryServices Error in insertData",e);
    return new Error(e);
      }
},
}
