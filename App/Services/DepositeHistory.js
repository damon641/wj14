'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const depositeModal  = mongoose.model('depositeHistory');


module.exports = {

	getByData: async function(data){
        try {
          return  await depositeModal.find(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

	getDatatable: async function(query, length, start){
        try {
          return  await depositeModal.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("Error",e);
        }
	},

	getOneData: async function(data){
		try {
			return  await depositeModal.findOne(data);
		} catch (e) {
			console.log("Error",e);
		}
	},


	updateData: async function(condition, data){
		try {
			await depositeModal.update(condition, data);
		} catch (e) {
			console.log("Error",e);
		}
	},

	create: async function(data){
		try {
			await depositeModal.create(data);
		} catch (e) {
			console.log("Error",e);
		}
	},

	delete: async function(data){
        try {
          await depositeModal.deleteOne({_id: data});
        } catch (e) {
          console.log("Error",e);
        }
  },
}
