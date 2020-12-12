var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');
var parseInt = require('parse-int');
const rolesArray = ['admin', 'master', 'agent', 'childAgent'];
var moment = require('moment-timezone');
var jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const gameURL = Sys.Config.Texas.gameURL;

var jwtcofig = {
    'secret': 'AisJwtAuth'
};

module.exports = {

    player: async function(req, res) {
        try {

            // update isLatest flag to 1
            /*await Sys.App.Services.PlayerServices.updateMultiplePlayerData(
            {
              isLatest: '0'
                // image: req.files.image.name
              },{
                isLatest: '1',
              }
              )*/
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                playerActive: 'active',
                PlayerMenu: 'active menu-open',
                currency: await Sys.App.Services.CurrencyServices.getByData({}),
                setting: await Sys.App.Services.SettingsServices.getSettingsData({})
            };
            return res.render('player/player', data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    getPlayer: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;
            let type = req.query.type;
            let query = { isCash: (type === 'true') };

            if (search != '') {
                query = { isCash: (type === 'true'), username: { $regex: '.*' + search + '.*' } };
            }
            let columns = [
                'id',
                'username',
                'firstname',
                'lastname',
                'email',
                'chips',
                'status',
                'isBot',
            ]
            if (req.session.details.role == "admin") {
                query.agentId = req.session.details.id;
            } else if (req.session.details.role == "senior") {
                query.seniorAgentId = req.session.details.id;
            } else if (req.session.details.role == "master") {
                query.masterAgentId = req.session.details.id;
            } else if (req.session.details.role == "agent") {
                query.agentId = req.session.details.id;
            }
            console.log({ query })
            let playersCount = await Sys.App.Services.PlayerServices.getPlayerCount(query);
            //console.log(playersCount);
            //let playersCount = playersC.length;console.log(playersCount);

            let data = await Sys.App.Services.PlayerServices.getPlayerDatatable(query, length, start);

            for (let i = 0; i < data.length; i++) {
                let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: data[i].agentId }, ['username']);
                if (agent == null) {
                    data[i].agentName = 'admin'
                } else {
                    data[i].agentName = agent.username
                }
            }

            var obj = {
                'draw': req.query.draw,
                'recordsTotal': playersCount,
                'recordsFiltered': playersCount,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
        }
    },

    getActivePlayer: async function(req, res) {

        try {

            let query = {};
            let data = await Sys.App.Services.PlayerServices.getPlayerData(query);
            var obj = {
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
        }
    },

    addPlayer: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                playerActive: 'active',
                currency: await Sys.App.Services.CurrencyServices.getByData({}),
                country: ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"]
            };
            return res.render('player/add', data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    addPlayerPostData: async function(req, res) {
        try {
            // res.send(req.files.image.name); return;
            let player = await Sys.App.Services.PlayerServices.getPlayerData({ email: req.body.email });
            if (player && player.length > 0) {
                req.flash('error', 'Player Already Present');
                res.redirect('/player');
                return;

            } else {

                let player = await Sys.App.Services.PlayerServices.getPlayerData({ username: req.body.username });
                if (player && player.length > 0) {
                    req.flash('error', 'Username Already Exist');
                    res.redirect('/player');
                    return;

                } else {
                    let statistics = {
                        cashgame: {
                            noOfPlayedGames: 0,
                            totalWonGame: 0,
                            totalLoseGame: 0
                        },
                        sng: {
                            noOfPlayedGames: 0,
                            totalWonGame: 0,
                            totalLoseGame: 0
                        },
                        tournament: {
                            noOfPlayedGames: 0,
                            totalWonGame: 0,
                            totalLoseGame: 0
                        }
                    };
                    var playerObj = {
                        username: req.body.username,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        mobile: req.body.mobile,
                        email: req.body.email,
                        gender: req.body.gender,
                        isBot: req.body.bot,
                        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null),
                        device_id: 'abcd',
                        chips: 0,
                        diamonds: 0,
                        agentRole: req.session.details.role,
                        agentId: req.session.details.id,
                        isCash: true,
                        socketId: '1234',
                        statistics: statistics,
                        country: req.body.country,
                        currency: req.body.currency
                        // image: req.files.image.name
                    };
                    if (req.session.details.role === "senior") {
                        playerObj.seniorAgentId = req.session.details.id;
                    }
                    if (req.session.details.role === "master") {
                        playerObj.seniorAgentId = req.session.details.parentId;
                        playerObj.masterAgentId = req.session.details.id;
                    }
                    if (req.session.details.role === "agent") {
                        let agent = await Sys.App.Services.agentServices.getAgentData({ _id: req.session.details.parentId });
                        if (agent && agent.length > 0) {
                            if (agent[0].role == "senior") {
                                playerObj.seniorAgentId = agent[0].id;
                            }
                            if (agent[0].role == "master") {
                                playerObj.seniorAgentId = agent[0].parentId;
                                playerObj.masterAgentId = agent[0].id;
                            }
                        }
                    }
                    await Sys.App.Services.PlayerServices.insertPlayerData(playerObj)
                    req.flash('success', 'Player create successfully');
                    res.redirect('/player');
                }
            }
            // req.flash('success', 'Player Registered successfully');
            // res.redirect('/');
        } catch (e) {
            console.log("Error", e);
        }
    },

    editPlayer: async function(req, res) {
        try {
            let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: req.params.id });
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                playerActive: 'active',
                player: player,
                currency: await Sys.App.Services.CurrencyServices.getByData({}),
                country: ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"]
            };
            req.session.playerBack = req.header('Referer');
            return res.render('player/add', data);
            // res.send(player);
        } catch (e) {
            console.log("Error", e);
        }
    },


    editPlayerPostData: async function(req, res) {
        try {
            let player = await Sys.App.Services.PlayerServices.getPlayerData({ _id: req.params.id });
            if (player && player.length > 0) {

                if (req.files) {
                    let image = req.files.image;

                    // Use the mv() method to place the file somewhere on your server 
                    image.mv('/profile/' + req.files.image.name, function(err) {
                        if (err) {
                            req.flash('error', 'User Already Present');
                            return res.redirect('/');
                        }

                        // res.send('File uploaded!');
                    });
                }

                let data = {
                    username: req.body.username,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    mobile: req.body.mobile,
                    // email: req.body.email,
                    gender: req.body.gender,
                    isBot: req.body.bot,
                    accountNumber: req.body.accountNumber,
                        // status: req.body.bot,
                        // password : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null),
                        // password : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null)
                        // image: req.files.image.name
                    country: req.body.country,
                    currency: req.body.currency
                }
                if (req.body.password && req.body.password != '') {
                    data.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);

                }
                // console.log('data',data); return false;

                await Sys.App.Services.PlayerServices.updatePlayerData({ _id: req.params.id }, data)
                req.flash('success', 'Player update successfully');
                res.redirect('/playerEdit/' + req.params.id);
                return;
                //res.redirect('/player');

            } else {
                req.flash('error', 'No User found');
                res.redirect(req.session.playerBack);
                //res.redirect('/player');
                return;
            }
            // req.flash('success', 'Player Registered successfully');
            // res.redirect('/');
        } catch (e) {
            console.log("Error", e);
        }
    },


    getPlayerDelete: async function(req, res) {
        try {
            let player = await Sys.App.Services.PlayerServices.getPlayerData({ _id: req.body.id });
            if (player || player.length > 0) {
                await Sys.App.Services.PlayerServices.deletePlayer(req.body.id)
                return res.send("success");
            } else {
                return res.send("error");
            }
        } catch (e) {
            console.log("Error", e);
        }
    },

    active: async function(req, res) {

        try {

            let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: req.body.id });
            if (player || player.length > 0) {
                if (player.status == 'active') {
                    await Sys.App.Services.PlayerServices.updatePlayerData({
                        _id: req.body.id
                    }, {
                        status: 'Block'
                    })
                } else {
                    await Sys.App.Services.PlayerServices.updatePlayerData({
                        _id: req.body.id
                    }, {
                        status: 'active'
                    })
                }
                //req.flash('success','Status updated successfully');
                return res.send("success");
            } else {
                return res.send("error");
                req.flash('error', 'Problem while updating Status.');
            }

        } catch (e) {
            console.log("Error", e);
        }
    },

    inActive: async function(req, res) {

        try {

            let player = await Sys.App.Services.PlayerServices.getPlayerData({ _id: req.body.id });
            if (player || player.length > 0) {

                await Sys.App.Services.PlayerServices.updatePlayerData({
                    _id: req.params.id
                }, {
                    status: 'inactive'
                })
                return res.send("success");
            } else {
                return res.send("error");
            }
        } catch (e) {
            console.log("Error", e);
        }
    },

    convert: async function(req, res) {
        try {
            let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: req.body.id });
            if (player || player.length > 0) {
                if (!player.isCash) {
                    const superAdmin = await Sys.App.Services.UserServices.getSingleUserData({ isSuperAdmin: true });
                    await Sys.App.Services.PlayerServices.updatePlayerData({
                        _id: req.body.id
                    }, {
                        isCash: true,
                        chips: 0,
                        agentRole: req.session.details.role,
                        agentId: req.session.details.id,
                    })
                }
                //req.flash('success','Status updated successfully');
                return res.send("success");
            } else {
                return res.send("error");
            }
        } catch (error) {

        }
    },
    chipsAdd: async function(req, res) {
        try {
            console.log("This is prohibited!", req.body);
            res.send({ 'status': 'fail', 'message': "This is prohibited!" });

            /*console.log("chipsAdd req.body: ", req.body);

              var data = {
                App : Sys.Config.App.details,Agent : req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                 playerActive : 'active',
              };
              let operation = req.body.chipsValue;
              let chipsUpdate = req.body.chips;
              let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id: req.body.playerId});
              if (player || player.length >0) {

               if(operation == 'Add') {
                newChips = parseFloat(player.chips + parseFloat(req.body.chips));

                let transactionAdminAddData = {
                  user_id: player.id,
                  username: player.username,
                  chips: parseFloat(req.body.chips),
                  previousBalance: parseFloat(player.chips),
                  afterBalance: parseFloat(newChips),
                  category: 'credit',
                  type: 'entry',
                  remark: 'Credit chips by Admin',
                  isTournament: 'No',
                  isGamePot: 'no'
                }

                console.log("admin chips add to player transactionAdminAddData: ", transactionAdminAddData);
                await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionAdminAddData);

              }else if(operation == 'Deduct') {
                newChips = parseFloat(player.chips - parseFloat(req.body.chips));

                let transactionAdminDebitData = {
                  user_id: player.id,
                  username: player.username,
                  chips: parseFloat(req.body.chips),
                  previousBalance: parseFloat(player.chips),
                  afterBalance: parseFloat(newChips),
                  category: 'debit',
                  type: 'entry',
                  remark: 'Debit chips by Admin',
                  isTournament: 'No',
                  isGamePot: 'no'
                }

                console.log("admin chips add to player transactionAdminDebitData: ", transactionAdminDebitData);
                await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionAdminDebitData);
              }

              await Sys.App.Services.PlayerServices.updatePlayerData(
              {
                _id: req.body.playerId
              },{
                chips:eval(parseFloat( newChips).toFixed(2) ),
              }
              );

              req.flash("success",'Chips updated successfully');
              res.redirect( req.header('Referer') );
              //res.redirect('/player');

            }else{
              return res.flash("error");
            }*/
        } catch (e) {
            console.log("Error", e);
            req.flash('error', 'Problem while updating Chips.');
        }
    },

    getChipsNotes: async function(req, res) {
        try {
            var noteDetail = await Sys.App.Services.agentServices.getSingleChipsNote({ 'requestById': req.session.details.id, 'requestToId': req.body.player_id });
            console.log("noteDetail: ", noteDetail);
            res.send({ 'status': 'success', 'message': 'chips note', data: noteDetail });
        } catch (e) {
            console.log("Error when get chips note: ", e)
            res.send({ 'status': 'fail', 'message': 'Player chips note not availabel' });
        }
    },

    updateChipsNotes: async function(req, res) {
        try {

            if (req.body.requestType == "Update") {

                var noteId = req.body.noteId;
                var noteDetail = req.body.edit_chips_note;
                await Sys.App.Services.agentServices.updateChipsNoteData({ '_id': noteId }, { 'note': noteDetail });

                req.flash("success", 'Note updated successfully');
            } else {
                await Sys.App.Services.agentServices.insertChipsNoteData({
                    requestById: req.session.details.id,
                    requestToId: req.body.agentId,
                    note: req.body.edit_chips_note,
                    type: 'player'
                });

                req.flash("success", 'Note save successfully');
            }


            let backURL = '/player';
            res.redirect(backURL);
        } catch (e) {
            req.flash("error", 'Note note update');
            let backURL = '/player';
            res.redirect(backURL);
        }
    },

    chipsAction: async function(req, res) {
        try {
            console.log("in chipsAction")
            let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).format("YYYY-MM-DD HH:mm");
            let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).format("YYYY-MM-DD HH:mm");
            let current_date = moment(new Date()).format("YYYY-MM-DD HH:mm");
            if ((current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status == 'active') || Sys.Setting.maintenance.quickMaintenance == "active") {
                req.flash('error', 'Maintenance mode is on please try again later.');
                res.send({ 'status': 'fail', 'message': 'Server under maintenance' });
            } else {
                let operation = req.body.action;
                let playerDetails = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: req.body.playerId });
                if (req.session.details.is_admin == 'yes') {
                    let transaction = {
                        to: req.body.playerId,
                        from: req.session.details.id,
                        chips: req.body.chips,
                        fromRole: 'admin',
                        action: operation,
                        toRole: 'player'
                    }
                    let response = await Sys.Helper.Poker.Transaction(transaction);
                    console.log(response);
                } else if (req.session.details.is_admin != 'yes' && playerDetails.agentId == req.session.details.id) {
                    let transaction = {
                        to: req.body.playerId,
                        from: req.session.details.id,
                        chips: req.body.chips,
                        fromRole: req.session.details.role,
                        toRole: 'player',
                        action: operation,
                    }
                    let response = await Sys.Helper.Poker.Transaction(transaction);
                    console.log(response);
                } else if (req.session.details.is_admin != 'yes' && playerDetails.agentId != req.session.details.id) {
                    res.send({ status: 'fail', result: null, message: 'No Player Found' });
                    let backURL = req.header('Referer') || '/agents';
                    res.redirect(backURL);
                    return;
                }
                var noteDetail = await Sys.App.Services.agentServices.getSingleChipsNote({ 'requestById': req.session.details.id, 'requestToId': req.body.playerId });
                if (noteDetail == null) {
                    await Sys.App.Services.agentServices.insertChipsNoteData({
                        requestById: req.session.details.id,
                        requestToId: req.body.playerId,
                        note: req.body.chips_note,
                        type: 'player'
                    });
                } else {
                    await Sys.App.Services.agentServices.updateChipsNoteData({ '_id': noteDetail._id }, { 'note': req.body.chips_note });
                }
                req.flash("success", 'Chips updated successfully');
                let backURL = req.header('Referer') || '/agents';
                res.redirect(backURL);
                return;
            }
        } catch (e) {
            console.log("Error", e);
            // res.send({ status : 'fail', result : null,   message : 'No Player Found'   });
            req.flash('error ', e.message);
            return res.redirect('/agents');
        }
    },



    chipsHistory: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                playerId: req.params.id,
                playerActive: 'active',
            };
            return res.render('player/chipsHistory', data);
        } catch (e) {
            console.log("Error", e);
        }

    },

    getChipsHistory: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;

            let query = {};
            if (search != '') {
                let capital = search;
                query = { username: { $regex: '.*' + search + '.*' }, user_id: req.params.id };
            } else {
                query = { user_id: req.params.id };
            }
            let columns = [
                'id',
                'username',
                'firstname',
                'lastname',
                'email',
                'chips',
                'status',
                'isBot',
            ]

            let chipsCount = await Sys.App.Services.ChipsHistoryServices.getChipsHistoryCount(query);
            //let chipsCount = chipsC.length;
            console.log(chipsCount);
            let data = await Sys.App.Services.ChipsHistoryServices.getChipsDatatable(query, length, start);
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': chipsCount,
                'recordsFiltered': chipsCount,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
        }
    },

    cashTransactionHistory: async function(req, res) {
        try {

            let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: req.params.id });

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                playerId: req.params.id,
                player: player,
                playerActive: 'active',
            };
            return res.render('player/cashTransactionHistory', data);
        } catch (e) {
            console.log("Error", e);
        }

    },

    getCashTransactionHistory: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;
            let query = {};
            let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: req.params.id });
            if (player.isCash == true) {
                if (search != '') {
                    query = { $and: [{ $or: [{ 'receiverId': req.params.id }, { user_id: req.params.id }] }, { email: { $regex: '.*' + search + '.*' } }] }
                } else {
                    query = { $or: [{ 'receiverId': req.params.id }, { user_id: req.params.id }] };
                }
                query.type = { '$nin': ['winner', 'lose'] }

                var countData = await Sys.App.Services.AllUsersTransactionHistoryServices.getCount(query);
                var data = await Sys.App.Services.AllUsersTransactionHistoryServices.getByData(query, null, { skip: start, limit: length, sort: { createdAt: -1 } });
            } else {
                if (search != '') {
                    query = { 'playerId': req.params.id, transactionNumber: { $regex: '.*' + search + '.*' } };
                } else {
                    query = { 'playerId': req.params.id };
                }

                var countData = await Sys.App.Services.ChipsHistoryServices.getCashTransactionHistoryCount(query);
                var data = await Sys.App.Services.ChipsHistoryServices.getCashTransactionDatatable(query, length, start);
            }

            var obj = {
                'draw': req.query.draw,
                'recordsTotal': countData,
                'recordsFiltered': countData,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
        }
    },

    getCashTransactionHistoryNew: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;

            let query = {};
            /*if (search != '') {
              let capital = search;
              query = { transactionNumber: { $regex: '.*' + search + '.*' } , playerId : req.params.id};
            } else {
              query = { playerId : req.params.id };
            }

            let chipsCount = await Sys.App.Services.ChipsHistoryServices.getCashTransactionHistoryCount(query);
            let data = await Sys.App.Services.ChipsHistoryServices.getCashTransactionDatatable(query, length, start);*/

            let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: req.params.id });

            console.log("player: ", player);

            if (search != '') {
                query = { 'receiverId': req.params.id, email: { $regex: '.*' + search + '.*' } };
            } else {
                query = { 'receiverId': req.params.id };
            }
            let Count = await Sys.App.Services.AllUsersTransactionHistoryServices.getCount(query);
            let data = await Sys.App.Services.AllUsersTransactionHistoryServices.getByData(query, null, { skip: start, limit: length, sort: { createdAt: -1 } });
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': Count,
                'recordsFiltered': Count,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
        }
    },

    loginHistory: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                playerId: req.params.id,
                playerActive: 'active',
            };
            return res.render('player/loginHistory', data);
        } catch (e) {
            console.log("Error", e);
        }

    },

    getLoginHistory: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;

            let query = {};
            if (search != '') {
                let capital = search;
                query = { email: { $regex: '.*' + search + '.*' }, player: req.params.id };
            } else {
                query = { player: req.params.id };
            }
            let columns = [
                'id',
                'username',
                'firstname',
                'lastname',
                'email',
                'chips',
                'status',
                'isBot',
            ]

            let loginCount = await Sys.App.Services.ChipsHistoryServices.getLoginHistoryCount(query);
            //let loginCount = loginC.length;
            let data = await Sys.App.Services.ChipsHistoryServices.getLoginDatatable(query, length, start);
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': loginCount,
                'recordsFiltered': loginCount,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
        }
    },

    allPlayers: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                allPlayers: 'true',
                myPlayerActive: 'active',
                PlayerMenu: 'active menu-open'
            };
            return res.render('player/player', data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    getAllPlayers: async function(req, res) {

        // res.send(req.query.start); return false;
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;
            let type = req.query.type;
            console.log("TYPE", type)
            let query = { isCash: (type === 'true') };
            if (search != '') {
                query = { isCash: (type === 'true'), username: { $regex: '.*' + search + '.*' } };
            }

            let allPlayersCount = await Sys.App.Services.PlayerServices.getPlayerCount(query);
            await Sys.App.Services.PlayerServices.getPlayerCount(query);
            // let allPlayersCount = playersC.length;
            let data = await Sys.App.Services.PlayerServices.getPlayerDatatable(query, length, start);
            //let data = await Sys.App.Services.PlayerServices.getPlayerData(query);

            for (let i = 0; i < data.length; i++) {
                let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: data[i].agentId }, ['username'])
                if (agent == null) {
                    data[i].agentName = 'admin'
                } else {
                    data[i].agentName = agent.username
                }
            }

            var obj = {
                'draw': req.query.draw,
                'recordsTotal': allPlayersCount,
                'recordsFiltered': allPlayersCount,
                'data': data,
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
        }
    },


    //player's game history
    gameHistory: async function(req, res) {

        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                playerId: req.params.id,
                playerHistoryActive: 'active',
            };
            return res.render('player/gameHistory', data);
        } catch (e) {
            console.log(e);
            return new Error("Error", e);
        }
    },

    getPlayerGameHistory: async function(req, res) {
        try {

            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;

            let query = { history: { $elemMatch: { playerId: req.params.id } } };
            if (search != '') {
                query = { gameNumber: { $regex: '.*' + search + '.*' }, history: { $elemMatch: { playerId: req.params.id } } };
            }

            let gameCount = await Sys.App.Services.GameService.getGameCount(query);
            console.log("total game count", gameCount);
            let data = await Sys.App.Services.GameService.getGameDatatable(query, length, start);
            //let data = await Sys.App.Services.PlayerServices.getPlayerData(query);
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': gameCount,
                'recordsFiltered': gameCount,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            return new Error("Error", e);
            console.log(e);
        }
    },

    playerProfile: async function(req, res) {
        try {
            var date = new Date();
            let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: req.params.id });
            let gamePlayed = await Sys.App.Services.gameStatisticsServices.getCount({ player: req.params.id });
            let gamewon = await Sys.App.Services.gameStatisticsServices.getCount({ player: req.params.id, result: 'Won' });
            let gameLost = await Sys.App.Services.gameStatisticsServices.getCount({ player: req.params.id, result: 'Lost' });

            //START: Today rack
            var startDate = new Date();
            var endDate = new Date();
            endDate.setHours(23, 59, 59, 999);

            console.log("today startDate: ", startDate);
            console.log("today endDate: ", endDate);

            let todaysRake = [{
                    $match: {
                        rackToId: req.session.details.id,
                        rackFromId: req.params.id,
                        createdAt: {
                            $gte: startDate,
                            $lt: endDate,
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: '$totalRack' },
                    }
                }
            ];
            let todaysTotalRack = await Sys.App.Services.RackHistoryServices.aggregateQuery(todaysRake);
            console.log("today rack", todaysTotalRack);
            var todayRakeTotal = 0.00;
            if (todaysTotalRack.length > 0) {
                var todayRakeTotal = parseFloat(todaysTotalRack[0].count).toFixed(2);
            }
            //END: Today rack

            //START: Weekally rack
            var start_date = moment().subtract(7, 'days');
            var startDate = new Date(start_date);
            var endDate = new Date();
            endDate.setHours(23, 59, 59, 999);

            console.log("Weekally startDate: ", startDate);
            console.log("Weekally endDate: ", endDate);

            let weekallyRake = [{
                    $match: {
                        rackToId: req.session.details.id,
                        rackFromId: req.params.id,
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate,
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: '$totalRack' },
                    }
                }
            ];
            let weekallyTotalRack = await Sys.App.Services.RackHistoryServices.aggregateQuery(weekallyRake);
            console.log("Weekally rack", weekallyTotalRack);
            var weekallyRakeTotal = 0.00;
            if (weekallyTotalRack.length > 0) {
                var weekallyRakeTotal = parseFloat(weekallyTotalRack[0].count).toFixed(2);
            }
            //END: Weekally rack

            //START: Monthally rack
            var start_date = moment().subtract(1, 'months');
            var startDate = new Date(start_date);
            var endDate = new Date();
            endDate.setHours(23, 59, 59, 999);

            console.log("Monthally startDate: ", startDate);
            console.log("Monthally endDate: ", endDate);

            let monthallyRake = [{
                    $match: {
                        rackToId: req.session.details.id,
                        rackFromId: req.params.id,
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate,
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: '$totalRack' },
                    }
                }
            ];
            let monthallyTotalRack = await Sys.App.Services.RackHistoryServices.aggregateQuery(monthallyRake);
            console.log("monthally rack", monthallyTotalRack);
            var monthallyRakeTotal = 0.00;
            if (monthallyTotalRack.length > 0) {
                var monthallyRakeTotal = parseFloat(monthallyTotalRack[0].count).toFixed(2);
            }
            //END: Monthally rack
            console.log({ player })
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                player: player,
                gamePlayed: gamePlayed,
                gamewon: gamewon,
                gameLost: gameLost,
                curentYear: date.getFullYear(),
                todayRakeTotal: todayRakeTotal,
                weekallyRakeTotal: weekallyRakeTotal,
                monthallyRakeTotal: monthallyRakeTotal,
            };

            return res.render('player/profile', data);
        } catch (e) {
            console.log("Error", e)
        }
    },

    getMonthlyGamePlayedByPlayerChart: async function(req, res) {
        console.log(req.params.id)
        let monthlyGamePlayedArray = [3, 6, 7, 1, 4, 8, 9, 78, 8, 99, 0, 5]
        console.log("============>", monthlyGamePlayedArray);
        return res.json(monthlyGamePlayedArray);
    },

    rackDeductionUpdate: async function(playerId, gameId, won, rackPercent, totalRack, rackFrom, rackTo, rackFromId, rackToId) {
        try {
            let inserdata = await Sys.App.Services.RackHistoryServices.insertData({
                'player': playerId,
                'game': gameId,
                'rackFromId': rackFromId,
                'rackToId': rackToId,
                'rackFrom': rackFrom,
                'rackTo': rackTo,
                'won': won,
                'rackPercent': rackPercent,
                'totalRack': totalRack,
                'type': "rake"
            });
        } catch (e) {
            console.log("Error in RackDeduction Update", e);
        }
    },

    rackDeduction: async function(req, res) {
        try {
            //console.log("playerId",req.body.playerId);
            let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: req.body.playerId });
            //console.log(player.username, player.agentRole, player.agentId);
            if (player.agentId !== '' && player.agentId !== null) {


                let agentRoleId = rolesArray.indexOf(player.agentRole);
                let allAgents = [player.agentId];
                let allAgentsFromToIds = [req.body.playerId, player.agentId];
                let allAgentsRole = ['player'];
                let rack = await Sys.App.Services.SettingsServices.getSettingsData({}); //get Application rack

                let totalRackDeduction = (req.body.won * rack.rakePercenage) / 100;
                let adminRack = 10;
                for (let rd = agentRoleId; rd >= 0; rd--) {
                    if (rd == 0) {

                        let master = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });

                        allAgentsRole.push('admin');


                        module.exports.rackDeductionUpdate(req.body.playerId, req.body.gameId, req.body.won, adminRack, totalRackDeduction, allAgentsRole[allAgentsRole.length - 2], allAgentsRole[allAgentsRole.length - 1], allAgentsFromToIds[allAgentsFromToIds.length - 2], allAgentsFromToIds[allAgentsFromToIds.length - 1]);
                    } else {

                        let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });
                        allAgents.push(agent.parentId);

                        allAgentsRole.push(agent.role + ' ( ' + agent.email + ')');

                        let tempRackDeduction = (totalRackDeduction * (100 - agent.commission)) / 100;
                        totalRackDeduction = totalRackDeduction - tempRackDeduction;

                        adminRack = agent.commission;

                        module.exports.rackDeductionUpdate(req.body.playerId, req.body.gameId, req.body.won, (100 - agent.commission), tempRackDeduction, allAgentsRole[allAgentsRole.length - 2], allAgentsRole[allAgentsRole.length - 1], allAgentsFromToIds[allAgentsFromToIds.length - 2], allAgentsFromToIds[allAgentsFromToIds.length - 1]);
                        allAgentsFromToIds.push(agent.parentId);
                    }
                }

            } else {
                console.log("Agent not available")
            }
            res.send(player);
        } catch (e) {
            console.log("Error in Rack Deduction", e);
        }
    },



    /*exportData : async function(req, res){
      var start = 0;
      let query = { agentId: req.session.details.id };
      let playersCount = await Sys.App.Services.PlayerServices.getPlayerCount(query);
      let data = {};
      if(start>= playersCount){
        let data = await Sys.App.Services.PlayerServices.getPlayerDatatable(query, 100, start);
        start = start+100;
      }

      res.send(data);
    }*/

    getExportedData: async function(query, pageSize, processPage) {


        let documents = await Sys.App.Services.PlayerServices.getPlayerExport(query, pageSize);
        if (!documents || documents.length < 1) {
            // stop - no data left to traverse
            return Promise.resolve();
        } else {
            if (documents.length < pageSize) {
                // stop - last page
                return processPage(documents);
            } else {

                /*return processPage(documents)
                  .then(function getNextPage(){
                    var last_id = documents[documents.length-1]['_id'];
                    query['_id'] = {'$gt' : last_id};
                    return getPage(query, pageSize, processPage);
                  });*/

                //return processPage(documents);
                //console.log("new Docs",newDocuments)
                var last_id = documents[documents.length - 1]['_id'];
                query['_id'] = { '$gt': last_id };
                console.log("query", query)
                return [processPage(documents), this.getExportedData(query, pageSize, processPage)];



            }
        }
    },

    exportData: async function(req, res) {

        /*await module.exports.getExportedData(
          { agentId: req.session.details.id },
            10000,
            function processPage(pagedDocs){
              console.log('do something with', pagedDocs);
              //res.send(pagedDocs);
            })
        */


        /*var start = 0;
        let query = { agentId: req.session.details.id };
        let playersCount = await Sys.App.Services.PlayerServices.getPlayerCount(query);
        let data = {};
        if(start>= playersCount){
          let data = await Sys.App.Services.PlayerServices.getPlayerDatatable(query, 100, start);
          start = start+100;
        }

        res.send(data);*/



        // recursison
        let data = await module.exports.getPlayerData({ agentId: req.session.details.id }, 1)
            //.then((sentence) => console.log(sentence));
        res.send(data);

    },



    getPlayerData: async function(query, pageSize) {
        let fragment = await module.exports.getPlayerDataFragment(query, pageSize);

        if (fragment.flag == 0 || fragment.flag == -1) {
            return fragment.data;
        } else {
            return fragment.data.concat(await module.exports.getPlayerData(query, pageSize));
        }
    },

    getPlayerDataFragment: async function(query, pageSize) {
        let documents = await Sys.App.Services.PlayerServices.getPlayerExport(query, pageSize);
        if (documents.length >= 1) {
            if (documents.length < pageSize) {
                //await module.exports.wait(500);
                return {
                    data: documents,
                    flag: 0,
                    //pageSize: 0;
                };
            } else {
                var last_id = documents[documents.length - 1]['_id'];
                query['_id'] = { '$gt': last_id };
                //await module.exports.wait(500);
                return {
                    data: documents,
                    query: query,
                    flag: 1,
                    //pageSize: 0;
                };

            }
        } else {
            //await module.exports.wait(500);
            return {
                data: documents,
                query: query,
                flag: -1,
                //pageSize: 0;
            };
        }
    },

    wait: function(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    },

    updateBalance: async function(req, res) {
        try {
            var players = await Sys.App.Services.PlayerServices.getByData({});
            console.log("players.length: ", players.length);
            for (var i = 0; i < players.length; i++) {
                await Sys.App.Services.PlayerServices.updatePlayerData({ _id: players[i]._id });
            }

            console.log("Players balance update")
        } catch (error) {
            console.log("Error in player controller updateBalance: ", error);
        }
    },
    updateSystemBalance: async function(req, res) {
        try {
            let waitingPlayers = []
            var waitingRoom = await Sys.App.Services.RoomServices.getRoomData({ 'status': { '$in': ['Finished', 'Waiting'] } });
            for (let index = 0; index < waitingRoom.length; index++) {
                if (waitingRoom[index].players) {
                    for (let index1 = 0; index1 < waitingRoom[index].players.length; index1++) {
                        let waiting = {}
                        if (waitingRoom[index].players[index1].status != "Left") {
                            waiting = { id: mongoose.Types.ObjectId(waitingRoom[index].players[index1].id), chips: waitingRoom[index].players[index1].chips, username: waitingRoom[index].players[index1].playerName }
                            waitingPlayers.push(waiting)
                        }
                    }
                }
            }
            let data = [];
            var admin = await Sys.App.Services.UserServices.getSingleUserData({ $or: [{ chips: { $gte: 0.01 } }, { rake_chips: { $gte: 0.01 } }, { extraRakeChips: { $gte: 0.01 } }] }, null, null, ['chips', 'email', 'role', 'rake_chips', 'extraRakeChips']);
            data = data.concat(admin)
            var agents = await Sys.App.Services.agentServices.getAgentDatatable({ $or: [{ chips: { $gte: 0.01 } }, { rake_chips: { $gte: 0.01 } }] }, null, null, ['username', 'chips', 'parentId', 'email', 'level', 'role', 'rake_chips']);
            data = data.concat(agents)
                // var players =  await Sys.App.Services.PlayerServices.getPlayerDatatable({isCash:true}, null, null, ['username','chips','agentId','agentRole','email']);
            var players = await Sys.App.Services.PlayerServices.getPlayerDatatable({ isCash: true, $or: [{ chips: { $gte: 0.01 } }, { rake_chips: { $gte: 0.01 } }] }, null, null, ['username', 'chips', 'agentId', 'agentRole', 'email', 'uniqId']);
            for (let index = 0; index < players.length; index++) {
                for (let index1 = 0; index1 < waitingPlayers.length; index1++) {
                    if (waitingPlayers[index1].username == players[index].username) {
                        players[index].chips = parseFloat(parseFloat(players[index].chips) + parseFloat(waitingPlayers[index1].chips))
                    }
                }
            }
            data = data.concat(players)
            let systemTotalBalance = 0
            for (let index = 0; index < data.length; index++) {
                data[index].rake_chips = data[index].rake_chips ? data[index].rake_chips : 0
                data[index].extraRakeChips = data[index].extraRakeChips ? data[index].extraRakeChips : 0
                let chips = data[index].chips || data[index].rake_chips || data[index].extraRakeChips ? parseFloat(parseFloat(data[index].chips) + parseFloat(data[index].rake_chips) + parseFloat(data[index].extraRakeChips)) : 0;
                systemTotalBalance = parseFloat(systemTotalBalance) - parseFloat(chips)
            }
            let settings = await Sys.App.Services.SettingsServices.getSettingsData({});
            if (settings) {
                await Sys.App.Services.SettingsServices.updateSettingsData({
                    _id: settings._id
                }, {
                    systemChips: systemTotalBalance
                });
            } else {
                console.log("Error in player controller updateBalance ");
            }
        } catch (error) {
            console.log("Error in player controller updateBalance: ", error);
        }
    },

    /* Web Login Functions */
    identifiertoken: async function(req, res) {
        try {
            console.log('identifiertoken:', req.body.id, req.body.identifiertoken);
            let player = await Sys.App.Services.PlayerServices.getPlayerData({ _id: req.body.id });
            if (player && player.length > 0) {
                let data = {
                    identifiertoken: req.body.identifiertoken
                };
                await Sys.App.Services.PlayerServices.updatePlayerData({ _id: req.body.id }, data);
                return res.send("success");
            } else {
                return res.send("error");
            }
        } catch (e) {
            console.log("Error", e);
            return res.send("error");
        }
    },

    loadWebPage: async function(req, res) {
        try {
            console.log("loadWebPage called");
            let session = null;
            if (req.session.web) {
                session = req.session.web.details;
            }

            let allLoggedInTokens = await Sys.App.Services.PlayerServices.getLoggedInTokens({});
            if (allLoggedInTokens instanceof Error) {
                allLoggedInTokens = [];
            }

            var data = {
                App: Sys.Config.App.details,
                session: session,
                error: req.flash("error"),
                success: req.flash("success"),
                allLoggedInTokens: JSON.stringify(allLoggedInTokens)
            };
            console.log("data", data);
            return res.render('web/index', data);
        } catch (e) {
            console.log("Error", e);
            return res.send("error");
        }
    },

    loadWebPageLogin: async function(req, res) {
        try {
            console.log("loadWebPageLogin called", req.session.web);
            let session = null;
            if (req.session.web) {
                session = req.session.web.details;
            }

            let allLoggedInTokens = await Sys.App.Services.PlayerServices.getLoggedInTokens({});
            if (allLoggedInTokens instanceof Error) {
                allLoggedInTokens = [];
            }

            var data = {
                App: Sys.Config.App.details,
                session: session,
                error: req.flash("error"),
                success: req.flash("success"),
                allLoggedInTokens: JSON.stringify(allLoggedInTokens)
            };
            console.log("data", data);
            return res.send(data);
            //return res.render('web/login', data);
        } catch (e) {
            console.log("Error", e);
            return res.send("error");
        }
    },

    webPlayerRegister: async function(req, res) {
        try {
            console.log("req.body", req.body);
            let data = req.body;
            data.username = data.username.toLowerCase();
            if (Sys.Setting.maintenance && (Sys.Setting.maintenance.status == 'active' || Sys.Setting.maintenance.quickMaintenance == "active")) {
                if (Sys.Setting.maintenance.quickMaintenance == "active") {
                    req.flash('error', Sys.Setting.maintenance.message + '\n We will come back very shortly!');
                } else {
                    req.flash('error', Sys.Setting.maintenance.message);
                }

                return res.redirect(gameURL);
            }

            // Check Username & Email Already Avilable
            let player = await await Sys.App.Services.PlayerServices.getSinglePlayerData({
                username: data.username
            });
            if (player) { // When Player Found
                req.flash('error', 'Username already taken.');
                return res.redirect(gameURL);
            }

            // Check Username & Email Already Avilable
            player = await await Sys.App.Services.PlayerServices.getSinglePlayerData({ email: data.mobile });
            if (player) { // When Player Found
                req.flash('error', 'Phone Number already taken.');
                return res.redirect(gameURL);
            }

            let defaultSettings = await Sys.App.Services.SettingsServices.getSettingsData();
            console.log('defaultSettings: ', defaultSettings);
            if (defaultSettings instanceof Error) {
                req.flash('error', defaultSettings.message);
                return res.redirect(gameURL);
            }
            if (!defaultSettings) {
                defaultSettings = {
                    defaultChips: 1000
                };
            }
            // const superAdmin = await Sys.App.Services.UserServices.getSingleUserData({ isSuperAdmin: true });
            // Create Player Object
            let playerObj = {
                device_id: await randomString(36),
                name: data.name,
                username: data.username,
                password: bcrypt.hashSync(data.password, 10),
                // email: data.email,
                mobile: data.mobile,
                isFbLogin: false,
                profilePic: 0,
                chips: defaultSettings.defaultChips,
                cash: 0,
                status: 'active',
                socketId: '1234',
                isCash: false,
                platform_os: 'other',
                statistics: {
                    cashgame: {
                        noOfPlayedGames: 0,
                        totalWonGame: 0,
                        totalLoseGame: 0,
                    },
                    sng: {
                        noOfPlayedGames: 0,
                        totalWonGame: 0,
                        totalLoseGame: 0,
                    },
                    tournament: {
                        noOfPlayedGames: 0,
                        totalWonGame: 0,
                        totalLoseGame: 0,
                    }
                }
            };
            player = await Sys.App.Services.PlayerServices.insertPlayerData(playerObj);
            console.log("player", player);

            if (!player) {
                req.flash('error', 'Player Not Created');
                return res.redirect(gameURL);
            } else {
                req.flash('success', 'Player Successfully Register!');
                return res.redirect(gameURL);
            }
        } catch (e) {
            Sys.Log.info('Error in create Player : ' + e);
            req.flash('error', 'Some Error Occurred');
            return res.redirect(gameURL);
        }
    },

    /* webPlayerLogin: async function(req, res){
      try {
        console.log("req.body", req.body);
        let data = req.body;
        if(Sys.Setting.maintenance.status =='active'){
          req.flash('error', Sys.Setting.maintenance.message);
          return res.redirect(gameURL);
        }

        let passwordTrue = false;
        let player = null;

        // Define Validation Rules
        let playerObj = {
          $or:[
            { username: data.username },
            { email: data.username }
          ]
        };

        player = await Sys.App.Services.PlayerServices.getSinglePlayerData(playerObj);
        // console.log("player", player);
        if(!player){
          req.flash('error', 'Wrong Username Or Email');
          return res.redirect(gameURL);
        }

        if(bcrypt.compareSync(data.password, player.password)) {
          // check if player is Active or Blocked 
          if(player.status == 'Block'){
            req.flash('error', 'Oops You are Blocked!!');
            return res.redirect(gameURL);
          }
          passwordTrue = true;
        }

        if (passwordTrue) {
          console.log("data.forceLogin", data.forceLogin);
          if(data.forceLogin){
            if(player.socketId){
              console.log("Player Force Logout Send.");
              await Sys.Io.to(player.socketId).emit('forceLogOut',{
                playerId: player.id,
                message: "You are logged off due to login from another device.",
              });
            }
          }
          else{
            if (Sys.Io.sockets.connected[player.socketId]) { 
              console.log("socket is already connected");
              req.flash('error', 'Already Logged in!!');
              return res.redirect(gameURL);
            }
          }

          player.isFbLogin = false;

          //  await Sys.Game.Common.Services.PlayerServices.updatePlayerData({
          //   _id: player.id
          // }, {
          //   socketId: socket.id,
          //   platform_os: data.os,
          // }); 
          console.log("player id on login", player.username);

          // set jwt token
          var token = jwt.sign({ id: player.id }, jwtcofig.secret, {
            expiresIn: 60 // expires in 1 minute
          });

          let loginToken = await randomString(36);
          let loginTokenData = {
            loginToken: loginToken
          }
          await Sys.App.Services.PlayerServices.updatePlayerData({
            _id: player._id
          }, loginTokenData);

          // User Authenticate Success
          req.session.web = {};
          req.session.web.login = true;
          req.session.web.details = {
            id: player.id,
            name: player.username,
            jwt_token: token,
            loggedInToken: loginToken
          };
          console.log("postLogin req.session.web.details: ", req.session.web.details);

          req.flash('success', 'Logged In Successfully!!');
          return res.redirect(gameURL);
        }
        else{
          req.flash('error', 'Invalid credentials!');
          return res.redirect(gameURL);
        }
      }
      catch (error) {
        Sys.Log.info('Error in Login : ' + error);
        req.flash('error', 'Some Error Occurred');
        return res.redirect(gameURL);
      }
    },*/

    webPlayerLogin: async function(req, res) {
        try {
            console.log("req.body", req.body);
            let data = req.body;
            let language = 'english';
            data.forceLogin = true;
            data.username = data.username.toLowerCase();

            let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).format("YYYY-MM-DD HH:mm");
            let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).format("YYYY-MM-DD HH:mm");
            let current_date = moment(new Date()).format("YYYY-MM-DD HH:mm");
            if ((current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status == 'active') || Sys.Setting.maintenance.quickMaintenance == "active") {
                if (Sys.Setting.maintenance.quickMaintenance == "active") {
                    req.flash('error', Sys.Setting.maintenance.message + '\n We will come back very shortly!');
                } else {
                    req.flash('error', Sys.Setting.maintenance.message);
                }
                return res.redirect(gameURL);
            }

            let passwordTrue = false;
            let player = null;

            // Define Validation Rules
            let playerObj = {
                $or: [
                    { username: data.username },
                    { email: data.username }
                ]
            };

            player = await Sys.App.Services.PlayerServices.getSinglePlayerData(playerObj);
            // console.log("player", player);
            if (!player) {
                req.flash('error', 'Wrong Username Or Email');
                return res.redirect(gameURL);
            }

            if (bcrypt.compareSync(data.password, player.password)) {
                // check if player is Active or Blocked 
                if (player.status == 'Block') {
                    req.flash('error', 'Oops You are Blocked!!');
                    return res.redirect(gameURL);
                }
                passwordTrue = true;
            }

            if (passwordTrue) {
                console.log("data.forceLogin", data.forceLogin);
                if (data.forceLogin) {
                    if (player.socketId) {
                        console.log("Player Force Logout Send.");
                        await Sys.Io.to(player.socketId).emit('forceLogOut', {
                            playerId: player.id,
                            message: "You are logged off due to login from another device.",
                        });
                    }
                } else {
                    if (Sys.Io.sockets.connected[player.socketId]) {
                        console.log("socket is already connected");
                        req.flash('error', 'Already Logged in!!');
                        return res.redirect(gameURL);
                    }
                }

                player.isFbLogin = false;

                //  await Sys.Game.Common.Services.PlayerServices.updatePlayerData({
                //   _id: player.id
                // }, {
                //   socketId: socket.id,
                //   platform_os: data.os,
                // }); 
                console.log("player id on login", player.username);

                // set jwt token
                var token = jwt.sign({ id: player.id }, jwtcofig.secret, {
                    expiresIn: 60 // expires in 1 minute
                });

                let loginToken = await randomString(36);
                let loginTokenData = {
                    loginToken: loginToken
                }
                await Sys.App.Services.PlayerServices.updatePlayerData({
                    _id: player._id
                }, loginTokenData);

                // User Authenticate Success
                req.session.web = {};
                req.session.web.login = true;
                req.session.web.details = {
                    id: player.id,
                    name: player.username,
                    jwt_token: token,
                    loggedInToken: loginToken
                };
                console.log("postLogin req.session.web.details: ", req.session.web.details);

                let allLoggedInTokens = await Sys.App.Services.PlayerServices.getLoggedInTokens({});
                console.log("DATAT OF ALL TOKEN", allLoggedInTokens)
                if (allLoggedInTokens instanceof Error) {
                    allLoggedInTokens = [];
                }

                let loggedInToken = req.session.web.details.loggedInToken;
                console.log("LOGGED IN TOKEN", loggedInToken);
                // allLoggedInTokens = JSON.parse(allLoggedInTokens);
                //console.log("ALL JSON LOGGED IN TOKEN",allLoggedInTokens)

                let logIn = null;
                for (let i = 0; i < allLoggedInTokens.length; i++) {
                    if (loggedInToken == allLoggedInTokens[i].loginToken) {
                        logIn = allLoggedInTokens[i].loginToken;
                    }
                }
                console.log("logIn", logIn);

                if (logIn) {
                    let playerId = req.session.web.details.id;
                    if (playerId != "") {
                        console.log("PLAYER ID", playerId);
                        let randomvalue = await randomString(36);
                        console.log("RANDOM VALUE", randomvalue);
                        let player = await Sys.App.Services.PlayerServices.getPlayerData({ _id: playerId });
                        console.log("player", player);

                        if (player && player.length > 0) {
                            let data = {
                                identifiertoken: randomvalue
                            };
                            console.log("DTATA", data);
                            let my = await Sys.App.Services.PlayerServices.updatePlayerData({ _id: playerId }, data);
                            console.log("MYYY", my);
                            return res.redirect("https://pokerscript.net/WPA/index.html?token=" + randomvalue + "&u=" + playerId + "&lang=" + language);
                        } else {
                            return res.send("error");
                        }
                    }
                    req.flash('success', 'Logged In Successfully!!');
                    return res.redirect(gameURL);
                } else {
                    req.flash('error', 'New Login Has Made.');
                    return res.redirect('/web/logout');
                }
            } else {
                req.flash('error', 'Invalid credentials!');
                return res.redirect(gameURL);
            }
        } catch (error) {
            Sys.Log.info('Error in Login : ' + error);
            req.flash('error', 'Some Error Occurred');
            return res.redirect(gameURL);
        }
    },

    webPlayerLogout: async function(req, res) {
        try {
            console.log("Web Logout");
            req.session.web = null;
            req.logout();
            req.flash('success', 'Logged Out.');
            return res.redirect(gameURL);
        } catch (e) {
            console.log("Error in logout :", e);
            return res.redirect(gameURL);
        }
    },

    accountNumberUpdateRequest: async function(req, res) {
        try {
            const data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                Agent: req.session.details,
                error: req.flash('error'),
                success: req.flash('success'),
                acctReqActive: 'active',
                PlayerMenu: 'active menu-open'
            };
            return res.render('accountUpdateRequest/accountUpdateRequuests', data);
        } catch (err) {
            console.log(err);
        }
    },

    getAccountNumberUpdateRequest: async function(req, res) {
        try {
            const { draw, start, length, type } = req.query;
            const search = req.query.search.value;
            let query = {};
            if (search != '') {
                let capital = search;
                query = {
                    agentId: req.session.details.id,
                    isCash: type === 'true',
                    username: { $regex: '.*' + search + '.*' }
                };
            } else {
                query = { action: false };
            }
            console.log({ query })
            const [requestCount, requestsData] = await Promise.all([
                Sys.App.Services.PlayerServices.getRequestCount(query),
                Sys.App.Services.PlayerServices.getRequestDataTable(query, parseInt(length), parseInt(start))
            ]);
            const obj = {
                draw: draw,
                recordsTotal: requestCount,
                recordsFiltered: requestCount,
                data: requestsData
            };
            res.send(obj);
        } catch (err) {}
    },

    UpdateAccountNumberRequest: async function(req, res) {
        try {
            const { id, flag } = req.body;
            if (flag == 1) {
                const accountInfo = await Sys.App.Services.PlayerServices.getSingleRequestData(id);
                if (!accountInfo || accountInfo instanceof Error) {
                    const obj = {
                        'success': 'failed'
                    }
                    return res.send(obj);
                }
                const updatePlayer = await Sys.App.Services.PlayerServices.updatePlayerData({ _id: accountInfo.playerId }, { accountNumber: accountInfo.accountNumber });
                console.log(updatePlayer)
                if (!updatePlayer.nModified || updatePlayer instanceof Error) {
                    const obj = {
                        'success': 'failed'
                    }
                    return res.send(obj);
                }
                const result = await Sys.App.Services.PlayerServices.updateRequestData(id);
                console.log(result)
                const obj = {
                    'success': 'success',
                    'message': 'Successfully Updated',
                }
                return res.send(obj);
            } else {
                const result = await Sys.App.Services.PlayerServices.updateRequestData(id);
                const obj = {
                    'success': 'success',
                    'message': 'Successfully Denied',
                }
                return res.send(obj);
            }
        } catch (err) {
            console.log(err)
        }
    },

    depositReceipt: async function(req, res) {
        try {
            const data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                Agent: req.session.details,
                error: req.flash('error'),
                success: req.flash('success'),
                depositActive: 'active'
            };
            await Sys.App.Services.PlayerServices.updateDepositNotification({}, { $set: { seen: true } });
            return res.render('deposit/depositReceipt', data);
        } catch (err) {
            console.log(err);
        }
    },

    getDepositReceipt: async function(req, res) {
        try {
            const { draw, start, length, type } = req.query;
            const search = req.query.search.value;
            let query = {};
            if (search != '') {
                let capital = search;
                query = {
                    agentId: req.session.details.id,
                    isCash: type === 'true',
                    username: { $regex: '.*' + search + '.*' }
                };
            } else {
                query = { action: false };
            }
            console.log({ query })
            const [depositReceiptCount, depositReceiptData] = await Promise.all([
                Sys.App.Services.PlayerServices.getDepositReceiptCount(query),
                Sys.App.Services.PlayerServices.getDepositReceiptDataTable(query, parseInt(length), parseInt(start))
            ]);
            const obj = {
                draw: draw,
                recordsTotal: depositReceiptCount,
                recordsFiltered: depositReceiptCount,
                data: depositReceiptData
            };
            res.send(obj);
        } catch (err) {}
    },

    depositHandler: async function(req, res) {
        try {
            console.log("depositHandler called")
            const { id, flag } = req.body;
            if (flag == 1) {
                const depositReceipt = await Sys.App.Services.PlayerServices.getSingleReceiptData(id);
                if (!depositReceipt || depositReceipt instanceof Error) {
                    const obj = {
                        'fail': 'fail',
                        'message': 'Deposit receipt not found'
                    }
                    return res.send(obj);
                }
                let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: depositReceipt.playerId });
                if (player) {
                    let parentAgent = await Sys.App.Services.UserServices.getSingleUserData({ _id: req.session.details.id });

                    console.log("parentAgent: ", parentAgent);

                    let newChips;
                    let parentAgentUpdatedCash;
                    if (parseFloat(parentAgent.chips) >= parseFloat(depositReceipt.depositAmount)) {
                        newChips = parseFloat(player.chips + parseFloat(depositReceipt.depositAmount));
                        parentAgentUpdatedCash = parseFloat(parentAgent.chips) - parseFloat(depositReceipt.depositAmount);

                        let transactionAdminAddData = {
                            user_id: player.id,
                            username: player.username,
                            chips: parseFloat(depositReceipt.depositAmount),
                            previousBalance: parseFloat(player.chips),
                            afterBalance: parseFloat(newChips),
                            category: 'credit',
                            type: 'entry',
                            remark: 'Credit chips by ' + parentAgent.email,
                            isTournament: 'No',
                            isGamePot: 'no'
                        }

                        console.log("agent chips add to player transactionAdminAddData: ", transactionAdminAddData);
                        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionAdminAddData);

                    } else {
                        const obj = {
                            'fail': 'fail',
                            'message': 'You have Insufficient Chips!'
                        }
                        return res.send(obj);
                    }
                    await Sys.App.Services.PlayerServices.updatePlayerData({ _id: depositReceipt.playerId }, { chips: newChips });
                    await Sys.Io.to([player.socketId]).emit('OnPlayerChipsUpdate', { playerId: player.id, playersChips: newChips });
                    await Sys.App.Services.UserServices.updateUserData({
                        _id: req.session.details.id
                    }, {
                        chips: eval(parseFloat(parentAgentUpdatedCash).toFixed(2))
                    });
                    let traNumber = +new Date()
                    await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                        'receiverId': depositReceipt.playerId,
                        'receiverRole': 'Player',
                        'providerId': parentAgent.id,
                        'providerRole': 'admin',
                        'providerEmail': parentAgent.email,
                        'chips': parseFloat(parseFloat(depositReceipt.depositAmount).toFixed(2)),
                        'cash': '',
                        'remark': 'deposit',
                        'transactionNumber': 'DEP-' + traNumber,
                        'beforeBalance': eval(parseFloat(player.chips).toFixed(2)),
                        'afterBalance': eval(parseFloat(newChips).toFixed(2)),
                        'type': 'deposit',
                        'category': 'credit',
                        'status': 'success',
                    });
                    await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                        'receiverId': parentAgent.id,
                        'receiverRole': 'admin',
                        'providerId': depositReceipt.playerId,
                        'providerRole': 'Player',
                        'providerEmail': player.username + " (player)",
                        'chips': parseFloat(parseFloat(depositReceipt.depositAmount).toFixed(2)),
                        'cash': '',
                        'remark': 'deduct',
                        'transactionNumber': 'DE-' + traNumber,
                        'beforeBalance': eval(parseFloat(parentAgent.chips).toFixed(2)),
                        'afterBalance': eval(parseFloat(parentAgentUpdatedCash).toFixed(2)),
                        'type': 'deduct',
                        'category': 'debit',
                        'status': 'success',
                    });

                    var noteDetail = await Sys.App.Services.agentServices.getSingleChipsNote({ 'requestById': req.session.details.id, 'requestToId': depositReceipt.playerId });
                    if (noteDetail == null) {
                        await Sys.App.Services.agentServices.insertChipsNoteData({
                            requestById: req.session.details.id,
                            requestToId: depositReceipt.playerId,
                            note: "deposit",
                            type: 'player'
                        });
                    } else {
                        await Sys.App.Services.agentServices.updateChipsNoteData({ '_id': noteDetail._id }, { 'note': 'deposit' });
                    }
                    const result = await Sys.App.Services.PlayerServices.updateDepositData(id, { status: 'approved', action: true });
                    const obj = {
                        'success': 'success',
                        'message': 'Successfully Updated',
                    }
                    return res.send(obj);
                } else {
                    const obj = {
                        'fail': 'fail',
                        'message': 'No Player Found'
                    }
                    return res.send(obj);
                }
            } else {
                const result = await Sys.App.Services.PlayerServices.updateDepositData(id, { status: 'Denied', action: true });
                const obj = {
                    'success': 'success',
                    'message': 'Successfully Updated',
                }
                return res.send(obj);
            }
        } catch (err) {
            const obj = {
                'fail': 'fail',
                'message': 'Something went wrong'
            }
            return res.send(obj);
        }
    },

    withdraw: async function(req, res) {
        try {
            const data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                Agent: req.session.details,
                error: req.flash('error'),
                success: req.flash('success'),
                withdrawActive: 'active'
            };
            await Sys.App.Services.PlayerServices.updateWithdrawNotification({}, { $set: { seen: true } });
            return res.render('withdraw/withdraw', data);
        } catch (err) {
            console.log(err);
        }
    },

    getWithdraw: async function(req, res) {
        try {
            const { draw, start, length, type } = req.query;
            const search = req.query.search.value;
            let query = {};
            if (search != '') {
                let capital = search;
                query = {
                    agentId: req.session.details.id,
                    isCash: type === 'true',
                    username: { $regex: '.*' + search + '.*' }
                };
            } else {
                query = { action: false };
            }
            console.log({ query })
            const [withdrawCount, withdrawData] = await Promise.all([
                Sys.App.Services.PlayerServices.getWithdrawCount(query),
                Sys.App.Services.PlayerServices.getWithdrawDataTable(query, parseInt(length), parseInt(start))
            ]);
            console.log({ withdrawData });
            const obj = {
                draw: draw,
                recordsTotal: withdrawCount,
                recordsFiltered: withdrawCount,
                data: withdrawData
            };
            res.send(obj);
        } catch (err) {}
    },

    withdrawHandler: async function(req, res) {
        try {
            console.log("withdrawHandler called")
            const { id, flag } = req.body;
            if (flag == 2) {
                const withdraw = await Sys.App.Services.PlayerServices.getSingleWithdrawData(id);
                console.log({ withdraw })
                if (!withdraw || withdraw instanceof Error) {
                    const obj = {
                        'fail': 'fail',
                        'message': 'Withdraw Request not found'
                    }
                    return res.send(obj);
                }
                let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: withdraw.playerId });
                if (player) {
                    let parentAgent = await Sys.App.Services.UserServices.getSingleUserData({ _id: req.session.details.id });

                    console.log("parentAgent: ", parentAgent);

                    let newChips;
                    let parentAgentUpdatedCash;

                    if (parseFloat(parentAgent.chips) >= parseFloat(withdraw.withdrawAmount)) {
                        newChips = parseFloat(parseFloat(player.chips) + parseFloat(withdraw.withdrawAmount));
                        parentAgentUpdatedCash = parseFloat(parentAgent.chips) - parseFloat(withdraw.withdrawAmount);

                        let transactionAdminDebitData = {
                            user_id: player.id,
                            username: player.username,
                            chips: parseFloat(withdraw.withdrawAmount),
                            previousBalance: parseFloat(player.chips),
                            afterBalance: parseFloat(newChips),
                            category: 'credit',
                            type: 'entry',
                            remark: 'Credit chips by ' + parentAgent.email,
                            isTournament: 'No',
                            isGamePot: 'no'
                        }

                        console.log("admin chips debit to player transactionAdminDebitData: ", transactionAdminDebitData);
                        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionAdminDebitData);
                    } else {
                        const obj = {
                            'fail': 'fail',
                            'message': 'Player Have Insufficient Chips!'
                        }
                        return res.send(obj);
                    }

                    await Sys.App.Services.PlayerServices.updatePlayerData({ _id: withdraw.playerId }, { chips: newChips });
                    await Sys.Io.to([player.socketId]).emit('OnPlayerChipsUpdate', { playerId: player.id, playersChips: newChips });
                    await Sys.App.Services.UserServices.updateUserData({
                        _id: req.session.details.id
                    }, {
                        chips: eval(parseFloat(parentAgentUpdatedCash).toFixed(2))
                    });
                    let traNumber = +new Date()
                    await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                        'receiverId': withdraw.playerId,
                        'receiverRole': 'Player',
                        'providerId': parentAgent.id,
                        'providerRole': 'admin',
                        'providerEmail': parentAgent.email,
                        'chips': parseFloat(parseFloat(withdraw.withdrawAmount).toFixed(2)),
                        'cash': '',
                        'remark': 'withdraw revert',
                        'transactionNumber': 'DEP-' + traNumber,
                        'beforeBalance': eval(parseFloat(player.chips).toFixed(2)),
                        'afterBalance': eval(parseFloat(newChips).toFixed(2)),
                        'type': 'deposit',
                        'category': 'credit',
                        'status': 'success',
                    });
                    await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                        'receiverId': parentAgent.id,
                        'receiverRole': 'admin',
                        'providerId': withdraw.playerId,
                        'providerRole': 'Player',
                        'providerEmail': player.username + " (player)",
                        'chips': parseFloat(parseFloat(withdraw.withdrawAmount).toFixed(2)),
                        'cash': '',
                        'remark': 'deduct',
                        'transactionNumber': 'DE-' + traNumber,
                        'beforeBalance': eval(parseFloat(parentAgent.chips).toFixed(2)),
                        'afterBalance': eval(parseFloat(parentAgentUpdatedCash).toFixed(2)),
                        'type': 'deduct',
                        'category': 'deduct',
                        'status': 'success',
                    });

                    var noteDetail = await Sys.App.Services.agentServices.getSingleChipsNote({ 'requestById': req.session.details.id, 'requestToId': withdraw.playerId });
                    if (noteDetail == null) {
                        await Sys.App.Services.agentServices.insertChipsNoteData({
                            requestById: req.session.details.id,
                            requestToId: withdraw.playerId,
                            note: "deduct",
                            type: 'player'
                        });
                    } else {
                        await Sys.App.Services.agentServices.updateChipsNoteData({ '_id': noteDetail._id }, { 'note': 'revert withdraw' });
                    }
                    const result = await Sys.App.Services.PlayerServices.updateWithdrawData(id, { status: 'Denied', action: true });
                    const obj = {
                        'success': 'success',
                        'message': 'Successfully Updated',
                    }
                    return res.send(obj);
                } else {
                    const obj = {
                        'fail': 'fail',
                        'message': 'No Player Found'
                    }
                    return res.send(obj);
                }
            } else {
                const result = await Sys.App.Services.PlayerServices.updateWithdrawData(id, { status: 'Approved', action: true });
                const obj = {
                    'success': 'success',
                    'message': 'Successfully Updated',
                }
                return res.send(obj);
            }
        } catch (err) {
            const obj = {
                'fail': 'fail',
                'message': 'Something went wrong'
            }
            return res.send(obj);
        }
    },
    authHTMLToken: async function(req, res) {
        try {
            console.log("req.session", req.session)
            const token = req.params.token;
            const column = ['username', 'accountNumber', 'mobile'];
            const player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ HTMLToken: token }, column);
            console.log({ player })
            if (!player || player instanceof Error) {
                const obj = {
                    'fail': 'fail',
                    'message': 'Wrong auth token'
                }
                return res.send(obj);
            }
            const response = await Sys.Game.Common.Services.PlayerServices.updatePlayerData({
                _id: player.id
            }, { $set: { "HTMLToken": null } });
            var jwt_token = jwt.sign({ id: player.id }, jwtcofig.secret, {
                expiresIn: 300 // expires in 5 minute
            });
            req.session.web = {};
            req.session.web.login = true;
            req.session.web.details = {
                id: player.id,
                name: player.username,
                jwt_token: jwt_token
            };
            const obj = {
                'success': 'success',
                'message': 'Successfully verified',
                'player': player
            }
            return res.send(obj);
        } catch (err) {
            console.log(err)
        }
    },

    updateAccountNumber: async function(req, res) {
        try {
            const data = req.body;
            /* if (!data.title.trim()) {
               const obj = {
                 status: 'fail',
                 result: null,
                 message: 'Title is required',
                 statusCode: 400
               }
               return res.send(obj)
             }
             if (!data.description.trim()) {
               const obj = {
                 status: 'fail',
                 result: null,
                 message: 'Description is required',
                 statusCode: 400
               }
               return res.send(obj)
             }*/
            data.accountNumber = data.accountNumber.trim()
            if (!data.accountNumber || data.accountNumber.length < 9 || data.accountNumber.length > 18) {
                const obj = {
                    status: 'fail',
                    result: null,
                    message: 'ID should be between 9-18 characters',
                    statusCode: 400
                }
                return res.send(obj)
            }
            console.log(req.session.web.details.id)
            data.playerId = req.session.web.details.id
            const result = await Sys.Game.Common.Services.PlayerServices.insertRequest(data);
            if (result) {
                const obj = {
                    status: 'success',
                    result: null,
                    message: 'Request Successfully Sent'
                }
                return res.send(obj)
            } else {
                const obj = {
                    status: 'fail',
                    result: null,
                    message: 'Something Went Wrong, Please try again',
                    statusCode: 400
                }
                return res.send(obj)
            }
        } catch (err) {
            const obj = {
                status: 'fail',
                result: null,
                message: 'Something Went Wrong, Please try again',
                statusCode: 400
            }
            return res.send(obj)
        }
    },

    uploadDepositReceipt: async function(req, res) {
        try {
            const data = req.body;
            data.playerId = req.session.web.details.id
                // console.log('data: ', data);
            let depositChips = +data.depositChips
            if (depositChips < 1 || depositChips == null) {
                const obj = {
                    status: 'failed',
                    result: null,
                    message: 'Invalid Deposit Chips.',
                }
                return res.send(obj)
            }
            // Convert Base64 to image.
            let fs = require('fs');
            // string generated by canvas.toDataURL()
            let img = data.receipt;
            // var img2 = data.img2;
            // get picture extension
            let extension = 'null';
            //  let extension = img.substring("imgData:image/".length, img.indexOf(";base64"));
            let firstChar = data.receipt.charAt(0);
            if (firstChar == '/') {
                extension = 'jpg';
            } else if (firstChar == 'i') {
                extension = 'png';
            } else if (firstChar == 'R') {
                extension = 'gif';
            } else if (firstChar == 'J') {
                extension = 'pdf';
            }

            if (extension == 'gif' || extension == 'null') {
                const depositData = {
                    depositAmount: data.depositChips,
                    playerId: data.playerId,
                    receipt: ''
                }
                const result = await Sys.Game.Common.Services.PlayerServices.insertDepositReceipt(
                    depositData
                );
                if (!result || result instanceof Error) {
                    console.log(result)
                    const obj = {
                        status: 'failed',
                        result: null,
                        message: 'Something went wrong. Try again.',
                    };
                    return res.send(obj)
                }
                const newDepositReceipt = await Sys.Game.Common.Services.PlayerServices.getNewDepositCount({ seen: false })
                await Sys.Io.emit('depositNotification', {
                    count: newDepositReceipt
                });
                const obj = {
                    status: 'success',
                    result: null,
                    message: 'Successfully Sent',
                };
                return res.send(obj)
                    /* return {
                      status: 'fail',
                      result: null,
                      message: 'Invalid file format, File should be jpg or png!',
                      statusCode: 400,
                    }; */
            }

            // extension2 = 'pdf';
            // strip off the data: url prefix to get just the base64-encoded bytes
            let imgData = img.replace(/^imgData:img\/\w+;base64,/, '');
            let buf = new Buffer.from(imgData, 'base64');
            let randomNum = Math.floor(100000 + Math.random() * 900000);

            fs.writeFile(
                'public/assets/deposit/' +
                data.playerId +
                '_' +
                randomNum +
                '_doc.' +
                extension,
                buf,
                async(err) => {
                    if (err) {
                        console.log('Error', err);
                        const obj = {
                            status: 'failed',
                            result: null,
                            message: 'Something went wrong',
                        };
                        return res.send(obj)
                    }
                    console.log('The file has been saved!');
                }
            );
            const depositData = {
                depositAmount: data.depositChips,
                playerId: data.playerId,
                receipt: `/assets/deposit/${data.playerId}_${randomNum}_doc.${extension}`
            }
            const result = await Sys.Game.Common.Services.PlayerServices.insertDepositReceipt(
                depositData
            );
            if (!result || result instanceof Error) {
                console.log(result)
                const obj = {
                    status: 'failed',
                    result: null,
                    message: 'Something went wrong. Try again.',
                };
                return res.send(obj)
            }
            const newDepositReceipt = await Sys.Game.Common.Services.PlayerServices.getNewDepositCount({ seen: false })
            await Sys.Io.emit('depositNotification', {
                count: newDepositReceipt
            });
            const obj = {
                status: 'success',
                result: null,
                message: 'Successfully Sent',
            };
            return res.send(obj)
        } catch (err) {
            console.log(err)
            const obj = {
                status: 'failed',
                result: null,
                message: 'Something went wrong. Try again.',
            };
            return res.send(obj)
        }
    },

    withdrawRequest: async function(req, res) {
        try {
            console.log(req.session)
            const data = req.body;
            data.playerId = req.session.web.details.id
            console.log('data: ', data);
            let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({
                _id: data.playerId,
            });
            if (!player || player instanceof Error) {
                const obj = {
                    status: 'failed',
                    result: null,
                    message: 'Player not found',
                };
                return res.send(obj)
            }
            if (data.withdrawAmount > player.chips) {
                const obj = {
                    status: 'failed',
                    result: null,
                    message: `Insufficient chips`,
                };
                return res.send(obj)
            }
            if (data.withdrawAmount < 1) {
                const obj = {
                    status: 'failed',
                    result: null,
                    message: `Invalid Withdraw Chips`,
                };
                return res.send(obj)
            }
            let remainingChips = parseFloat(parseFloat(player.chips) - parseFloat(data.withdrawAmount));
            data.remainingChips = remainingChips;
            const withdraw = await Sys.Game.Common.Services.PlayerServices.insertWithdrawData(
                data
            );
            if (!withdraw || withdraw instanceof Error) {
                const obj = {
                    status: 'failed',
                    result: null,
                    message: 'Something went wrong. Try again.',
                };
                return res.send(obj)
            }
            // player = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id: withdraw.playerId});
            if (player) {
                let parentAgent = await Sys.App.Services.UserServices.getSingleUserData({ isSuperAdmin: true });

                console.log("parentAgent: ", parentAgent);

                let newChips;
                let parentAgentUpdatedCash;

                if (parseFloat(player.chips) >= parseFloat(withdraw.withdrawAmount)) {
                    newChips = parseFloat(parseFloat(player.chips) - parseFloat(withdraw.withdrawAmount));
                    parentAgentUpdatedCash = parseFloat(parentAgent.chips) + parseFloat(withdraw.withdrawAmount);

                    let transactionAdminDebitData = {
                        user_id: player.id,
                        username: player.username,
                        chips: parseFloat(withdraw.withdrawAmount),
                        previousBalance: parseFloat(player.chips),
                        afterBalance: parseFloat(newChips),
                        category: 'debit',
                        type: 'entry',
                        remark: 'Debit chips by ' + parentAgent.email,
                        isTournament: 'No',
                        isGamePot: 'no'
                    }

                    console.log("admin chips debit to player transactionAdminDebitData: ", transactionAdminDebitData);
                    await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionAdminDebitData);
                } else {
                    console.log("player else")
                    await Sys.Game.Common.Services.PlayerServices.deleteWithdrawData({ _id: withdraw.id });
                    const obj = {
                        status: 'failed',
                        result: null,
                        message: 'Something went wrong. Try again.',
                    };
                    return res.send(obj)
                }

                await Sys.App.Services.PlayerServices.updatePlayerData({ _id: withdraw.playerId }, { chips: newChips });
                await Sys.Io.to([player.socketId]).emit('OnPlayerChipsUpdate', { playerId: player.id, playersChips: newChips });
                await Sys.App.Services.UserServices.updateUserData({
                    _id: parentAgent.id
                }, {
                    chips: eval(parseFloat(parentAgentUpdatedCash).toFixed(2))
                });
                let traNumber = +new Date()
                await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                    'receiverId': withdraw.playerId,
                    'receiverRole': 'Player',
                    'providerId': parentAgent.id,
                    'providerRole': 'admin',
                    'providerEmail': parentAgent.email,
                    'chips': parseFloat(parseFloat(withdraw.withdrawAmount).toFixed(2)),
                    'cash': '',
                    'remark': 'deduct',
                    'transactionNumber': 'DE-' + traNumber,
                    'beforeBalance': eval(parseFloat(player.chips).toFixed(2)),
                    'afterBalance': eval(parseFloat(newChips).toFixed(2)),
                    'type': 'deduct',
                    'category': 'debit',
                    'status': 'success',
                });
                await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                    'receiverId': parentAgent.id,
                    'receiverRole': 'admin',
                    'providerId': withdraw.playerId,
                    'providerRole': 'Player',
                    'providerEmail': player.username + " (player)",
                    'chips': parseFloat(parseFloat(withdraw.withdrawAmount).toFixed(2)),
                    'cash': '',
                    'remark': 'credit',
                    'transactionNumber': 'DEP-' + traNumber,
                    'beforeBalance': eval(parseFloat(parentAgent.chips).toFixed(2)),
                    'afterBalance': eval(parseFloat(parentAgentUpdatedCash).toFixed(2)),
                    'type': 'deposit',
                    'category': 'credit',
                    'status': 'success',
                });

                var noteDetail = await Sys.App.Services.agentServices.getSingleChipsNote({ 'requestById': parentAgent.id, 'requestToId': withdraw.playerId });
                if (noteDetail == null) {
                    await Sys.App.Services.agentServices.insertChipsNoteData({
                        requestById: parentAgent.id,
                        requestToId: withdraw.playerId,
                        note: "deduct",
                        type: 'player'
                    });
                } else {
                    await Sys.App.Services.agentServices.updateChipsNoteData({ '_id': noteDetail._id }, { 'note': 'deposit' });
                }
                const newWithdrawReq = await Sys.Game.Common.Services.PlayerServices.getNewWithdrawCount({ seen: false })
                await Sys.Io.emit('withdrawNotification', {
                    count: newWithdrawReq
                });
                const obj = {
                    status: 'success',
                    result: null,
                    message: 'Successfully Sent',
                };
                return res.send(obj)
            } else {
                console.log("errrrr")
                await Sys.Game.Common.Services.PlayerServices.deleteWithdrawData({ _id: withdraw.id });
                const obj = {
                    status: 'failed',
                    result: null,
                    message: 'Something went wrong. Try again.',
                };
                return res.send(obj)
            }
        } catch (err) {
            console.log(err)
            const obj = {
                status: 'failed',
                result: null,
                message: 'Something went wrong. Try again.',
            };
            return res.send(obj)
        }
    },
    playerChangePassword: async function(req, res) {
        try {
            const data = req.body
            data.playerId = req.session.web.details.id
            let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ _id: data.playerId });

            if (player) {

                if (bcrypt.compareSync(data.oldPassword, player.password)) {
                    if (data.verifyNewPassword.length >= 6) {
                        if (data.newPassword == data.verifyNewPassword) {
                            await Sys.Game.Common.Services.PlayerServices.updatePlayerData({
                                _id: data.playerId
                            }, {
                                password: bcrypt.hashSync(data.newPassword, bcrypt.genSaltSync(8), null)
                            });
                            const obj = {
                                status: 'success',
                                message: "Password Updated Successfully",
                                statusCode: 200,
                            }
                            return res.send(obj)
                        } else {
                            const obj = {
                                status: 'fail',
                                result: null,
                                message: 'New password and verify password mismatch.',
                                statusCode: 400
                            }
                            return res.send(obj)
                        }
                    }
                    const obj = {
                        status: 'fail',
                        result: null,
                        message: 'Password must be more than six characters',
                        statusCode: 400
                    }
                    return res.send(obj)
                } else {
                    const obj = {
                        status: 'fail',
                        result: null,
                        message: 'Please provide correct old password.',
                        statusCode: 400
                    }
                    return res.send(obj)
                }
            }
            const obj = {
                status: 'fail',
                result: null,
                message: 'Player Not Found.',
                statusCode: 400
            }
            return res.send(obj)
        } catch (e) {
            Sys.Log.info('Error in playerChangePassword : ' + e);
        }
    },
}

async function randomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}