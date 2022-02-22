'use strict';
const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const agentModel = mongoose.model('Agent');
const chipsNotesModel = mongoose.model('chipsNote');
const agentChipsHistoryModel = mongoose.model('agentChipsHistory');

module.exports = {

    getByData: async function(data) {
        try {
            return await agentModel.find(data);
        } catch (e) {
            console.log("agentServices Error in getByData", e);
            return new Error(e);
        }
    },
    getByDataOne: async function(data) {
        try {
            return await agentModel.findOne(data);
        } catch (e) {
            console.log("agentServices Error in getByData", e);
            return new Error(e);
        }
    },

    getAgentData: async function(data) {
        try {
            return await agentModel.find(data);
        } catch (e) {
            console.log("agentServices Error in getAgentData", e);
            return new Error(e);
        }
    },
    addChipsHistory: async function(data) {
        try {
            return await agentChipsHistoryModel.create(data);
        } catch (e) {
            console.log("agentServices Error in addChipsHistory", e);
            return new Error(e);
        }
    },
    getAgentCount: async function(data) {
        try {
            return await agentModel.countDocuments(data);
        } catch (e) {
            console.log("agentServices Error in getAgentCount", e);
            return new Error(e);
        }
    },

    getSingleAgentData: async function(data, column) {
        try {
            return await agentModel.findOne(data).select(column).lean();
        } catch (e) {
            console.log("agentServices Error in getSingleAgentData", e);
            return new Error(e);
        }
    },

    getAgentDatatable: async function(query, length, start, column) {
        try {
            return await agentModel.find(query).skip(start).limit(length).select(column).lean();
        } catch (e) {
            console.log("agentServices Error in getAgentDatatable", e);
            return new Error(e);
        }
    },

    insertAgentData: async function(data) {
        try {
            return await agentModel.create(data);
        } catch (e) {
            console.log("agentServices Error in insertAgentData", e);
            return new Error(e);
        }
    },

    insertChipsNoteData: async function(data) {
        try {
            console.log("Chips notes data insert: ", data)
            return await chipsNotesModel.create(data);
        } catch (e) {
            console.log("agentServices Error in insertChipsNoteData", e);
            return new Error(e);
        }
    },

    getSingleChipsNote: async function(data) {
        try {
            console.log("Chips notes get data: ", data)
            return await chipsNotesModel.findOne(data);
        } catch (e) {
            console.log("agentServices Error in getSingleChipsNote", e);
            return new Error(e);
        }
    },

    deleteAgent: async function(data) {
        try {
            await agentModel.deleteOne({ _id: data });
        } catch (e) {
            console.log("agentServices Error in deleteAgent", e);
            return new Error(e);
        }
    },

    updateAgentData: async function(condition, data) {
        try {
            return await agentModel.updateOne(condition, data);
        } catch (e) {
            console.log("agentServices Error in updateAgentData", e);
            return new Error(e);
        }
    },

    FindOneUpdateAgentData: async function(condition, data, opts) {
        try {
            console.log(data);
            return await agentModel.findOneAndUpdate(condition, data, opts);
        } catch (e) {
            console.log("agentServices Error in updateAgentData", e);
            return new Error(e);
        }
    },

    updateChipsNoteData: async function(condition, data) {
        try {
            await chipsNotesModel.update(condition, data);
        } catch (e) {
            console.log("agentServices Error in updateChipsNoteData", e);
            return new Error(e);
        }
    },

    getLimitAgent: async function(data) {
        try {
            return await agentModel.find(data).limit(8).sort({ createdAt: -1 });
        } catch (e) {
            console.log("agentServices Error in getLimitAgent", e);
            return new Error(e);
        }
    },

    getPopulatedData: async function(query, select, setOption, populateWith) {
        try {
            return await agentModel.find(query, select, setOption).populate(populateWith);
        } catch (e) {
            console.log("agentServices Error in getPopulatedData", e);
            return new Error(e);
        }
    },
    aggregateQuery: async function(data, length, start, column) {
        try {
            // return await playerModel.find(query)
            return await agentModel.aggregate(data).sort({ "_id": -1 });
        } catch (e) {
            console.log("agentServices Error in aggregateQuery", e);
            return new Error(e);
        }
    },

    findOneAndUpdate: async function(conditions, update) {
        try {
            return await agentModel.findOneAndUpdate(conditions, update)
        } catch (e) {
            console.log("agentServices Error in findOneAndUpdate", e);
            return new Error(e);
        }
    },

}