var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');

const moment = require('moment');
module.exports = {

    /**
     * Cash Game - Texas (Shubham)
     */
    getTableList: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                cashTexasActive: 'active',
                type: 'normal',
                tableType: 'req.params.type'
            };
            console.log("DATA", data)
            return res.render('cashGame/poker-texas/texas', data);
        } catch (e) {
            console.log("Error in getTableList", e);
            return new Error(e);
        }
    },

    getHoldemTableList: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                cashTexasActive: 'active',
                type: 'normal',
                tableType: 'req.params.type'
            };
            console.log("DATA", data)
            return res.render('cashGame/poker-texas/texas', data);
        } catch (e) {
            console.log("Error in getTableList", e);
            return new Error(e);
        }
    },

    getOmahaTableList: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                cashTexasActive: 'active',
                type: 'normal',
                tableType: 'req.params.type'
            };
            console.log("DATA", data)
            return res.render('cashGame/poker-texas/omaha', data);
        } catch (e) {
            console.log("Error in getTableList", e);
            return new Error(e);
        }
    },
    getAddTable: async function(req, res) {
        try {
            let settings = await Sys.App.Services.SettingsServices.getSettingsData({});
            let stacks = await Sys.App.Services.StacksServices.getByData({});
            let minutes = [];
            for (let i = 1; i <= 60; i++) {
                minutes.push(i);
            }

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                cashTexasActive: 'active',
                settings: settings,
                minutes: minutes,
                stacks: stacks,
                maxPlayers: Sys.Config.App.maxPlayers,
                type: 'normal',
                tableType: 'texas'
            };
            return res.render('cashGame/poker-texas/add', data);
        } catch (e) {
            console.log("Error in getAddTable", e);
            return new Error(e);
        }
    },

    saveTable: async function(req, res) {
        try {
            let stacksData = await Sys.App.Services.StacksServices.getStacksData({
                _id: req.body.stacks
            });
            if (!stacksData || stacksData instanceof Error) {
                req.flash('error', 'Error Fetching Stacks Data');
            }

            let settingsData = await Sys.App.Services.SettingsServices.getSettingsData({});
            if (!settingsData || settingsData instanceof Error) {
                req.flash('error', 'Error Fetching Rake Percenage');
            }

            let roomCount = await Sys.App.Services.RoomServices.getLastTable();
            if (roomCount instanceof Error) {
                req.flash('error', 'Error Fetching Room Count');
            }

            var isPassword = 1;
            if (req.body.tablePrivacy == "private" && req.body.tablePassword == "") {
                var isPassword = 0;
            }
            let tableNumber = 1
            if (roomCount.length != 0) {
                let [lastTableName, lastTableNumber] = roomCount[0].tableNumber.split('T');
                tableNumber = parseInt(Number(lastTableNumber) + 1);
            }
            // let [lastTableName, lastTableNumber] = roomCount[0].tableNumber.split('T');
            // let tableNumber = parseInt(Number(lastTableNumber) + 1);
            // console.log("isCashgame", req.body.isCashgame)

            var tablePassword = "";
            if (req.body.tablePrivacy == "private") {
                var tablePassword = req.body.tablePassword;
            }
            minBuyIn = req.body.minBuyIn
            if (req.body.limit == 'limit') {
                // Limit Game
                // minBuyIn = parseFloat(parseFloat(stacksData.maxStack) * 10); // minimun Buy in Amount 
                maxBuyIn = 0; // No Limit in Max Buyin Game.
            } else if (req.body.limit == 'no_limit') {
                // No Limit
                // minBuyIn = parseFloat(parseFloat(stacksData.minStack) * 80);
                maxBuyIn = parseFloat(parseFloat(stacksData.maxStack) * 100);
                maxBuyIn = minBuyIn >= maxBuyIn ? minBuyIn * 2 : maxBuyIn;
            } else {
                // Pot Limit
                // minBuyIn = parseFloat(parseFloat(stacksData.minStack) * 80);
                maxBuyIn = parseFloat(parseFloat(stacksData.maxStack) * 100);
                maxBuyIn = minBuyIn >= maxBuyIn ? minBuyIn * 2 : maxBuyIn;
            }

            console.log("isPassword: ", isPassword);
            if (isPassword == 1) {
                let newTableData = await Sys.App.Services.RoomServices.insertTableData({
                    isTournamentTable: false,
                    tournamentType: '-',
                    tournament: '-',
                    gameType: 'normal',
                    tableType: req.body.tableType,
                    isCashGame: req.body.isCashGame,
                    currencyType: (req.body.isCashGame == 'true') ? 'cash' : 'chips',
                    otherData: {
                        gameSpeed: req.body.gameSpeed
                    },
                    name: req.body.name,
                    smallBlind: stacksData.minStack,
                    bigBlind: stacksData.maxStack,
                    smallBlindIndex: 0,
                    bigBlindIndex: 0,
                    minPlayers: req.body.minPlayers,
                    maxPlayers: req.body.maxPlayers,
                    rackPercent: settingsData.rakePercenage,
                    //minBuyIn      : parseFloat(stacksData.minStack*80),
                    //maxBuyIn      : parseFloat(stacksData.maxStack*200),
                    minBuyIn: minBuyIn,
                    maxBuyIn: maxBuyIn,
                    tableNumber: 'T' + tableNumber,
                    status: "Waiting",
                    owner: 'admin',
                    dealer: 0,
                    turnBet: [],
                    turnTime: 0,
                    players: [],
                    gameWinners: [],
                    gameLosers: [],
                    game: null,
                    currentPlayer: 0,
                    limit: req.body.limit,
                    timerStart: false,
                    tablePrivacy: req.body.tablePrivacy,
                    tablePassword: req.body.tablePassword,
                    isGPSRestriction: req.body.isGPSRestriction,
                    isIPAddressRestriction: req.body.isIPAddressRestriction,
                    radiousPoint: req.body.radiousPoint,
                    timeBank: req.body.timeBank,
                });

                if (newTableData instanceof Error) {
                    req.flash('error', newTableData.message);
                } else {
                    req.flash('success', 'Table Created Successfully.');
                }
                if (req.body.tableType == 'omaha') {
                    res.redirect('/omaha');
                } else {
                    res.redirect('/holdem');
                }

            } else {
                flash('error', 'Please enter table password');
                return res.redirect('/table/add');
            }
        } catch (e) {
            console.log('Error in saveTable', e);
            return new Error(e);
        }
    },



    /**
      Sit && Go Tournament 
    **/
    settings: async function(req, res) {
        try {
            let settings = await Sys.App.Services.SettingsServices.getSettingsData({});
            let stacks = await Sys.App.Services.StacksServices.getByData({});
            let minutes = [];
            for (let i = 1; i <= 60; i++) {
                minutes.push(i);
            }
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                sitGoActive: 'active',
                settings: settings,
                minutes: minutes,
                stacks: stacks
            };

            return res.render('sitGoTournament/setting', data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    sitNGosettingPostDataAdd: async function(req, res) {
        try {
            let settings = await Sys.App.Services.SettingsServices.insertSettingsData({
                sit_n_go_tur_blind_levels: parseFloat(req.body.sit_n_go_tur_blind_levels),
                sit_n_go_tur_1st_payout: parseFloat(req.body.sit_n_go_tur_1st_payout),
                sit_n_go_tur_2st_payout: parseFloat(req.body.sit_n_go_tur_2st_payout),
                sit_n_go_tur_3st_payout: parseFloat(req.body.sit_n_go_tur_3st_payout),
                sit_n_go_tur_breaks_start_time: parseFloat(req.body.sit_n_go_tur_breaks_start_time),
                sit_n_go_tur_breaks: parseFloat(req.body.sit_n_go_tur_breaks),
                sit_n_go_tur_tex_stacks: req.body.sit_n_go_tur_tex_stacks,
                sit_n_go_tur_tex_buy_in: parseFloat(req.body.sit_n_go_tur_tex_buy_in),
                sit_n_go_tur_tex_entry_fee: parseFloat(req.body.sit_n_go_tur_tex_entry_fee),
                sit_n_go_tur_omh_stacks: req.body.sit_n_go_tur_omh_stacks,
                sit_n_go_tur_omh_buy_in: parseFloat(req.body.sit_n_go_tur_omh_buy_in),
                sit_n_go_tur_omh_entry_fee: parseFloat(req.body.sit_n_go_tur_omh_entry_fee),
                sit_n_go_tur_default_game_play_chips: parseFloat(req.body.sit_n_go_tur_default_game_play_chips)
            });
            req.flash('success', 'Sit & Go Tournament create successfully');
            res.redirect('/sit-go-tournament/sitGTouSetting');
        } catch (e) {
            console.log("Error", e);
        }
    },

    sitNGosettingPostDataUpdate: async function(req, res) {
        try {
            let newSettings = await Sys.App.Services.SettingsServices.updateSettingsData({
                _id: req.params.id
            }, {
                sit_n_go_tur_blind_levels: parseFloat(req.body.sit_n_go_tur_blind_levels),
                sit_n_go_tur_1st_payout: parseFloat(req.body.sit_n_go_tur_1st_payout),
                sit_n_go_tur_2st_payout: parseFloat(req.body.sit_n_go_tur_2st_payout),
                sit_n_go_tur_3st_payout: parseFloat(req.body.sit_n_go_tur_3st_payout),
                sit_n_go_tur_breaks_start_time: parseFloat(req.body.sit_n_go_tur_breaks_start_time),
                sit_n_go_tur_breaks: parseFloat(req.body.sit_n_go_tur_breaks),
                sit_n_go_tur_tex_stacks: req.body.sit_n_go_tur_tex_stacks,
                sit_n_go_tur_tex_buy_in: parseFloat(req.body.sit_n_go_tur_tex_buy_in),
                sit_n_go_tur_tex_entry_fee: parseFloat(req.body.sit_n_go_tur_tex_entry_fee),
                sit_n_go_tur_omh_stacks: req.body.sit_n_go_tur_omh_stacks,
                sit_n_go_tur_omh_buy_in: parseFloat(req.body.sit_n_go_tur_omh_buy_in),
                sit_n_go_tur_omh_entry_fee: parseFloat(req.body.sit_n_go_tur_omh_entry_fee),
                sit_n_go_tur_default_game_play_chips: parseFloat(req.body.sit_n_go_tur_default_game_play_chips)

            });
            req.flash('success', 'Sit & Go Tournament update successfully');
            res.redirect('/sit-go-tournament/sitGTouSetting');
        } catch (e) {
            console.log("Error", e);
        }
    },





}