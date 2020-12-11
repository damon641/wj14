'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const gameModel  = mongoose.model('game');


module.exports = {

	getByData: async function(data){
     
        try {
          return  await gameModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getGameData: async function(data){
        try {
          return  await gameModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getGameCount: async function(data){
    try {
          //return  await gameModel.countDocuments(data);
          return  await gameModel.countDocuments(data);
        } catch (e) {
          console.log("Error",e);
    }
  },

	getSingleGameData: async function(data,column){
        try {
          return  await gameModel.findOne(data).select(column).lean();
        } catch (e) {
          console.log("Error",e);
        }
	},

  getGameDatatable: async function(query, length, start){
        try {
          return  await gameModel.find(query).skip(start).limit(length).sort({createdAt:-1}).lean();
        } catch (e) {
          console.log("Error",e);
        }
  },

  getAllGameDataTable: async function(query, length, start, column) {
    try {
      return await gameModel.find(query).select(column).sort({createdAt:1}).lean();
    } catch (e) {
      console.log("Error",e);
    }
  },
  getGameDatatableTest: async function(query, length, start){
        try {
          return  await gameModel.find(query);
        } catch (e) {
          console.log("Error",e);
        }
  },
  insertGameData: async function(data){
        try {
          await gameModel.create(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  deleteGame: async function(data){
        try {
          await gameModel.deleteOne({_id: data});
        } catch (e) {
          console.log("Error",e);
        }
  },

	updateGameData: async function(condition, data){
        try {
          await gameModel.update(condition, data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getLimitedGame: async function(data){
    try{
        return await gameModel.find(data).limit(10).sort({createdAt:-1});
    }catch(e){
      console.log("Error",e);
    }
  },

  aggregateQuery : async function(data){
    try {
      return  await gameModel.aggregate(data);
    } catch (e) {
      console.log("Error",e);
    }
  },

}
