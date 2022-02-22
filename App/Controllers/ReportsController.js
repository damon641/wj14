var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');
const moment = require('moment');
const mongoose = require('mongoose');
const fs = require("fs");



module.exports = {

    //***********************************************************Self  Reports******************************************************************** */
    selfReports: async function(req, res) {
        try {
            var types = [{ name: "all", value: "All" }, { name: "rake", value: "Rake" }, { name: "deposit", value: "Deposit/Withdraw" }, { name: "tournament", value: "Tournament Fees" }]
            var ChipsTypes = [{ name: "mainChips", value: "Main Chips" }, { name: "rakeChips", value: "Rake Chips" }, { name: "adminRake", value: "Admin Rake" }]
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                types: types,
                ChipsTypes: ChipsTypes,
                error: req.flash("error"),
                success: req.flash("success"),
                selfActive: 'active',
                reportMenu: 'active'
            };
            return res.render('reports/selfReports', data);
        } catch (e) {
            console.log("Error", e);
        }
    },
    getSelfReportData: async function(req, res) {
        try {
            let agent
            if (req.query.hasOwnProperty('agent')) {
                agent = req.query.agent;
            } else {
                agent = req.session.details.id;
            }

            let type = req.query.hasOwnProperty('types') ? req.query.types : '';
            let search = req.query.search.value;
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);

            let ChipsTypes = req.query.hasOwnProperty('ChipsTypes') ? req.query.ChipsTypes : '';
            let total_balance = 0;
            let totalTrx = 0;
            var sort = { 'createdAt': 1 };
            var query = { $and: [{ $or: [{ rackToId: agent }, { receiverId: agent }, { user_id: agent }] }] };
            if (search) { query.transactionNumber = { $regex: '.*' + search + '.*' } }
            req.query.endDate = req.query.endDate.concat(" 23:59:59")
            if (req.query.startDate && req.query.endDate) { query.createdAt = { "$gte": new Date(req.query.startDate), "$lt": new Date(req.query.endDate) } }
            console.log(type, ChipsTypes);

            if (type == "all") {
                if (ChipsTypes == "rakeChips") {
                    query.rakeChips = 'true'
                } else if (ChipsTypes == "adminRake") {
                    query.adminChips = 'true'
                } else {
                    query.rakeChips = { '$ne': 'true' }
                    query.adminChips = { '$ne': 'true' }
                }
            } else if (type == "rake" && ChipsTypes == "adminRake") {
                query.rakeChips = { '$ne': 'true' }
                query.adminChips = 'true'
            } else if (type == "rake" && ChipsTypes == "rakeChips") {
                query.type = "rake"
                query.adminChips = { '$ne': 'true' }
                query.rakeChips = 'true'
            } else if (type == "deposit") {
                query.type = { '$in': ["deposit", "deduct"] }
                if (ChipsTypes == "rakeChips") {
                    query.rakeChips = 'true'
                } else if (ChipsTypes == "adminRake") {
                    query.adminChips = 'true'
                } else {
                    query.isTournament = { '$ne': 'true' }
                    query.rakeChips = { '$ne': 'true' }
                    query.adminChips = { '$ne': 'true' }
                }
            }
            // else if (type == "tournament" && ChipsTypes != "rakeChips" ) {
            //   query.type = { '$in': ["deposit", "deduct"] }
            //   query.isTournament = 'true'
            //   query.rakeChips = { '$ne': 'true' }
            // }
            else if (type == "tournament" && ChipsTypes == "rakeChips") {
                query.isTournament = 'true'
                query.rakeChips = 'true'
            }
            // else if (type == "tournament" && ChipsTypes == "adminChips " ) {
            //   query.isTournament = 'true'
            //   query.adminChips  = 'true'
            // }
            else {
                var obj = {
                    'draw': req.query.draw,
                    'closingData': 0,
                    'openingData': 0,
                    'recordsTotal': 0,
                    'recordsFiltered': 0,
                    'data': [],
                    'total_balance': 0
                };
                return res.send(obj);
            }
            console.log(query);

            let data = await Sys.App.Services.AllUsersTransactionHistoryServices.getDataAggregate(query, length, start, sort);
            let DataCount = await Sys.App.Services.AllUsersTransactionHistoryServices.getDataCount(query);
            for (let index = 0; index < data[0].thirdData.length; index++) {
                if (data[0].thirdData[index].type == "rake") {
                    data[0].thirdData[index].from = data[0].thirdData[index].rackFrom;
                    data[0].thirdData[index].in = data[0].thirdData[index].totalRack;
                    total_balance = data[0].thirdData[index].totalRack ? parseFloat(total_balance) + parseFloat(data[0].thirdData[index].totalRack) : total_balance;
                    data[0].thirdData[index].type = "Rake";
                    data[0].thirdData[index].remark = "Rake Amount"
                    data[0].thirdData[index].afterBalance = data[0].thirdData[index].rackToAfter_balance;
                    data[0].thirdData[index].beforeBalance = data[0].thirdData[index].rackToBefore_balance;
                } else if (data[0].thirdData[index].type != "rake") {
                    data[0].thirdData[index].from = data[0].thirdData[index].providerEmail;
                    data[0].thirdData[index].in = data[0].thirdData[index].type == "deposit" ? data[0].thirdData[index].chips : "-";
                    data[0].thirdData[index].out = data[0].thirdData[index].type == "deduct" ? data[0].thirdData[index].chips : "-";
                    total_balance = data[0].thirdData[index].type == "deposit" ? parseFloat(total_balance) + parseFloat(data[0].thirdData[index].chips) : parseFloat(total_balance) - parseFloat(data[0].thirdData[index].chips)
                    if (data[0].thirdData[index].isTournament == 'true') {
                        data[0].thirdData[index].remark = data[0].thirdData[index].remark
                        data[0].thirdData[index].from = data[0].thirdData[index].receiverName
                    } else {
                        data[0].thirdData[index].remark = data[0].thirdData[index].remark;
                    }
                }
            }
            let openingData = 0
            let closingData = 0
            if (DataCount) {
                openingData = data[0].firstData[0].firstRecord.beforeBalance ? data[0].firstData[0].firstRecord.beforeBalance : data[0].firstData[0].firstRecord.rackToBefore_balance;
                closingData = data[0].firstData[0].lastRecords.afterBalance ? data[0].firstData[0].lastRecords.afterBalance : data[0].firstData[0].lastRecords.rackToAfter_balance
                totalTrx = openingData - closingData
                if (type == 'deduct') {
                    totalTrx = Math.abs(totalTrx)
                }
            }
            if (data[0].thirdData.length) {
                data[0].thirdData.unshift({ createdAt: data[0].thirdData[0].createdAt, gameNumber: "-", transactionNumber: "-", from: "-", in: "0", out: "0", afterBalance: openingData, type: "Opening", remark: "Opening Balance" })
            }
            obj = {
                'draw': req.query.draw,
                'closingData': closingData,
                'openingData': openingData,
                'recordsTotal': DataCount,
                'recordsFiltered': DataCount,
                'data': data[0].thirdData,
                'total_balance': totalTrx
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
        }
    },
    //***********************************************************Agent Reports******************************************************************** */
    agentReports: async function(req, res) {
        try {
            let query = { parentId: req.session.details.id };
            var agents = req.session.details.role == "admin" ? await Sys.App.Services.agentServices.getAgentDatatable({}, null, null, ['username']) : await Sys.App.Services.agentServices.getAgentDatatable(query, null, null, ['username']);
            var types = [{ name: "all", value: "All" }, { name: "rake", value: "Rake" }, { name: "deposit", value: "Deposit/Withdraw" }, { name: "tournament", value: "Tournament Fees" }]
            var ChipsTypes = [{ name: "mainChips", value: "Main Chips" }, { name: "rakeChips", value: "Rake Chips" }]
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                agents: agents,
                types: types,
                ChipsTypes: ChipsTypes,
                error: req.flash("error"),
                success: req.flash("success"),
                agentActive: 'active',
                reportMenu: 'active'
            };
            return res.render('reports/agentReports', data);
        } catch (e) {
            console.log("Error", e);
        }
    },
    // getAgentReportData: async function (req, res) {
    //   try {
    //     let start = parseInt(req.query.start);
    //     let length = parseInt(req.query.length);
    //     let type = req.query.hasOwnProperty('types') ? req.query.types : '';
    //     let agent = req.query.hasOwnProperty('agent') ? req.query.agent : '';
    //     let search = req.query.search.value;
    //     let ChipsTypes = req.query.hasOwnProperty('ChipsTypes') ? req.query.ChipsTypes : '';
    //     var query = {$and:[{$or:[{rackToId:agent},{receiverId:agent},{user_id:agent}]}]};

    //     let total_balance = 0;
    //     let totalTrx = 0;
    //     var sort = { 'createdAt': 1 };
    //     if (search) { query.gameNumber = { $regex: '.*' + search + '.*' } }
    //     req.query.endDate = req.query.endDate.concat(" 23:59:59")
    //     if (req.query.startDate && req.query.endDate) { query.createdAt = { "$gte": req.query.startDate, "$lt": req.query.endDate } }
    //       if (type == "all") {
    //       if (ChipsTypes == "rakeChips") {
    //         query.rakeChips = 'true'
    //       } else {
    //         query.rakeChips = { '$ne': 'true' }
    //       }
    //     }
    //     else if (type == "rake" && ChipsTypes == "rakeChips") { query.type = "rake" }
    //     else if (type == "deposit" ) {
    //       query.type = { '$in': ["deposit", "deduct"] }
    //       if (ChipsTypes == "rakeChips") {
    //         query.rakeChips = 'true'
    //       } else {
    //         query.isTournament = { '$ne': 'true' }
    //         query.rakeChips = { '$ne': 'true' }
    //       }
    //     }
    //     else if (type == "tournament" && ChipsTypes != "rakeChips" ) {
    //       query.type = { '$in': ["deposit", "deduct"] }
    //       query.isTournament = 'true'
    //       query.rakeChips = { '$ne': 'true' }
    //     } else {
    //       var obj = {
    //         'draw': req.query.draw,
    //         'closingData': 0,
    //         'openingData': 0,
    //         'recordsTotal': 0,
    //         'recordsFiltered': 0,
    //         'data': [],
    //         'total_balance': 0
    //       };
    //       return res.send(obj);
    //     }

    //     let dataCount=await Sys.App.Services.AllUsersTransactionHistoryServices.getByData(query);
    //     let data = await Sys.App.Services.AllUsersTransactionHistoryServices.getByData(query, null, { sort, limit: length, skip: start });

    //     // let dataCount=await Sys.App.Services.AllUsersTransactionHistoryServices.getByData(query);
    //     // let data = await Sys.App.Services.AllUsersTransactionHistoryServices.getByData(query, null, { sort, limit: length, skip: start });
    //     for (let index = 0; index < data.length; index++) {
    //       if (data[index].type == "rake") {
    //         let gameData = await Sys.App.Services.GameService.getSingleGameData({ gameNumber: data[index].gameNumber }, ['gameNumber', 'rakePercenage', 'rakeCap']);
    //         data[index].gameId = gameData._id;
    //         data[index].from = data[index].rackFrom;
    //         data[index].in = data[index].totalRack;
    //         total_balance = data[index].totalRack ? parseFloat(total_balance) + parseFloat(data[index].totalRack) : total_balance;
    //         data[index].transactionNumber = data[index]._id;
    //         data[index].type = "Rake";
    //         if (!gameData.rakeCap.length) {
    //           data[index].remark = data[index].rackPercent + "% " + "Rake Amount Of " + parseFloat(((data[index].won * gameData.rakePercenage) / 100)).toFixed(2);
    //         } else {
    //           data[index].remark = "Total Rake Amount of " + gameData.rakeCap[0].totalRackOfGame;
    //         }
    //         data[index].afterBalance = data[index].rackToAfter_balance;
    //         data[index].beforeBalance = data[index].rackToBefore_balance;
    //       } else if (data[index].type != "rake") {
    //         data[index].from = data[index].providerEmail;
    //         data[index].in = data[index].type == "deposit" ? data[index].chips : undefined;
    //         data[index].out = data[index].type == "deduct" ? data[index].chips : undefined;
    //         total_balance = data[index].type == "deposit" ? parseFloat(total_balance) + parseFloat(data[index].chips) : parseFloat(total_balance) - parseFloat(data[index].chips)
    //         // data[index].remark = data[index].type == "deposit" ? "Received By " + data[index].providerEmail : "Transfer To " + data[index].providerEmail;
    //         if (data[index].isTournament == 'true') {
    //           data[index].remark = data[index].remark
    //           data[index].from = data[index].receiverName
    //           data[index].transactionNumber = data[index]._id
    //         } else {
    //           data[index].remark = data[index].type == "deposit" ? "Received By " + data[index].providerEmail : "Transfer To " + data[index].providerEmail;
    //         }
    //       }
    //     }
    //     if (dataCount) {
    //       let openingData = dataCount[0].beforeBalance ? dataCount[0].beforeBalance : dataCount[0].rackToBefore_balance;
    //       let closingData = dataCount[(parseInt(dataCount.length) - 1)].afterBalance ? dataCount[(parseInt(dataCount.length) - 1)].afterBalance : dataCount[(parseInt(dataCount.length) - 1)].rackToAfter_balance
    //       totalTrx = openingData - closingData
    //       if (type == 'deduct') {
    //         totalTrx = Math.abs(totalTrx)
    //       }
    //     }

    //     var obj = {
    //       'draw': req.query.draw,
    //       'closingData': closingData,
    //       'openingData':openingData,
    //       'recordsTotal': dataCount,
    //       'recordsFiltered': dataCount,
    //       'data': data[0].thirdData,
    //       'total_balance': totalTrx
    //     };
    //     res.send(obj);
    //   } catch (e) {
    //     console.log("Error", e);
    //   }
    // },

    //***********************************************************Player Reports******************************************************************** */
    playerReports: async function(req, res) {
        try {
            let query = { agentId: req.session.details.id };
            var players = req.session.details.role != "admin" ? await Sys.App.Services.PlayerServices.getPlayerDatatable(query, null, null, ['username']) : await Sys.App.Services.PlayerServices.getPlayerDatatable({}, null, null, ['username']);
            // var types = [{ name: "all", value: "All" }, { name: "entry", value: "Entry Game" }, { name: "buyIn", value: "Buy In" }, { name: "newhand", value: "Game Starting Chips" }, { name: "totalbet", value: "Total Bet Amount" }, { name: "rake", value: "Rake" }, { name: "winner", value: "Game Win" }, { name: "revert", value: "Revert Chips" }, { name: "leave", value: "Game Leave" }, { name: "deposit", value: "Deposit" }, { name: "withdraw", value: "Withdraw" }]
            var types = [{ name: "all", value: "All" }, { name: "entry", value: "Tournament Entry" }, { name: "leave", value: "Tournament Leave" }, { name: "addChips", value: "Game Join" }, { name: "leftChips", value: "Game left" }, { name: "deposit", value: "Deposit" }, { name: "deduct", value: "Withdraw" }]

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                types: types,
                players: players,
                error: req.flash("error"),
                success: req.flash("success"),
                playerActive: 'active',
                reportMenu: 'active'
            };
            return res.render('reports/playerReports', data);
        } catch (e) {
            console.log("Error", e);
        }
    },
    getPlayerReportData: async function(req, res) {
        try {
            let player = req.query.hasOwnProperty('player') ? req.query.player : '';
            let types = req.query.hasOwnProperty('types') ? req.query.types : '';
            let search = req.query.search.value;
            let start_date = new Date(req.query.startDate)
            let end_date = new Date(req.query.endDate)
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            var sort = { 'createdAt': 1 };
            end_date.setHours(23, 59, 59, 999);
            let id = ""
            let query = { _id: req.query.player };
            let players = await Sys.App.Services.PlayerServices.getSinglePlayerData(query, null, null, ['agentId', 'agentRole', 'username'])
            id = players.username + " < ";
            let agentId = players.agentId
            let commission = 0;
            for (let index = 0; index < 4; index++) {
                let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: mongoose.Types.ObjectId(agentId), }, null, null, ['id', 'parentId', 'level', 'commission', 'username'])
                if (agent) {
                    id = id + agent.username
                    if (agent.level == 4) {
                        id = id + " (" + agent.commission + "%)"
                        commission = agent.commission;
                    } else {
                        console.log("agent.commission", agent.commission);

                        id = id + " (" + (agent.commission - commission) + "%)"
                        commission = agent.commission;
                    }
                    agentId = agent.parentId
                    if (agent.level == 2) {
                        id = id + " < Admin (" + (100 - commission) + "%)"
                        break;
                    } else {
                        id = id + " < "
                    }
                } else {
                    id = id + "Admin(100%) "
                    break;
                }
            }
            // query = {};
            // query.receiverId = player;
            query = { $or: [{ receiverId: player }, { user_id: player }] };
            if (req.query.startDate && req.query.endDate) {
                query.createdAt = { "$gte": new Date(start_date), "$lte": new Date(end_date) }
            }
            if (search) {
                query.sessionId = { $regex: '.*' + search + '.*' };
            }
            if (types && types != "all") {
                query.type = types
            } else {
                query.type = { '$nin': ['winner', 'lose'] }
            }

            let playerData = await Sys.App.Services.ChipsHistoryServices.getDataAggregate(query, length, start, sort);
            let total_balance = 0
            if (playerData[0].thirdData) {
                for (var i = 0; i < playerData[0].thirdData.length; i++) {
                    // playerData[0].thirdData[i].gameNumber=playerData[0].thirdData[i].gameNumber ?  req.session.details.role == "admin" ? '<a href="/game/allGameHistory/' + playerData[0].thirdData[i].gameId + '">' + playerData[0].thirdData[i].gameNumber + '</a>':  '<a >' + playerData[0].thirdData[i].gameNumber + '</a>' :"-";
                    playerData[0].thirdData[i].sessionId = playerData[0].thirdData[i].sessionId ? '<a target="_blank"  href="/playerReports/' + playerData[0].thirdData[i].uniqId + '/' + playerData[0].thirdData[i].sessionId + '/' + (playerData[0].thirdData[i].isTournament ? playerData[0].thirdData[i].isTournament : "false") + '">' + playerData[0].thirdData[i].sessionId + '</a>' : "-";
                    if (playerData[0].thirdData[i].category == 'credit') {
                        total_balance = parseFloat(total_balance) + parseFloat(playerData[0].thirdData[i].chips)
                        total_balance = parseFloat(total_balance) - parseFloat(playerData[0].thirdData[i].bet_amount)
                    } else if (playerData[0].thirdData[i].category == 'debit') {
                        total_balance = parseFloat(total_balance) - parseFloat(playerData[0].thirdData[i].chips)
                    }
                }
            }
            if (playerData[0].thirdData.length) {
                playerData[0].thirdData.unshift({ createdAt: playerData[0].thirdData[0].createdAt, sessionId: "-", transactionNumber: "-", chips: "0", afterBalance: playerData[0].thirdData.length ? playerData[0].firstData[0].firstRecord.previousBalance || playerData[0].firstData[0].firstRecord.beforeBalance : 0, type: "Opening", remark: "Opening Balance" })
            }
            var closingBalance = playerData[0].thirdData.length ? playerData[0].firstData[0].lastRecords.afterBalance : 0;
            var amount = closingBalance;
            if (players.currency) {
                var currency = await Sys.App.Services.CurrencyServices.getByData({ 'currencyCode': players.currency });
                var setting = await Sys.App.Services.SettingsServices.getSettingsData({});
                if (setting.ratePerChip) {
                    if (currency[0].usdPerUnit) {
                        amount = amount * setting.ratePerChip * currency[0].usdPerUnit;
                    } else {
                        amount = amount * setting.ratePerChip;
                    }
                }
                amount = amount + ' ' + players.currency;
            } else {
                amount = amount + ' USD';
            }

            var obj = {
                'App': Sys.Config.App.details,
                Agent: req.session.details,
                'draw': req.query.draw,
                'recordsTotal': playerData[0].thirdData.length ? playerData[0].secondData[0].count : 0,
                'recordsFiltered': playerData[0].thirdData.length ? playerData[0].secondData[0].count : 0,
                'data': playerData[0].thirdData,
                'openingData': playerData[0].thirdData.length ? playerData[0].firstData[0].firstRecord.previousBalance || playerData[0].firstData[0].firstRecord.beforeBalance : 0,
                'closingData': closingBalance,
                'id': id,
                'total_balance': total_balance,
                'amount': amount
            };
            res.send(obj);
        } catch (e) {
            console.log("getPlayerReportData Error: ", e);
        }
    },
    getAllPlayerGameData: async function(req, res) {
        try {
            let types = req.query.hasOwnProperty('types') ? req.query.types : '';
            let sessionId = req.query.hasOwnProperty('sessionId') ? req.query.sessionId : '';
            let userId = req.query.hasOwnProperty('userId') ? req.query.userId : '';
            let search = req.query.search.value;
            let start_date = new Date(req.query.startDate)
            let end_date = new Date(req.query.endDate)
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            var sort = { 'createdAt': 1 };
            end_date.setHours(23, 59, 59, 999);
            let id = ""
            let query = { uniqId: userId };
            let players = await Sys.App.Services.PlayerServices.getSinglePlayerData(query, null, null, ['agentId', 'agentRole', 'username'])
            id = players.username + " < ";
            let agentId = players.agentId
            let commission = 0;
            for (let index = 0; index < 4; index++) {
                let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: mongoose.Types.ObjectId(agentId), }, null, null, ['id', 'parentId', 'level', 'commission', 'username'])
                if (agent) {
                    id = id + agent.username
                    if (agent.level == 4) {
                        id = id + " (" + agent.commission + "%)"
                        commission = agent.commission;
                    } else {
                        console.log("agent.commission", agent.commission);
                        id = id + " (" + (agent.commission - commission) + "%)"
                        commission = agent.commission;
                    }
                    agentId = agent.parentId
                    if (agent.level == 2) {
                        id = id + " < Admin (" + (100 - commission) + "%)"
                        break;
                    } else {
                        id = id + " < "
                    }
                } else {
                    id = id + "Admin(100%) "
                    break;
                }
            }
            query = {}
            query.sessionId = sessionId;
            if (req.query.startDate && req.query.endDate) {
                query.createdAt = { "$gte": new Date(start_date), "$lte": new Date(end_date) }
            }
            if (search) {
                query.gameNumber = { $regex: '.*' + search + '.*' };
            }
            if (types && types != "all") {
                query.type = types
            } else {
                query.type = { '$in': ['winner', 'lose'] }
            }
            console.log("query: ", query);
            var playerData = await Sys.App.Services.ChipsHistoryServices.getDataAggregate(query, length, start, sort);


            for (var i = 0; i < playerData[0].thirdData.length; i++) {
                playerData[0].thirdData[i].gameNumber = playerData[0].thirdData[i].gameNumber ? req.session.details.role == "admin" ? '<a target="_blank" href="/game/allGameHistory/' + playerData[0].thirdData[i].gameId + '">' + playerData[0].thirdData[i].gameNumber + '</a>' : '<a >' + playerData[0].thirdData[i].gameNumber + '</a>' : "-";
            }

            if (playerData[0].thirdData.length) {
                playerData[0].thirdData.unshift({ createdAt: playerData[0].thirdData[0].createdAt, sessionId: "-", transactionNumber: "-", chips: "0", afterBalance: playerData[0].thirdData.length ? playerData[0].firstData[0].firstRecord.previousBalance || playerData[0].firstData[0].firstRecord.beforeBalance : 0, type: "Opening", remark: "Opening Balance" })
            }
            var obj = {
                'App': Sys.Config.App.details,
                Agent: req.session.details,
                'draw': req.query.draw,
                'recordsTotal': playerData[0].secondData.length ? playerData[0].secondData[0].count : 0,
                'recordsFiltered': playerData[0].secondData.length ? playerData[0].secondData[0].count : 0,
                'data': playerData[0].thirdData,
                'openingData': playerData[0].firstData.length ? playerData[0].firstData[0].firstRecord.previousBalance : 0.00,
                'closingData': playerData[0].firstData.length ? playerData[0].firstData[0].lastRecords.afterBalance : 0.00,
                'id': id,
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e)
        }


    },
    allPlayerGame: async function(req, res) {
        try {
            let types = [{ name: "all", value: "All" }, { name: "winner", value: "Game Win" }, { name: "lose", value: "Game Lose" }]
            if (req.params.isTournament) {
                let tournamentNumber = req.params.sessionId.split(/-/)[1]
                console.log("tournamentNumber:-", tournamentNumber);
                var tournamentDetails = await Sys.App.Services.TournamentServices.getTourData({ tournamentNumber: tournamentNumber });
            }
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                types: types,
                sessionId: req.params.sessionId,
                entryFee_chips: req.params.isTournament != "true" ? 0 : tournamentDetails.entry_fee + tournamentDetails.buy_in,
                stacks_chips: req.params.isTournament != "true" ? 0 : tournamentDetails.stacks_chips,
                userId: req.params.uniqId,
                isTournament: req.params.isTournament,
                error: req.flash("error"),
                success: req.flash("success"),
                playerActive: 'active',
                reportMenu: 'active'
            };
            return res.render('reports/playerGameReports', data);
        } catch (e) {
            console.log("Error", e)
        }
    },


    //***********************************************************All User Chips******************************************************************** */
    allUser: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                allUsersChips: 'active',
                reportMenu: 'active'
            };
            return res.render('reports/allUsersChips', data);
        } catch (e) {
            console.log("Error", e);
        }
    },
    allUserGetData: async function(req, res) {
        try {
            let search = req.query.search.value;
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let sort = { 'createdAt': -1 };
            // let start_date = new Date(req.query.startDate);
            let start_date = req.query.startDate;
            let totalChips = 0;
            // let end_date = new Date(req.query.endDate);
            let end_date = req.query.endDate;
            // end_date.setHours(23, 59, 59, 999);
            let query = {};
            if (search) { query = { $or: [{ username: { $regex: '.*' + search + '.*' } }, { userId: { $regex: '.*' + search + '.*' } }, { email: { $regex: '.*' + search + '.*' } }] } }
            if (req.query.startDate && req.query.endDate) {
                query.createdAt = { "$gte": start_date, "$lte": end_date }
            }
            let dataCount = await Sys.App.Services.ChipsHistoryServices.getDailyReportsData(query);

            for (let index = 0; index < dataCount.length; index++) {
                totalChips = totalChips + dataCount[index].chips;
            }
            console.log(query);

            let data = await Sys.App.Services.ChipsHistoryServices.getDailyReportsData(query, length, start, sort);
            // for (let index = 0; index < data.length; index++) {
            //     data.splice(index,1)
            //   }

            // }
            let setting = await Sys.App.Services.SettingsServices.getSettingsData({}, ['systemChips']);
            let system_balance = setting.systemChips

            let obj = {
                'recordsTotal': dataCount.length,
                'recordsFiltered': dataCount.length,
                'draw': req.query.draw,
                'data': data,
                'total_balance': totalChips,
                'system_balance': system_balance
            };
            return res.send(obj);
        } catch (e) {
            console.log("allUserGetData Error: ", e);
        }
    },
    //***********************************************************Generate Chips By Cron******************************************************************** */
    allUserdailyBalanceReports: async function(req, res) {
        try {
            console.log("allUserdailyBalanceReports Called");
            let the_interval = 5 * 60 * 1000 // minute  // hr  // timeout value 
            let start_date = new Date();
            start_date.setHours(00, 00, 00, 000);
            let end_date = new Date();
            end_date.setHours(23, 59, 59, 999);
            let query = {}
            if (start_date && end_date) {
                query.createdAt = { "$gte": start_date, "$lte": end_date }
            }
            let dataCount = await Sys.App.Services.ChipsHistoryServices.getDailyReportsData(query);
            if (dataCount.length) {
                console.log("Already Today Reports Generated");
                return;
            }
            let runningRoom = await Sys.App.Services.RoomServices.getRoomData({ 'status': 'Running' });
            console.log("running Room length", runningRoom.length);
            if (runningRoom.length > 0) {
                let startdate = moment().format('MMMM Do YYYY, h:mm:ss A');
                console.log(startdate + " Some player play Game report will be delay in 5 minutes");
                setTimeout(() => Sys.App.Controllers.ReportsController.allUserdailyBalanceReports(), the_interval);
                return;
            }
            console.log(moment().format('MMMM  Do YYYY, h:mm:ss A') + " Reports will be start to generate");
            let waitingPlayers = []
            var waitingRoom = await Sys.App.Services.RoomServices.getRoomData({ 'status': { '$in': ['Finished', 'Waiting', 'Running'] }, "isTournamentTable": false });
            waitingRoom.map(room => {
                if (room.players) {
                    room.players.map(player => {
                        let waiting = {}
                        if (player.status != "Left") {
                            waiting = { id: mongoose.Types.ObjectId(player.id), chips: player.chips, username: player.playerName }
                            waitingPlayers.push(waiting)
                        }
                    })
                }
            })
            console.log(waitingPlayers)
            let data = [];
            let admin = await Sys.App.Services.UserServices.getSingleUserData({}, null, null, ['chips', 'email', 'role', 'rake_chips', 'extraRakeChips']);
            data = data.concat(admin)
            let agents = await Sys.App.Services.agentServices.getAgentDatatable();
            data = data.concat(agents)
            var players = await Sys.App.Services.PlayerServices.getPlayerDatatable({ isCash: true, chips: { $gte: 0.01 } }, null, null, ['username', 'chips', 'agentId', 'agentRole', 'email', 'uniqId']);
            players.map(player => {
                waitingPlayers.map(waitPlayer => {
                    if (waitPlayer.id.equals(player._id)) {
                        player.chips = parseFloat(parseFloat(player.chips) + parseFloat(waitPlayer.chips))
                        console.log("_id:-", player._id, "username:-", player.username, "chips:-", player.chips);
                    }
                })
            })
            data = data.concat(players)
            query = { isDelete: false };
            let tournamentData = []
            let tournaments = await Sys.App.Services.TournamentServices.getTouDatatable(query);
            if (tournaments) {
                tournaments.map(tournament => {
                    let tournamentObj = { _id: tournament._id, username: tournament.name, chips: tournament.tournamentTotalChips, role: "Tournament" }
                    tournamentData.push(tournamentObj)
                    console.log("_id:-", tournament._id, "username:-", tournament.name, "chips:-", tournament.tournamentTotalChips);
                })
                data = data.concat(tournamentData)
            }
            runningRoom = await Sys.App.Services.RoomServices.getRoomData({ 'status': 'Running', "isTournamentTable": false });
            console.log("running Room length", runningRoom.length);
            if (runningRoom.length > 0) {
                let startdate = moment().format('MMMM Do YYYY, h:mm:ss A');
                console.log(startdate + "recheck runnig room Some player play Game report will be delay in 5 minutes");
                setTimeout(() => Sys.App.Controllers.ReportsController.allUserdailyBalanceReports(), the_interval);
                return;
            }
            query = {}
            if (start_date && end_date) {
                query.createdAt = { "$gte": start_date, "$lte": end_date }
            }
            dataCount = await Sys.App.Services.ChipsHistoryServices.getDailyReportsData(query);
            if (dataCount.length) {
                console.log("Already Today Reports Generated");
                return;
            }
            runningRoom = await Sys.App.Services.RoomServices.getRoomData({ 'status': 'Running' });
            console.log("running Room length", runningRoom.length);
            if (runningRoom.length > 0) {
                let startdate = moment().format('MMMM Do YYYY, h:mm:ss A');
                console.log(startdate + "recheck runnig room Some player play Game report will be delay in 5 minutes");
                setTimeout(() => Sys.App.Controllers.ReportsController.allUserdailyBalanceReports(), the_interval);
                return;
            }
            query = {}
            if (start_date && end_date) {
                query.createdAt = { "$gte": start_date, "$lte": end_date }
            }
            dataCount = await Sys.App.Services.ChipsHistoryServices.getDailyReportsData(query);
            if (dataCount.length) {
                console.log("Already Today Reports Generated");
                return;
            }
            data.map(async details => {
                details.rake_chips = details.rake_chips ? details.rake_chips : 0
                if (details.chips != 0 || details.rake_chips != 0) {
                    await Sys.App.Services.ChipsHistoryServices.insertdailyReportsData({
                        playerId: details._id,
                        userId: details.uniqId ? details.uniqId : details.email ? details.email : " ",
                        username: details.username ? details.username : details.role == "admin" ? "admin" : "",
                        main_chips: details.chips ? parseFloat(parseFloat(details.chips)) : "",
                        rake_chips: details.rake_chips ? parseFloat(details.rake_chips) : "",
                        chips: details.role == "admin" ? parseFloat(parseFloat(details.chips) + parseFloat(details.rake_chips) + parseFloat(details.extraRakeChips)) : parseFloat(parseFloat(details.chips) + parseFloat(details.rake_chips)),
                        role: details.role ? details.role : "",
                        email: details.email ? details.email : "",
                        parentId: details.parentId ? details.parentId : "",
                        level: details.level ? details.level : "",
                        agentId: details.agentId ? details.agentId : "",
                        agentRole: details.agentRole ? details.agentRole : ""
                    });
                }
            })
            console.log(moment().format('MMMM Do YYYY, h:mm:ss A') + " All users chips history Done");
        } catch (e) {
            console.log("allUserdailyBalanceReports Error: ", e);
        }
    },
    //***********************************************************System chips reports data get Data ******************************************************************** */

    systemChips: async function(req, res) {
        try {
            var types = [{ name: "all", value: "Deposit/Withdraw" }, { name: "deposit", value: "Deposit" }, { name: "deduct", value: "Withdraw" }]
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                types: types,
                systemChips: 'active',
                reportMenu: 'active'
            };
            return res.render('reports/systemReports', data);
        } catch (e) {
            console.log("Error", e);
        }
    },
    systemChipsGetData: async function(req, res) {
        try {
            let type = req.query.hasOwnProperty('types') ? req.query.types : '';
            let totalTrx = 0;
            let search = req.query.search.value;
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let start_date = req.query.startDate;
            let end_date = req.query.endDate;
            var sort = { 'createdAt': 1 };
            let query = {};
            query.receiverId = "System";
            if (type == "all") { query.type = { '$in': ["deposit", "deduct"] } } else if (type == "deposit") {
                query.type = { '$in': ["deposit"] }
                query.isTournament = { '$ne': 'true' }
            } else if (type == "deduct") {
                query.type = { '$in': ["deduct"] }
                query.isTournament = { '$ne': 'true' }
            }
            if (search) { query.transactionNumber = { $regex: '.*' + search + '.*' } }
            if (req.query.startDate && req.query.endDate) {
                query.createdAt = { "$gte": start_date, "$lte": end_date }
            }
            let dataCount = await Sys.App.Services.AllUsersTransactionHistoryServices.getByData(query);
            let data = await Sys.App.Services.AllUsersTransactionHistoryServices.getByData(query, null, { sort, limit: length, skip: start });

            for (let index = 0; index < data.length; index++) {
                data[index].from = data[index].providerEmail;
                data[index].in = data[index].type == "deposit" ? data[index].chips : undefined;
                data[index].out = data[index].type == "deduct" ? data[index].chips : undefined;
                // totalTrx=data[index].type == "deposit"?  parseInt(totalTrx) +  parseInt(data[index].chips):   parseInt(totalTrx) - parseInt(data[index].chips)
            }
            let setting = await Sys.App.Services.SettingsServices.getSettingsData({}, ['systemChips']);
            console.log(setting);

            let systemTrx = setting.systemChips
            if (type == 'deduct') {
                totalTrx = Math.abs(totalTrx)
            }
            // if(dataCount.length){
            //   let openingData= dataCount[0].beforeBalance;
            //   let closingData= dataCount[(parseInt(dataCount.length) - 1)].afterBalance ;
            //   totalTrx= openingData-closingData

            // }

            let obj = {
                'recordsTotal': dataCount.length,
                'recordsFiltered': dataCount.length,
                'draw': req.query.draw,
                'data': data,
                'system_balance': systemTrx,
                // 'total_balance': totalTrx
            };
            return res.send(obj);
        } catch (e) {
            console.log("allUserGetData Error: ", e);
        }
    },
    //***********************************************************Error reports  ******************************************************************** */

    errorReports: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                errorReports: 'active',
                reportMenu: 'active'
            };
            return res.render('reports/errorReports', data);
        } catch (e) {
            console.log("Error", e);
        }
    },
    errorReportsGetData: async function(req, res) {
        try {
            let search = req.query.search.value;
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let sort = { 'createdAt': -1 };
            let start_date = req.query.startDate;
            let end_date = req.query.endDate;

            console.log(start_date, end_date);

            let query = {};
            let totalChips = 0;
            if (search) { query = { gameNumber: { $regex: '.*' + search + '.*' } } }
            if (req.query.startDate && req.query.endDate) {
                query.createdAt = { "$gte": start_date, "$lte": end_date }
            }
            let dataCount = await Sys.App.Services.errorReportServices.getData(query);
            console.log(query);

            for (let index = 0; index < dataCount.length; index++) {
                totalChips = totalChips + dataCount[index].gameTotalChips;
            }
            let data = await Sys.App.Services.errorReportServices.getData(query, length, start, sort);

            let obj = {
                'recordsTotal': dataCount.length,
                'total_balance': totalChips,
                'recordsFiltered': dataCount.length,
                'draw': req.query.draw,
                'data': data,
            };
            return res.send(obj);
        } catch (e) {
            console.log("allUserGetData Error: ", e);
        }
    },
    //***********************************************************Transaction reports  ******************************************************************** */
    transactionReports: async function(req, res) {
        try {
            var types = [{ name: "all", value: "All" }, { name: "deposit", value: "Deposit" }, { name: "deduct", value: "Withdraw" }]
            var category = [{ name: "player", value: "Player" }, { name: "agent", value: "Agent" }];
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                transactionReports: 'active',
                reportMenu: 'active',
                types: types,
                category: category
            };
            return res.render('reports/allTransactionsReport', data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    transactionReportsGetData: async function(req, res) {
        try {
            let type = req.query.hasOwnProperty('types') ? req.query.types : '';
            // let category =  req.query.hasOwnProperty('category') ? req.query.category : '';
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let startDate = req.query.startDate;
            let endDate = req.query.endDate;
            var sort = { 'createdAt': 1 };
            let query = {};
            if (type == "all") {
                query.type = { '$in': ["deposit", "deduct"] }
            } else if (type == "deposit") {
                query.type = { '$in': ["deposit"] }
            } else if (type == "deduct") {
                query.type = { '$in': ["deduct"] }
            }
            query.isTournament = { '$nin': ["true"] }
            if (req.query.startDate && req.query.endDate) {
                query.createdAt = { "$gte": startDate, "$lte": endDate }
            }
            let data, dataCount;
            dataCount = await Sys.App.Services.AllUsersTransactionHistoryServices.getByData(query);
            data = await Sys.App.Services.AllUsersTransactionHistoryServices.getByData(query, null, { sort, limit: length, skip: start });
            for (let index = 0; index < data.length; index++) {
                data[index].in = data[index].type == "deposit" ? data[index].chips : undefined;
                data[index].out = data[index].type == "deduct" ? data[index].chips : undefined;
                // data[index].receiverId  ,receiverRole 
                if (data[index].receiverRole == "Player") {
                    let players = await Sys.App.Services.PlayerServices.getPlayerDatatable({ _id: data[index].receiverId }, null, null, ['username']);
                    data[index].receiverUsername = players[0].username ? players[0].username : "";
                } else if (data[index].receiverRole == "admin") {
                    let players = await Sys.App.Services.UserServices.getSingleUserData({ _id: data[index].receiverId }, null, null, ['username'])
                    data[index].receiverUsername = "admin";
                } else {
                    let players = await Sys.App.Services.agentServices.getAgentDatatable({ _id: data[index].receiverId }, null, null, ['username'])
                    data[index].receiverUsername = players[0] ? players[0].username : "";
                }
                if (data[index].providerRole == "Player") {
                    let players = await Sys.App.Services.PlayerServices.getPlayerDatatable({ _id: data[index].providerId }, null, null, ['username']);
                    data[index].providerUsername = players[0].username ? players[0].username : "";

                } else if (data[index].providerRole == "admin") {
                    let players = await Sys.App.Services.UserServices.getSingleUserData({ _id: data[index].providerId }, null, null, ['username'])
                    data[index].providerUsername = "admin"
                } else {
                    let players = await Sys.App.Services.agentServices.getAgentDatatable({ _id: data[index].providerId }, null, null, ['username'])
                    data[index].providerUsername = players[0] ? players[0].username : "";

                }
            }
            let obj = {
                'recordsTotal': dataCount.length,
                'recordsFiltered': dataCount.length,
                'draw': req.query.draw,
                'data': data

            };
            return res.send(obj);

        } catch (e) {
            console.log("Error", e);
        }
    },
    //***********************************************************plyAllTransaction reports  ******************************************************************** */

    plyAllTransaction: async function(req, res) {
        try {
            let query = { parentId: req.session.details.id };
            var players = req.session.details.role != "admin" ? await Sys.App.Services.PlayerServices.getPlayerDatatable(query, null, null, ['username']) : await Sys.App.Services.PlayerServices.getPlayerDatatable({}, null, null, ['username']);

            //console.log("plyAllTransaction players: ", players);

            var types = [{ name: "all", value: "All" }, { name: "rake", value: "Rake" }, { name: "deposit", value: "Deposit" }, { name: "deduct", value: "Withdraw" }]
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                players: players,
                types: types,
                error: req.flash("error"),
                success: req.flash("success"),
                agentActive: 'active',
                reportMenu: 'active'
            };
            return res.render('reports/playerAllTrans', data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    plyAllTransactionGetData: async function(req, res) {
        try {

            var start = parseInt(req.query.start);
            var length = parseInt(req.query.length);
            var search = req.query.search.value;
            var query = {};

            if (search != '') {
                query = {
                    $or: [
                        { 'username': new RegExp(search, 'g') },
                        { 'gameNumber': new RegExp(search, 'g') }
                    ]
                }
            }

            if (req.query.user_id) {
                query.user_id = req.query.user_id;
            }

            if (req.query.startDate) {
                let start_date = new Date(req.query.startDate);
                let end_date = new Date(req.query.endDate);

                end_date.setHours(23);
                end_date.setMinutes(59);
                end_date.setSeconds(59);

                query.createdAt = { "$gte": start_date, "$lte": end_date };
            }

            console.log("query: ", query);

            var transactionAllData = await Sys.App.Services.playerTransactionHistoryService.getAllData(query);
            var transactionData = await Sys.App.Services.playerTransactionHistoryService.getByDataNew(query, length, start, { createdAt: '-1' });

            var obj = {
                'draw': req.query.draw,
                'recordsTotal': transactionAllData.length,
                'recordsFiltered': transactionAllData.length,
                'data': transactionData
            };
            res.send(obj);
        } catch (error) {
            console.log("Error when get player all transaction data: ", error);
        }
    },


    playerOldReports: async function(req, res) {
        try {
            let query = { agentId: req.session.details.id };
            var players = req.session.details.role != "admin" ? await Sys.App.Services.PlayerServices.getPlayerDatatable(query, null, null, ['username']) : await Sys.App.Services.PlayerServices.getPlayerDatatable({}, null, null, ['username']);
            // var types = [{ name: "all", value: "All" }, { name: "entry", value: "Entry Game" }, { name: "buyIn", value: "Buy In" }, { name: "newhand", value: "Game Starting Chips" }, { name: "totalbet", value: "Total Bet Amount" }, { name: "rake", value: "Rake" }, { name: "winner", value: "Game Win" }, { name: "revert", value: "Revert Chips" }, { name: "leave", value: "Game Leave" }, { name: "deposit", value: "Deposit" }, { name: "withdraw", value: "Withdraw" }]
            var types = [{ name: "all", value: "All" }, { name: "entry", value: "Tournament Entry" }, { name: "leave", value: "Tournament Leave" }, { name: "winner", value: "Game Win" }, { name: "lose", value: "Lose Game" }, { name: "deposit", value: "Deposit" }, { name: "withdraw", value: "Withdraw" }]

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                types: types,
                players: players,
                error: req.flash("error"),
                success: req.flash("success"),
                playerOldactive: 'active',
                reportMenu: 'active'
            };
            return res.render('reports/playerOldReports', data);
        } catch (e) {
            console.log("Error", e);
        }
    },
    getPlayerOldReportData: async function(req, res) {
        try {
            let player = req.query.hasOwnProperty('player') ? req.query.player : '';
            let types = req.query.hasOwnProperty('types') ? req.query.types : '';
            let search = req.query.search.value;
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let start_date = new Date(req.query.startDate)
            let end_date = new Date(req.query.endDate)
            end_date.setHours(23, 59, 59, 999);

            let id = ""
            let query = { _id: req.query.player };
            var players = await Sys.App.Services.PlayerServices.getSinglePlayerData(query, null, null, ['agentId', 'agentRole', 'username'])
            id = players.username + " < ";
            let agentId = players.agentId
            let commission = 0;
            for (let index = 0; index < 4; index++) {
                let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: mongoose.Types.ObjectId(agentId), }, null, null, ['id', 'parentId', 'level', 'commission', 'username'])
                if (agent) {
                    id = id + agent.username
                    if (agent.level == 4) {
                        id = id + " (" + agent.commission + "%)"
                        commission = agent.commission;
                    } else {
                        console.log("agent.commission", agent.commission);

                        id = id + " (" + (agent.commission - commission) + "%)"
                        commission = agent.commission;
                    }
                    agentId = agent.parentId
                    if (agent.level == 2) {
                        id = id + " < Admin (" + (100 - commission) + "%)"
                        break;
                    } else {
                        id = id + " < "
                    }
                } else {
                    id = id + "Admin(100%) "
                    break;
                }
            }
            query = {};
            // query.user_id = player;
            query = { $or: [{ receiverId: player }, { user_id: player }] };


            if (req.query.startDate && req.query.endDate) {
                query.createdAt = { "$gte": start_date, "$lte": end_date }
            }
            if (search) {
                query.gameNumber = { $regex: '.*' + search + '.*' };
            }
            if (types && types != "all") {
                query.type = types
            }
            console.log("query: ", query);
            var sort = { 'createdAt': 1 };
            var playerRecordCount = await Sys.Game.CashGame.Texas.Services.ChipsServices.getOldData(query);

            var openingData = playerRecordCount[0];
            var closingData = playerRecordCount[(parseInt(playerRecordCount.length) - 1)];

            console.log("openingData: ", openingData);
            console.log("closingData: ", closingData);

            var playerRecord = await Sys.Game.CashGame.Texas.Services.ChipsServices.getOldData(query, length, start, sort);

            var allData = [];
            let total_balance = 0
            for (var i = 0; i < playerRecord.length; i++) {
                var record = playerRecord[i];

                var inData = '-';
                var outData = '-';
                var chips = '-'
                if (record.chips) {
                    var chips = parseFloat(record.chips).toFixed(2);
                }

                if (record.category == 'debit') {
                    outData = chips;
                }
                if (record.category == 'credit') {
                    if (record.bet_amount) {
                        outData = parseFloat(record.bet_amount).toFixed(2);
                    }
                    inData = chips;
                }

                if (record.gameNumber) {
                    if (req.session.details.role == "admin") {
                        var gameNumber = '<a href="/game/allGameHistory/' + record.gameId + '">' + record.gameNumber + '</a>';
                    } else {
                        var gameNumber = '<a >' + record.gameNumber + '</a>';
                    }
                } else {
                    var gameNumber = '-';
                }

                if (record.afterBalance) {
                    var afterBalance = parseFloat(record.afterBalance).toFixed(2);
                } else {
                    var afterBalance = 0.00;
                }

                total_balance = inData != '-' ? parseFloat(total_balance) + parseFloat(inData) : total_balance
                total_balance = outData != '-' ? parseFloat(total_balance) - parseFloat(outData) : total_balance

                var playerData = {
                    createdAt: record.createdAt,
                    gameNumber: gameNumber,
                    transactionNumber: record._id,
                    from: record.username,
                    in: inData,
                    out: outData,
                    afterBalance: afterBalance,
                    type: record.type,
                    remark: record.remark,

                };
                allData.push(playerData);
            }

            var obj = {
                'App': Sys.Config.App.details,
                Agent: req.session.details,
                'draw': req.query.draw,
                'recordsTotal': playerRecordCount.length,
                'recordsFiltered': playerRecordCount.length,
                'data': allData,
                'openingData': openingData,
                'closingData': closingData,
                'id': id,
                'total_balance': total_balance
            };
            res.send(obj);
        } catch (e) {
            console.log("getPlayerReportData Error: ", e);
        }
    },

    errorReportValidation: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                errorReportValidation: 'active',
                reportMenu: 'active'
            };
            return res.render('reports/errorReportValidation', data);
        } catch (e) {
            console.log("Error", e);
        }
    },
    errorReportValidationGetData: async function(req, res) {
        try {
            let search = req.query.search.value;
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let sort = { 'createdAt': -1 };
            let start_date = req.query.startDate;
            let end_date = req.query.endDate;

            console.log(start_date, end_date);

            let query = {};
            let totalChips = 0;
            if (search) { query = { gameNumber: { $regex: '.*' + search + '.*' } } }
            if (req.query.startDate && req.query.endDate) {
                query.createdAt = { "$gte": start_date, "$lte": end_date }
            }
            let dataCount = await Sys.App.Services.errorReportServices.getErrorReportValidationData(query);
            console.log(query);

            for (let index = 0; index < dataCount.length; index++) {
                totalChips = totalChips + dataCount[index].gameTotalChips;
            }
            let data = await Sys.App.Services.errorReportServices.getErrorReportValidationData(query, length, start, sort);

            let obj = {
                'recordsTotal': dataCount.length,
                'total_balance': totalChips,
                'recordsFiltered': dataCount.length,
                'draw': req.query.draw,
                'data': data,
            };
            return res.send(obj);
        } catch (e) {
            console.log("allUserGetData Error: ", e);
        }
    },


}