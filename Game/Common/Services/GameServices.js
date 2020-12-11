'use strict';

const mongoose = require('mongoose');
var Sys = require('../../../Boot/Sys');
const gameModel  = mongoose.model('game');


module.exports = {

	getByData: async function(data, select, setOption){
     
        try {
          return  await gameModel.find(data, select, setOption);
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
          return  await gameModel.countDocuments(data);
        } catch (e) {
          console.log("Error",e);
    }
  },

	getSingleGameData: async function(data){
        try {
          return  await gameModel.findOne(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getGameDatatable: async function(query, length, start){
        try {
          return  await gameModel.find(query).skip(start).limit(length).sort({createdAt:-1});
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
