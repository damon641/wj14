'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const rackCapModel  = mongoose.model('rackCap');


module.exports = {

	getByData: async function(data){
        try {
          return  await rackCapModel.find(data);
        } catch (e) {
          console.log("Error Erorr getByData in RakeCapServices ",e);
        }
	},

	getRakeCapDatatable: async function(query, length, start){
        try {
          return  await rackCapModel.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("Error ",e);
        }
	},

	getRakeCapData: async function(data){
		try {
			return  await rackCapModel.findOne(data);
		} catch (e) {
			console.log("Error",e);
		}
	},

	getRakeCapCount: async function(data){
	  try {
	        return  await rackCapModel.countDocuments(data);
	      } catch (e) {
	        console.log("Error",e);
	  }
	},


	updateRackCapData: async function(condition, data){
		try {
			await rackCapModel.updateOne(condition, data);
		} catch (e) {
			console.log("Error",e);
		}
	},

	insertStacksData: async function(data){
		try {
			await rackCapModel.create(data);
		} catch (e) {
			console.log("Error getByData in RakeCapServices",e);
		}
	},

	deleteRackCap: async function(data){
        try {
          await rackCapModel.deleteOne({_id: data});
        } catch (e) {
          console.log("Error",e);
        }
  },
}
