'use strict';

const mongoose = require('mongoose');
const Sys = require('../../Boot/Sys');
const Model  = mongoose.model('allUsersTransactionHistory');

module.exports = {

	getByData: async function(data, select, setOption,sort){
        try {
          return  await Model.find(data, select, setOption).sort(sort).lean();  // setOption(sort, limit,skip)
        } catch (e) {
          //console.log("Error",e);
          throw new Error('error in getByData' + e.message);
        }
	},

	getByDataNew: async function(data, length,start,sort){
        try {
        	console.log("getByDataNew start: ", start);
        	console.log("getByDataNew length: ", length);

          return  await Model.find(data).limit(parseInt(length)).skip(parseInt(start)).sort(sort).lean();  // setOption(sort, limit,skip)
        } catch (e) {
         	console.log("Error",e);
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
