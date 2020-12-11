'use strict';

const mongoose = require('mongoose');
const Sys = require('../../Boot/Sys');
const Model  = mongoose.model('player');

module.exports = {

	getByData: async function(data, select, setOption){
        try {
          return  await Model.find(data, select, setOption);  // setOption(sort, limit,skip)
        } catch (e) {
          //console.log("Error",e);
          throw new Error('error in getByData' + e.message);
        }
	},

	getSingleData: async function(data, select, setOption){
        try {
          return  await Model.findOne(data, select, setOption);
        } catch (e) {
          console.log("Error",e);
          throw new Error('error in getSingleData'+ e.message);
        }
	},

	getById: async function(id, select){
		try {
		   	return await Model.findById(id, select);
		}
		catch (e) {
		  	console.log("Error",e);
		    throw new Error('error in getById'+ e.message);
		}
	},

	getCount: async function(data){
	  try {
	        return  await Model.countDocuments(data);
	      } catch (e) {
	        console.log("Error",e);
	        throw new Error('error in getCount'+ e.message);
	  }
	},

	/*getDatatable: async function(query, length, start){
	      try {
	        return  await Model.find(query).skip(start).limit(length).sort({createdAt:-1});
	      } catch (e) {
	        console.log("Error",e);
	      }
	},*/

  
  	insertData: async function(data){
        try {
          	return await Model.create(data);
        } catch (e) {
          	console.log("Error",e);
          	throw new Error('error in insertData'+ e.message);
        }
	},

  	deleteData: async function(data){
        try {
        	return await Model.deleteOne({_id: data});
        } catch (e) {
          	console.log("Error",e);
          	throw new Error('error in deleteData'+ e.message);
        }
  	},

	updateData: async function(condition, data){
		try {
			return await Model.update(condition, data);
		} catch (e) {
			console.log("Error",e);
          	throw new Error('error in updateData'+ e.message);
		}
	},

	aggregateQuery : async function(data){
		 try {
		    return  await Model.aggregate(data);
		 } catch (e) {
		    console.log("Error",e);
          	throw new Error('error in aggregateQuery'+ e.message);
		 }
	},

	aggregateQueryCount : async function(data){
		 try {
		    return  await Model.aggregate(data).toArray().length;
		 } catch (e) {
		    console.log("Error",e);
          	throw new Error('error in aggregateQueryCount'+ e.message);
		 }
	},

	getPopulatedData: async function(query, select, setOption,populateWith){
	  try {
	    return  await Model.find(query,select, setOption).populate(populateWith);
	  } catch (e) {
	    console.log("Error",e);
	    throw new Error('error in getPopulatedData'+ e.message);
	  }
	}


}
