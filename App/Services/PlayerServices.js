'use strict';
const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const playerModel = mongoose.model('player');
const accountNumberUpdateReqModel = mongoose.model('acctNumUpdateReq');
const depositReceiptModel = mongoose.model('depositReceipt');
const withdrawModel = mongoose.model('withdraw');
const { ObjectId } = mongoose.Types;
module.exports = {

    getByData: async function(data) {
        //console.log('Find By Data:',data)
        try {
            return await playerModel.find(data);
        } catch (e) {
            console.log("PlayerServices Error in getByData", e);
            return new Error(e);
        }
    },

    getPlayerData: async function(data) {
        try {
            return await playerModel.find(data);
        } catch (e) {
            console.log("PlayerServices Error in getPlayerData", e);
            return new Error(e);
        }
    },

    getPlayerCount: async function(data) {
        try {
            return await playerModel.countDocuments(data);
        } catch (e) {
            console.log("PlayerServices Error in getPlayerCount", e);
            return new Error(e);
        }
    },

    getSinglePlayerData: async function(data, column) {
        try {
            return await playerModel.findOne(data).select(column);
        } catch (e) {
            console.log("PlayerServices Error in getSinglePlayerData", e);
            return new Error(e);
        }
    },

    getPlayerDatatable: async function(query, length, start, column, mysort) {
        try {
            let mysort = { UniqueID: -1 };
            console.log(mysort);
            return await playerModel.find(query).skip(start).limit(length).select(column).lean().sort({ "_id": -1 });
        } catch (e) {
            console.log("PlayerServices Error in getPlayerDataTable", e);
            return new Error(e);
        }
    },

    insertPlayerData: async function(data) {
        try {
            data.uniqId = 'SP' + (await playerModel.countDocuments({}) + 1000);
            console.log("UniqId", data.uniqId)
            return await playerModel.create(data);
        } catch (e) {
            console.log("PlayerServices Error in insertPlayerData", e);
            return new Error(e);
        }
    },

    deletePlayer: async function(data) {
        try {
            return await playerModel.deleteOne({ _id: data });
        } catch (e) {
            console.log("PlayerServices Error in deletePlayer", e);
            return new Error(e);
        }
    },

    FindOneUpdatePlayerData: async function(condition, data, opts) {
        try {
            return await playerModel.findOneAndUpdate(condition, data, opts);
        } catch (e) {
            console.log("PlayerServices Error in updatePlayerData", e);
            return new Error(e);
        }
    },


    updatePlayerData: async function(condition, data) {
        try {
            return await playerModel.update(condition, data);
        } catch (e) {
            console.log("PlayerServices Error in updatePlayerData", e);
            return new Error(e);
        }
    },

    getLimitPlayer: async function(data) {
        try {
            return await playerModel.find(data).limit(8).sort({ createdAt: -1 });
        } catch (e) {
            console.log("PlayerServices Error in getLimitPlayer", e);
            return new Error(e);
        }
    },

    getLimitedPlayerWithSort: async function(data, limit, sortBy, sortOrder) {
        try {
            return await playerModel.find(data).sort({ chips: sortOrder }).limit(limit);
        } catch (e) {
            console.log("PlayerServices Error in getLimitedPlayerWithSort", e);
            return new Error(e);
        }
    },

    aggregateQuery: async function(data) {
        try {
            return await playerModel.aggregate(data);
        } catch (e) {
            console.log("PlayerServices Error in aggregateQuery", e);
            return new Error(e);
        }
    },

    updateMultiplePlayerData: async function(condition, data) {
        try {
            await playerModel.update(condition, data, { multi: true });
        } catch (e) {
            console.log("PlayerServices Error in updateMultiplePlayerData", e);
            return new Error(e);
        }
    },

    getPlayerExport: async function(query, pageSize) {
        try {
            return await playerModel.find(query).limit(pageSize);
        } catch (e) {
            console.log("PlayerServices Error in getPlayerExport", e);
            return new Error(e);
        }
    },

    getLoggedInTokens: async function() {
        try {
            return await playerModel.find({ loginToken: { $ne: null } }).select({ loginToken: 1, _id: 0 });
        } catch (e) {
            console.log("Error", e);
            return new Error(e);
        }
    },

    getRequestCount: async function(data) {
        try {
            return await accountNumberUpdateReqModel.countDocuments(data);
        } catch (e) {
            console.log('PlayerServices Error in getRequestCount', e);
            return new Error(e);
        }
    },

    getRequestDataTable: async function(query, length, start) {
        try {
            return await accountNumberUpdateReqModel
                .find(query)
                .skip(start)
                .limit(length)
                .populate("playerId", { userId: 1, _id: 0, username: 1, accountNumber: 1, uniqId: 1 })
                .lean();
        } catch (e) {
            console.log('PlayerServices Error in getPlayerDataTable', e);
            return new Error(e);
        }
    },

    getSingleRequestData: async function(id) {
        try {
            return await accountNumberUpdateReqModel.findById(id);
        } catch (err) {
            console.log('PlayerServices Error in getSingleRequestData', e);
            return new Error(err);
        }
    },

    updateRequestData: async function(id) {
        try {
            return await accountNumberUpdateReqModel.update({ _id: ObjectId(id) }, { action: true });
        } catch (error) {
            console.log('PlayerServices Error in updateRequestData', e);
            return new Error(e);
        }
    },

    getDepositReceiptCount: async function(data) {
        try {
            return await depositReceiptModel.countDocuments(data);
        } catch (e) {
            console.log('PlayerServices Error in getDepositReceiptCount', e);
            return new Error(e);
        }
    },

    getDepositReceiptDataTable: async function(query, length, start) {
        try {
            return await depositReceiptModel
                .find(query)
                .skip(start)
                .limit(length)
                .populate("playerId", { userId: 1, _id: 0, username: 1, accountNumber: 1, uniqId: 1 })
                .lean();
        } catch (e) {
            console.log('PlayerServices Error in getDepositReceiptDataTable', e);
            return new Error(e);
        }
    },
    updateDepositData: async function(id, data) {
        try {
            return await depositReceiptModel.update({ _id: ObjectId(id) }, data);
        } catch (error) {
            console.log('PlayerServices Error in updateDepositData', e);
            return new Error(e);
        }
    },
    getSingleReceiptData: async function(id) {
        try {
            return await depositReceiptModel.findById(id);
        } catch (err) {
            console.log('PlayerServices Error in getSingleRequestData', e);
            return new Error(err);
        }
    },
    getWithdrawCount: async function(data) {
        try {
            return await withdrawModel.countDocuments(data);
        } catch (e) {
            console.log('PlayerServices Error in getWithdrawCount', e);
            return new Error(e);
        }
    },

    getWithdrawDataTable: async function(query, length, start) {
        try {
            return await withdrawModel
                .find(query)
                .skip(start)
                .limit(length)
                .populate("playerId", { userId: 1, _id: 0, username: 1, chips: 1, accountNumber: 1, uniqId: 1 })
                .lean();
        } catch (e) {
            console.log('PlayerServices Error in getWithdrawDataTable', e);
            return new Error(e);
        }
    },

    updateWithdrawData: async function(id, data) {
        try {
            return await withdrawModel.update({ _id: ObjectId(id) }, data);
        } catch (error) {
            console.log('PlayerServices Error in updateWithdrawData', e);
            return new Error(e);
        }
    },

    updateWithdrawNotification: async function(query, data) {
        try {
            return await withdrawModel.updateMany(query, data);
        } catch (error) {
            console.log('PlayerServices Error in updateWithdrawNotification', e);
            return new Error(error);
        }
    },

    getSingleWithdrawData: async function(id) {
        try {
            return await withdrawModel.findById(id);
        } catch (err) {
            console.log('PlayerServices Error in getSingleRequestData', err);
            return new Error(err);
        }
    },

    getNewWithdrawCount: async function(query) {
        try {
            return await withdrawModel.countDocuments(query);
        } catch (err) {
            console.log('PlayerServices Error in getNewWithdrawCount', err);
            return new Error(err);
        }
    },

    getNewDepositCount: async function(query) {
        try {
            return await depositReceiptModel.countDocuments(query);
        } catch (err) {
            console.log('PlayerServices Error in getNewDepositCount', err);
            return new Error(err);
        }
    },

    updateDepositNotification: async function(query, data) {
        try {
            return await depositReceiptModel.updateMany(query, data);
        } catch (error) {
            console.log('PlayerServices Error in updateDepositNotification', e);
            return new Error(error);
        }
    },
}