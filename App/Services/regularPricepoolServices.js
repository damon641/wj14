'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const regularPricePoolModel  = mongoose.model('regularPricePool');


module.exports = {

  getByData: async function(data){
        //console.log('Find By Data:',data)
        try {
          return  await regularPricePoolModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  getPricePoolData: async function(data){
        try {
          return  await regularPricePoolModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
  },
  getPricePoolDataSelect: async function(data,property){
        try {
          console.log(data);
          return  await regularPricePoolModel.find(data).select(property);
        } catch (e) {
          console.log("Error",e);
        }
  },

  getPricePoolCount: async function(data){
    try {
          return  await regularPricePoolModel.countDocuments(data);
        } catch (e) {
          console.log("Error",e);
    }
  },

  getSinglePricePoolData: async function(data){
        try {
          return  await regularPricePoolModel.findOne(data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  getPricePoolDatatable: async function(query, length, start){
        try {
          return  await regularPricePoolModel.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("Error",e);
        }
  },

  insertPricePoolData: async function(data){
        try {
          return await regularPricePoolModel.create(data);
        } catch (e) {
          console.log("Error",e);
          throw e;
        }
  },

  deletePricePool: async function(data){
        try {
          await regularPricePoolModel.deleteOne({_id: data});
        } catch (e) {
          console.log("Error",e);
        }
  },

  updatePricePoolData: async function(condition, data){
        try {
          await regularPricePoolModel.update(condition, data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  getLimitPricePool: async function(data){
        try {
          return  await regularPricePoolModel.find(data).limit(8).sort('createdAt DESC');;
        } catch (e) {
          console.log("Error",e);
        }
  },

  




}

