'use strict';

const mongoose = require('mongoose');
var Sys = require('../../../Boot/Sys');
const playerChipsCashHistoryModel  = mongoose.model('playerChipsCashHistory');

module.exports = {

  getByData: async function(data){
        console.log('Find By Data:',data)
        try {
          return  await playerChipsCashHistoryModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  getChipsData: async function(data){
        try {
          return  await playerChipsCashHistoryModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  getSingleChipsData: async function(data){
        try {
          return  await playerChipsCashHistoryModel.findOne(data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  getChipsDatatable: async function(query, length, start){
        try {
          return  await playerChipsCashHistoryModel.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("Error",e);
        }
  },

  insertChipsData: async function(data){
        try {
          await playerChipsCashHistoryModel.create(data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  deleteChips: async function(data){
        try {
          await playerChipsCashHistoryModel.deleteOne({_id: data});
        } catch (e) {
          console.log("Error",e);
        }
  },

  updateChipsData: async function(condition, data){
        try {
          await playerChipsCashHistoryModel.update(condition, data);
        } catch (e) {
          console.log("Error",e);
        }
  },

}
