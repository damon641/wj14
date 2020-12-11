'use strict';

const mongoose = require('mongoose');
const Sys = require('../../Boot/Sys');
const gameStatisticsModel = mongoose.model('playerGameHistory');


module.exports = {
	getByData: async function(data, select, setOption){
		try{
			return await gameStatisticsModel.find(data, select, setOption);
		}catch(e){
			console.log("Error", e);
		}
	},

	getSingleData: async function(data){
		try{
			return await gameStatisticsModel.findOne(data, select, setOption);
		}catch(e){
			console.log("Error", e);
		}
	},

	getCount: async function(data){
		try{
			return await gameStatisticsModel.countDocuments(data);
		}catch(e){
			console.log("Error", e);
		}
	},

	insertData: async function(data){
		try{
			return await gameStatisticsModel.create(data);
		}catch(e){
			console.log("Error", e);
			return new Error("Error while inserting data in gameStatistics", e);
		}
	},

	updateData: async function(data){
		try{
			return await gameStatisticsModel.update(data);
		}catch(e){
			console.log("Error", e);
			return new Error("Error while updating data in gameStatistics", e);
		}
	},

	deleteData: async function(data){
		try{
			return await gameStatisticsModel.deleteOne(data);
		}catch(e){
			console.log("Error", e);
			return new Error("Error while deleting data in gameStatistics", e);
		}
	},

	aggregateQuery: async function(data){
		try {
		  return  await gameStatisticsModel.aggregate(data);
		} catch (e) {
		  console.log("Error",e);
		}
	}


}