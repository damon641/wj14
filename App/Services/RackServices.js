'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const rackModel  = mongoose.model('rack');


module.exports = {

	getByData: async function(data){
        try {
          return  await rackModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getRackCount: async function(data){
    try {
          return  await rackModel.countDocuments(data);
        } catch (e) {
          console.log("Error",e);
    }
  },


  getRackDatatable: async function(query, length, start){
        try {
          return  await rackModel.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("Error",e);
        }
	},

 

}
