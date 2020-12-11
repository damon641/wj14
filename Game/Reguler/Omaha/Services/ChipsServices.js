'use strict';
var Sys = require('../../../../Boot/Sys');

const mongoose = require('mongoose');
const transactionModel  = mongoose.model('transactions');
const chipModel  = mongoose.model('chipsHistory');
const allUsersTransactionHistoryModel = mongoose.model('allUsersTransactionHistory');
// const gameModel  = mongoose.model('game');

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
    createTransaction: async function(data){
        try {
          // let transactionSave = new transactionModel(data);
          // transaction = await transactionModel.save()
			    return  await transactionModel.create(data);
        } catch (error) {
            Sys.Log.info('Room Service Error in createTransaction : ' + error);
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


}
