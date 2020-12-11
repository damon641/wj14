'use strict';
var Sys = require('../../Boot/Sys');    
const mongoose = require('mongoose');
const errorModel  = mongoose.model('errorReports');
const errorReportValidation  = mongoose.model('errorReportValidation');
module.exports = {
    createErrorLog: async function(data){
      try {
        return await errorModel.create(data);
      } catch (error) {
        console.log("ChipsServices  Error in createErrorLog",error);
          return new Error(error);
      }
  },

    getData: async function(query,length,start,sort){
      try {
        return await errorModel.find(query).limit(length).skip(start).sort(sort).lean();
      }
      catch (error) {
        console.log('ChipsServices Error in getData : ' + error);
        return new Error(error);
      }
    },

    getSingleData: async function(query){
      try {
        return await errorModel.findOne(query).lean();
      }
      catch (error) {
        console.log('ChipsServices Error in getSingleData : ' + error);
        return new Error(error);
      }
    },

    getErrorReportValidationData: async function(query,length,start,sort){
      try {
        return await errorReportValidation.find(query).limit(length).skip(start).sort(sort).lean();
      }
      catch (error) {
        console.log('ChipsServices Error in getErrorReportValidationData : ' + error);
        return new Error(error);
      }
    },

}
