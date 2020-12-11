'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const notificationModel  = mongoose.model('notification');


module.exports = {

  getNotificationData: async function(data){
    try {
      return await notificationModel.findOne(data);
    } catch (e) {
      console.log("Error", e);
      return new Error(e);
    }
	 },

  getByData: async function(data){
        try {
          return  await notificationModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  updateNotificationData: async function(condition, data){
        try {
         return await notificationModel.update(condition, data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  insertNotificationData: async function(data){
        try {
          await notificationModel.create(data);
        } catch (e) {
          console.log("Error",e);
        }
  },


}
