'use strict';
var Sys = require('../../../../Boot/Sys');

const mongoose = require('mongoose');
const chipModel  = mongoose.model('chipsHistory');
const errorModel  = mongoose.model('errorReports');
const transactionModel  = mongoose.model('allUsersTransactionHistory');
const rackCapModel  = mongoose.model('rackCap');
const allUsersTransactionHistoryModel  = mongoose.model('allUsersTransactionHistory');
const errorReportValidationModel  = mongoose.model('errorReportValidation');
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

    createErrorLog: async function(data){
      try {
        return await errorModel.create(data);
      } catch (error) {
        console.log("ChipsServices  Error in createErrorLog",error);
          return new Error(error);
      }
  },
    createTransaction: async function(data){
        try {
			    return  await transactionModel.create(data);
        } catch (error) {
            Sys.Log.info('Room Service Error in createTransaction : ' + error);
        }
    },

    getData: async function(query,length,start,sort){
      try {
        return await transactionModel.find(query).limit(length).skip(start).sort(sort).lean();
      }
      catch (error) {
        Sys.Log.info('Room Service Error in getAllRoom : ' + error);
      }
    },

    getSingleData: async function(query){
      try {
        return await transactionModel.findOne(query).lean();
      }
      catch (error) {
        Sys.Log.info('Chips Service Error in getSingleData : ' + error);
      }
    },

    updateTransactionData: async function(condition, data){
        try {
          await transactionModel.update(condition, data);
        } catch (e) {
          console.log("Error",e);
        }
    },
 
    getCapByData: async function(data){
          try {
            return  await rackCapModel.find(data).lean();
          } catch (e) {
            console.log("Error Erorr getByData in RakeCapServices ",e);
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

createErrorReportValidationLog: async function(data){
  try {
    return await errorReportValidationModel.create(data);
  } catch (error) {
    console.log("ChipsServices  Error in errorReportValidationModel",error);
      return new Error(error);
  }
},


}
