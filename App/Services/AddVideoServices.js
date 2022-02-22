'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const addVideoModel = mongoose.model('addvideo');


module.exports = {

  getByData: async function (data) {
    try {
      return await addVideoModel.find(data);
    } catch (e) {
      console.log("Error", e);
    }
  },

  getVideoData: async function (data) {
    try {
      return await addVideoModel.find(data);
    } catch (e) {
      console.log("VideoService Error in getVideoData", e);
      return new Error(e);
    }
  },

  getVideoCount: async function (data) {
    try {
      return await addVideoModel.countDocuments(data);
    } catch (e) {
      console.log("VideoService Error in getVideoCount", e);
      return new Error(e);
    }
  },

  getVideoDatatable: async function (query, length, start) {
    try {
      return await addVideoModel.find(query).skip(start).limit(length);
    } catch (e) {
      console.log("AddVideoService Error in getVideoDatatable", e);
      return new Error(e);
    }
  },

  insertVideoData: async function (data) {
    try {
      await addVideoModel.create(data);
    } catch (e) {
      console.log("AddVideoService Error in insertVideoData", e);
      return new Error(e);
    }
  },

  updateVideoStatussecondary: async function (data) {
    try {
      return await addVideoModel.updateMany({status: 'secondary'}, {status:'inactive'});
    } catch (error) {
      Sys.Log.info('Error in Update Room Status  : ' + error);
      return error;
    }
  },
  updateVideoStatusprimary: async function (data) {
    try {
      return await addVideoModel.updateMany({status: 'primary'}, {status:'inactive'});
    } catch (error) {
      Sys.Log.info('Error in Update Room Status  : ' + error);
      return error;
    }
  },

  updateVideoData: async function (condition, data) {
    try {
      return await addVideoModel.updateOne(condition, data);
    } catch (e) {
      console.log("AddVideoService Error in updateVideoData", e);
      return new Error(e);
    }
  },

  getSingleVideoData: async function (data, column) {
    try {
      return await addVideoModel.findOne(data).select(column);
    } catch (e) {
      console.log("AddVideoService Error in getSingleVideoData", e);
      return new Error(e);
    }
  },

  deleteVideo: async function (data) {
    try {
      await addVideoModel.deleteOne({ _id: data });
    } catch (e) {
      console.log("AddVideoService Error in deleteVideo", e);
      return new Error(e);
    }
  },

}
