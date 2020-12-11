'use strict';

const mongoose = require('mongoose');
const Sys = require('../../Boot/Sys');
const promocodeModel = mongoose.model('Promocode');

module.exports = {
	getByData: async function(data){
        console.log('Find By Data:',data)
        try {
          return  await promocodeModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getPromocodeData: async function(data){
        try {
          return  await promocodeModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getPromocodeCount: async function(data){
    try {
          return  await promocodeModel.countDocuments(data);
        } catch (e) {
          console.log("Error",e);
    }
  },

	getSinglePromocodeData: async function(data){
        try {
          return  await promocodeModel.findOne(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getPromocodeDatatable: async function(query, length, start){
        try {
          return  await promocodeModel.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("Error",e);
        }
	},

  insertPromocodeData: async function(data){
        try {
          return await promocodeModel.create(data);
        } catch (e) {
          console.log("Error",e);
          throw e;
        }
	},

  deletePromocode: async function(data){
        try {
          await promocodeModel.deleteOne({_id: data});
        } catch (e) {
          console.log("Error",e);
        }
  },

	updatePromocodeData: async function(condition, data){
        try {
          await promocodeModel.update(condition, data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getLimitPromocode: async function(data){
        try {
          return  await promocodeModel.find(data).limit(8).sort({createdAt:-1});
        } catch (e) {
          console.log("Error",e);
        }
  },
}