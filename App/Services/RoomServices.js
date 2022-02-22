'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const room = mongoose.model('room');


module.exports = {

    getCountTable: async function(data) {
        try {
            return await room.countDocuments(data);
        } catch (e) {
            console.log("Error Counting Table", e);
            return new Error(e);
        }
    },

    insertTableData: async function(data) {
        try {
            return await room.create(data);
        } catch (e) {
            console.log("Error Inserting Table", e);
            return new Error(e);
        }
    },

    getByData: async function(data) {
        //console.log('Find By Data:',data)
        try {
            return await room.find(data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    getRoomData: async function(data) {
        try {
            return await room.find(data);
        } catch (e) {
            console.log("Error in getRoomData", e);
            return new Error(e);
        }
    },

    getSingleRoomData: async function(data) {
        try {
            return await room.findOne(data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    getRoomDatatable: async function(query, length, start, sort = '', column) {
        try {
            if (sort != "") {
                return await room.find(query).skip(start).limit(length).select(column).lean().sort({ "_id": -1 });
            } else {
                return await room.find(query).skip(start).limit(length).select(column).lean().sort({ "_id": -1 });
            }
        } catch (e) {
            console.log("Error", e);
        }
    },

    deleteRoom: async function(data) {
        try {
            await room.deleteOne({ _id: data });
        } catch (e) {
            console.log("Error", e);
        }
    },

    updateRoomData: async function(condition, data) {
        try {
            await room.update(condition, data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    getRoomDataColumns: async function(data, column) {
        try {
            return await room.find(data).select(column);
        } catch (e) {
            console.log("Error in getRoomDataColumns", e)
        }
    },
    getLastTable: async function() {
        try {
            return await room.find({}).limit(1).sort({ $natural: -1 });
        } catch (err) {
            console.log("Error in getRoomDataColumns", e)
        }
    }
}