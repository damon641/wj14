var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
var moment = require('moment');
var jwt = require('jsonwebtoken');
var jwtcofig = {
    'secret': 'AisJwtAuth'
};

const rolesArray = ['admin', 'senior', 'master', 'agent', 'childAgent'];

module.exports = {

    agents: async function(req, res) {
        try {
            let level = 1;
            if (req.session.details.is_admin != 'yes') {
                let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.session.details.id });
                level = getLevel.level;
            }

            // console.log("req.session.details: ", req.session.details);

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                agentActive: 'active',
                agentLevel: level,
                AgentMenu: 'active menu-open'
            };
            return res.render('agent/agent', data);
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    },

    getAgents: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;
            let query = {};
            if (search != '') {
                query = { parentId: req.session.details.id, email: { $regex: '.*' + search + '.*' } };
            } else {
                query = { parentId: req.session.details.id };
            }
            query.status = req.params.type
            let agentCount = await Sys.App.Services.agentServices.getAgentCount(query);
            let allAgentsQuery = [
                { $match: query },
                { $skip: start },
                { $limit: length },
                {
                    $graphLookup: {
                        from: "agent",
                        startWith: "$_id",
                        connectFromField: "_id",
                        connectToField: "parentObjectId",
                        as: "data"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        chips: 1,
                        email: 1,
                        commission: 1,
                        status: 1,
                        rake_chips: 1,
                        createdAt: 1,
                        role: 1,
                        username: 1,
                        sum: { $sum: "$data.chips" },
                        sumRake: { $sum: "$data.rake_chips" },
                        all: "$data._id",
                        finalTotal: {
                            $let: {
                                vars: {
                                    totalChips: { $sum: '$data.chips' },
                                    totalRakeChips: { $sum: '$data.rake_chips' },
                                },
                                in: { $sum: ["$$totalChips", "$$totalRakeChips"] }
                            }
                        }
                    }
                }

            ];

            let allAgentsChips = await Sys.App.Services.agentServices.aggregateQuery(allAgentsQuery);
            let players = [];
            allAgentsChips.forEach((player, index) => {
                player.all.push(player._id);
                let ids = player.all.map(x => String(x))
                let match = [
                    { $match: { agentId: { $in: ids } } },
                    {
                        $group: { _id: null, newId: { $first: player._id }, total: { $sum: "$chips" }, newChips: { $first: player.chips }, newRakeChips: { $first: player.rake_chips }, newEmail: { $first: player.email }, newCreatedAt: { $first: player.createdAt }, newCommission: { $first: player.commission }, newName: { $first: player.username }, newFinalChips: { $first: player.finalTotal } }
                    },
                    {
                        $project: {
                            agentPlayerId: "$newId",
                            finalTotal: { $sum: ["$newFinalChips", "$total"] }
                        }
                    }
                ];
                players.push(Sys.App.Services.PlayerServices.aggregateQuery(match))
            });
            let mydata = await Promise.all(players);
            mydata = mydata.filter(x => x.length);
            for (var i = 0; i < allAgentsChips.length; i++) {
                let withAdminTx = 0;
                let totalAgentChips = 0;
                query = [
                    { $match: { type: { $in: ['deposit', 'deduct'] }, isTournament: { $ne: 'true' }, rakeChips: { $ne: 'true' }, receiverId: allAgentsChips[i]._id.toString(), providerId: req.session.details.id.toString() } },
                    {
                        $project: {
                            type: 1,
                            chips: 1,
                            depositChips: { $cond: { if: { $eq: ["$type", 'deposit'] }, then: { $toDouble: "$chips" }, else: 0 } },
                            deductChips: { $cond: { if: { $eq: ["$type", 'deduct'] }, then: { $toDouble: "$chips" }, else: 0 } }
                        }
                    }, {
                        $group: {
                            _id: null,
                            totalDeduct: { $sum: "$deductChips" },
                            totalDeposit: { $sum: "$depositChips" },

                        }
                    }, {
                        $project: {
                            _id: 0,
                            total: { $subtract: ['$totalDeposit', '$totalDeduct'] }
                        }
                    }
                ];

                let agentTx = await Sys.App.Services.AllUsersTransactionHistoryServices.aggregateQuery(query);
                mydata.map(data => {
                    const [element] = data;
                    totalAgentChips = allAgentsChips[i]._id.toString() == element.agentPlayerId.toString() ? element.finalTotal : totalAgentChips
                })
                allAgentsChips[i]['withAdminChips'] = (agentTx.length > 0) ? agentTx[0].total : 0;
                allAgentsChips[i]['agentAndPlayersChips'] = parseFloat(totalAgentChips).toFixed(2);
            }
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': agentCount,
                'recordsFiltered': agentCount,
                'data': allAgentsChips
            };

            res.send(obj);
        } catch (e) {
            console.log("Error", e);
            return new Error("Error", e);
        }
    },

    allAgents: async function(req, res) {
        try {
            let level = 1;
            if (req.session.details.is_admin != 'yes') {
                let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.session.details.id });
                level = getLevel.level;
            }

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                allAgentActive: 'active',
                agentLevel: level,
                allAgents: 'true',
                AgentMenu: 'active menu-open'
            };
            return res.render('agent/agent', data);
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    },

    getAllAgents: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;
            let query = {};
            query = search != '' ? { email: { $regex: '.*' + search + '.*' } } : {}
            query.status = req.params.type
            let agentCount = await Sys.App.Services.agentServices.getAgentCount(query);
            let allAgentsQuery = [
                { $match: query },
                { $skip: start },
                { $limit: length },
                {
                    $graphLookup: {
                        from: "agent",
                        startWith: "$_id",
                        connectFromField: "_id",
                        connectToField: "parentObjectId",
                        as: "data"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        chips: 1,
                        email: 1,
                        commission: 1,
                        status: 1,
                        rake_chips: 1,
                        createdAt: 1,
                        role: 1,
                        username: 1,
                        sum: { $sum: "$data.chips" },
                        sumRake: { $sum: "$data.rake_chips" },
                        all: "$data._id",
                        finalTotal: {
                            $let: {
                                vars: {
                                    totalChips: { $sum: '$data.chips' },
                                    totalRakeChips: { $sum: '$data.rake_chips' },
                                },
                                in: { $sum: ["$$totalChips", "$$totalRakeChips"] }
                            }
                        }
                    }
                }
            ];
            let allAgentsChips = await Sys.App.Services.agentServices.aggregateQuery(allAgentsQuery);
            let players = [];
            allAgentsChips.forEach((player, index) => {
                player.all.push(player._id);
                let ids = player.all.map(x => String(x))
                let match = [
                    { $match: { agentId: { $in: ids } } },
                    {
                        $group: { _id: null, newId: { $first: player._id }, total: { $sum: "$chips" }, newChips: { $first: player.chips }, newRakeChips: { $first: player.rake_chips }, newEmail: { $first: player.email }, newCreatedAt: { $first: player.createdAt }, newCommission: { $first: player.commission }, newName: { $first: player.username }, newFinalChips: { $first: player.finalTotal } }
                    },
                    {
                        $project: {
                            agentPlayerId: "$newId",
                            finalTotal: { $sum: ["$newFinalChips", "$total"] }
                        }
                    }
                ];
                players.push(Sys.App.Services.PlayerServices.aggregateQuery(match))
            });
            let mydata = await Promise.all(players);
            mydata = mydata.filter(x => x.length);
            for (var i = 0; i < allAgentsChips.length; i++) {
                var totalAgentChips = 0.00;
                let withAdminTx = 0;

                query = [
                    { $match: { type: { $in: ['deposit', 'deduct'] }, isTournament: { $ne: 'true' }, rakeChips: { $ne: 'true' }, receiverId: allAgentsChips[i]._id.toString(), providerId: req.session.details.id.toString() } },
                    {
                        $project: {
                            type: 1,
                            chips: 1,
                            depositChips: { $cond: { if: { $eq: ["$type", 'deposit'] }, then: { $toDouble: "$chips" }, else: 0 } },
                            deductChips: { $cond: { if: { $eq: ["$type", 'deduct'] }, then: { $toDouble: "$chips" }, else: 0 } }
                        }
                    }, {
                        $group: {
                            _id: null,
                            totalDeduct: { $sum: "$deductChips" },
                            totalDeposit: { $sum: "$depositChips" },

                        }
                    }, {
                        $project: {
                            _id: 0,
                            total: { $subtract: ['$totalDeposit', '$totalDeduct'] }
                        }
                    }
                ];

                let agentTx = await Sys.App.Services.AllUsersTransactionHistoryServices.aggregateQuery(query);


                mydata.map(data => {
                    const [element] = data;
                    totalAgentChips = allAgentsChips[i]._id.toString() == element.agentPlayerId.toString() ? element.finalTotal : totalAgentChips
                })
                allAgentsChips[i]['withAdminChips'] = (agentTx.length > 0) ? agentTx[0].total : 0;
                allAgentsChips[i]['agentAndPlayersChips'] = parseFloat(totalAgentChips).toFixed(2);
            }

            var obj = {
                'draw': req.query.draw,
                'recordsTotal': agentCount,
                'recordsFiltered': agentCount,
                'data': allAgentsChips
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
            return new Error("Error", e);
        }
    },

    // getAllAgents: async function (req, res) {
    //   try {
    //     let start = parseInt(req.query.start);
    //     let length = parseInt(req.query.length);
    //     let search = req.query.search.value;
    //     let query = {};
    //     query = search != '' ? { email: { $regex: '.*' + search + '.*' } } : {}
    //     query.status = req.params.type
    //     let agentCount = await Sys.App.Services.agentServices.getAgentCount(query);
    //     let allAgentsQuery = [
    //       { $match: query },
    //       { $skip: start },
    //       { $limit: length },
    //       {
    //         $graphLookup: {
    //           from: "agent",
    //           startWith: "$_id",
    //           connectFromField: "_id",
    //           connectToField: "parentObjectId",
    //           as: "data"
    //         }
    //       },
    //       {
    //         $project: {
    //           _id: 1, chips: 1, email: 1, commission: 1, rake_chips: 1, createdAt: 1, username: 1, sum: { $sum: "$data.chips" }, sumRake: { $sum: "$data.rake_chips" }, all: "$data._id", finalTotal: {
    //             $let: {
    //               vars: {
    //                 totalChips: { $sum: '$data.chips' },
    //                 totalRakeChips: { $sum: '$data.rake_chips' },
    //               },
    //               in: { $sum: ["$$totalChips", "$$totalRakeChips"] }
    //             }
    //           }
    //         }
    //       }
    //     ];
    //     let allAgentsChips = await Sys.App.Services.agentServices.aggregateQuery(allAgentsQuery);
    //     let players = [];
    //     allAgentsChips.forEach((player, index) => {
    //       player.all.push(player._id);
    //       let ids = player.all.map(x => String(x))
    //       let match = [
    //         { $match: { agentId: { $in: ids } } },
    //         {
    //           $group: { _id: null, newId: { $first: player._id }, total: { $sum: "$chips" }, newChips: { $first: player.chips }, newRakeChips: { $first: player.rake_chips }, newEmail: { $first: player.email }, newCreatedAt: { $first: player.createdAt }, newCommission: { $first: player.commission }, newName: { $first: player.username }, newFinalChips: { $first: player.finalTotal } }
    //         },
    //         {
    //           $project: {
    //             agentPlayerId: "$newId",
    //             finalTotal: { $sum: ["$newFinalChips", "$total"] }
    //           }
    //         }
    //       ];
    //       players.push(Sys.App.Services.PlayerServices.aggregateQuery(match))
    //     });
    //     let mydata = await Promise.all(players);
    //     mydata = mydata.filter(x => x.length);
    //     for (var i = 0; i < allAgentsChips.length; i++) {
    //       var totalAgentChips = 0.00;
    //       let withAdminTx = 0;
    //       let agentTx = await Sys.App.Services.AllUsersTransactionHistoryServices.getByData({ 'receiverId': allAgentsChips[i]['_id'], 'providerId': req.session.details.id }, null, null);
    //       for (let j = 0; j < agentTx.length; j++) {
    //         if (agentTx[j].type == 'deposit') {
    //           withAdminTx += parseFloat(agentTx[j].chips);
    //         } else if (agentTx[j].type == 'deduct') {
    //           withAdminTx -= parseFloat(agentTx[j].chips);
    //         }
    //       }
    //       mydata.map(data => {
    //         const [element] = data;
    //         totalAgentChips = allAgentsChips[i]._id.toString() == element.agentPlayerId.toString() ? element.finalTotal : totalAgentChips
    //       })
    //       allAgentsChips[i]['withAdminChips'] = withAdminTx;
    //       allAgentsChips[i]['agentAndPlayersChips'] = parseFloat(totalAgentChips).toFixed(2);
    //     }

    //     var obj = {
    //       'draw': req.query.draw,
    //       'recordsTotal': agentCount,
    //       'recordsFiltered': agentCount,
    //       'data': allAgentsChips
    //     };
    //     res.send(obj);
    //   } catch (e) {
    //     console.log("Error", e);
    //     return new Error("Error", e);
    //   }
    // },


    addAgent: async function(req, res) {
        try {

            // check for commision validation
            /*let agentCommision = [];
            if(req.session.details.is_admin != 'yes'){
              let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({_id: req.session.details.id});
              if(getLevel.level == 2){
                let agentCom = (100-getLevel.commission);
                for(let i=1; i<= agentCom;i++){
                  agentCommision.push(i);
                }
              }else{
                let getParentLevel = await Sys.App.Services.agentServices.getSingleAgentData({_id: getLevel.parentId});
                console.log("parentId agents", getParentLevel)
                let parentAgentCom = (100-getParentLevel.commission - getLevel.commission );
                for(let i=1; i<= parentAgentCom;i++){
                  agentCommision.push(i);
                }
              }
              
            }else{
              for(let i=1; i<=100;i++){
                agentCommision.push(i);
              }
            }*/
            let agentCommision = [];
            if (req.session.details.is_admin != 'yes') {
                let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.session.details.id });
                let agentCom = getLevel.commission;
                for (let i = 1; i <= agentCom; i++) {
                    agentCommision.push(i);
                }
            } else {
                for (let i = 1; i <= 100; i++) {
                    agentCommision.push(i);
                }
            }

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                agentActive: 'active',
                agentCommision: agentCommision
            };
            return res.render('agent/add', data);
        } catch (e) {
            console.log("Error", e);
            return new Error("Error", e);
        }
    },

    addAgentPostData: async function(req, res) {
        try {
            if (req.body.commission == '' || req.body.commission == null || req.body.commission == undefined) {
                req.flash('error', 'Commission must be greater than zero');
                res.redirect('/agents');
                return;
            }
            let agent = await Sys.App.Services.agentServices.getAgentData({ email: req.body.email });
            if (agent && agent.length > 0) {
                req.flash('error', 'Agent Already Present');
                res.redirect('/agents');
                return;

            } else {

                let level = '2';
                let roleCount = 1;
                if (req.session.details.is_admin != 'yes') {
                    let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.session.details.id });
                    level = (parseInt(getLevel.level) + 1);
                    console.log("LEVEL", level)
                    if (level > 4 && level <= 100) {
                        if (level == 5) {
                            roleCount = roleCount + 1;
                        } else {
                            roleCount = parseInt(getLevel.role.replace(/\D/g, '')) + 1;
                        }

                    }

                    /*let agentCom = 0;
                    if(getLevel.level == 2){
                      agentCom = (100-getLevel.commission);
                    }else{
                      let getParentLevel = await Sys.App.Services.agentServices.getSingleAgentData({_id: getLevel.parentId});
                      console.log("parentId agents", getParentLevel)
                      agentCom = (100-getParentLevel.commission - getLevel.commission );
                      
                    }

                    if(req.body.commission > agentCom){
                       req.flash('error', 'You are not allowed to assign invalid commision.');
                       res.redirect('/addAgent');
                       return;
                    }*/

                    let agentCom = parseInt(getLevel.commission),
                        inputCom = parseInt(req.body.commission);

                    if (inputCom > agentCom) {
                        req.flash('error', 'You are not allowed to assign commision.');
                        res.redirect('/addAgent');
                    }

                }



                let insertAgent = await Sys.App.Services.agentServices.insertAgentData({
                    username: req.body.username,
                    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null),
                    //firstname: req.body.firstname,
                    //lastname: req.body.lastname,
                    mobile: req.body.mobile,
                    email: req.body.email,
                    commission: req.body.commission,
                    status: req.body.status,
                    parentId: req.session.details.id,
                    level: level,
                    role: req.body.role,
                });

                if ("_id" in insertAgent) {


                    let insertAgentRelation = await Sys.App.Services.agentRelationServices.insertAgentRelationData({
                        parentId: req.session.details.id,
                        childId: insertAgent._id,
                        level: level,
                        role: rolesArray[level - 1],
                        isAdmin: (() => {
                            if (req.session.details.is_admin == 'yes') {
                                return 'yes'
                            } else {
                                return 'No'
                            }
                        })()

                    });

                }
                req.flash('success', 'Agent created successfully');
                res.redirect('/agents');
            }
        } catch (e) {
            console.log("Error", e);
            req.flash('error', 'Problem Creating Agent');
            res.redirect('/addAgent');
            return;
        }
    },

    editAgent: async function(req, res) {
        try {
            let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.params.id });

            let agentCommision = [];
            if (req.session.details.is_admin != 'yes') {
                let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.session.details.id });
                let agentCom = getLevel.commission;
                for (let i = 1; i <= agentCom; i++) {
                    agentCommision.push(i);
                }
            } else {
                for (let i = 1; i <= 100; i++) {
                    agentCommision.push(i);
                }
            }

            /*let agentCommision = [];
            if(req.session.details.is_admin != 'yes'){
              let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({_id: req.session.details.id});
              let agentCom = getLevel.commission;

              if(getLevel.level == 2){
                let agentCom = (100-getLevel.commission);
                for(let i=1; i<= agentCom;i++){
                  agentCommision.push(i);
                }
              }else{
                let getParentLevel = await Sys.App.Services.agentServices.getSingleAgentData({_id: getLevel.parentId});
                console.log("parentId agents", getParentLevel)
                let parentAgentCom = (100-getParentLevel.commission - getLevel.commission );
                for(let i=1; i<= parentAgentCom;i++){
                  agentCommision.push(i);
                }
              }

            }else{
              for(let i=1; i<=100;i++){
                agentCommision.push(i);
              }
            }*/

            // if (req.session.details.is_admin == 'yes') {
            //     let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.session.details.id });
            //     let agentCom = getLevel.commission;
            //     for (let i = 1; i <= agentCom; i++) {
            //         agentCommision.push(i);
            //     }
            // } else {
            //     console.log(agent.role == 'senior');
            //     console.log(agent.role != 'senior');
            //     if (agent.role != 'master') {
            //         let parentAgent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: agent.parentId });
            //         for (let i = 1; i <= parentAgent.commission; i++) {
            //             agentCommision.push(i);
            //         }
            //     } else if (agent.role != 'senior') {
            //         let parentAgent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: agent.parentId });
            //         for (let i = 1; i <= parentAgent.commission; i++) {
            //             agentCommision.push(i);
            //         }
            //     } else {
            //         for (let i = 1; i <= 100; i++) {
            //             agentCommision.push(i);
            //         }
            //     }

            // }
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                agentActive: 'active',
                agent: agent,
                agentCommision: agentCommision,
                is_admin: req.session.details.is_admin,
            };
            req.session.agentBack = req.header('Referer');
            return res.render('agent/add', data);
        } catch (e) {
            console.log("Error", e);
            return new Error("Error", e);
        }
    },

    editAgentPostData: async function(req, res) {
        try {
            if (req.session.details.is_admin == 'yes' && (req.body.commission == '' || req.body.commission == null || req.body.commission == undefined)) {
                req.flash('error', 'Commission must be greater than zero');
                res.redirect('/agents');
                return;
            }
            let agent = await Sys.App.Services.agentServices.getAgentData({ _id: req.params.id });
            if (agent && agent.length > 0) {
                if (req.files) {
                    let image = req.files.image;
                    // Use the mv() method to place the file somewhere on your server
                    image.mv('/profile/agents/' + req.files.image.name, function(err) {
                        if (err) {
                            req.flash('error', 'User Already Present');
                            return res.redirect('/');
                        }
                    });
                }
                let password;


                let agentCom = 0;
                let updatedCommision = 0;
                if (req.session.details.is_admin != 'yes') {
                    let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.session.details.id });
                    agentCom = getLevel.commission;
                    updatedCommision = agent[0].commission;

                } else {
                    if (agent[0].role != 'master') {
                        let parentAgent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: agent[0].parentId });
                        agentCom = parentAgent.commission;
                    } else {
                        agentCom = 100;
                    }

                    updatedCommision = req.body.commission;
                }
                let inputtedCommision = req.body.commission;
                console.log("agent commison", agentCom, inputtedCommision, typeof agentCom, typeof inputtedCommision)
                if (parseInt(agentCom) < parseInt(inputtedCommision)) {
                    console.log("inside ")
                    req.flash('error', 'You are not allowed to assign commision.');
                    res.redirect('/addAgent');
                    return;
                }
                console.log("3", updatedCommision)
                    /* if(req.session.details.is_admin != 'yes'){
                        let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({_id: req.session.details.id});
                       
                        let agentCom = 0;
                        if(getLevel.level == 2){
                          agentCom = (100-getLevel.commission);
                        }else{
                          let getParentLevel = await Sys.App.Services.agentServices.getSingleAgentData({_id: getLevel.parentId});
                          console.log("parentId agents", getParentLevel)
                          agentCom = (100-getParentLevel.commission - getLevel.commission );
                          
                        }

                        if(req.body.commission > agentCom){
                           req.flash('error', 'You are not allowed to assign invalid commision.');
                           res.redirect('/addAgent');
                           return;
                        }

                     }*/

                if (req.body.password == agent[0].password) {
                    //same password
                    console.log("same", agent[0].password)
                    password = agent[0].password;
                } else {
                    password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
                    console.log("change pass", password)
                }
                await Sys.App.Services.agentServices.updateAgentData({
                    _id: req.params.id
                }, {
                    username: req.body.username,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    mobile: req.body.mobile,
                    status: req.body.status,
                    password: password,
                    commission: updatedCommision,
                    // image: req.files.image.name
                });
                req.flash('success', 'Agent updated successfully');
                res.redirect(req.session.agentBack);
                //res.redirect('/agents');

            } else {
                req.flash('error', 'No Agent found');
                res.redirect(req.session.agentBack);
                //res.redirect('/agents');
                return;
            }
        } catch (e) {
            console.log(e);
            return new Error("Error", e);
        }
    },

    getAgentDelete: async function(req, res) {
        try {
            let agent = await Sys.App.Services.agentServices.getAgentData({ _id: req.body.id });
            if (agent || agents.length > 0) {
                await Sys.App.Services.agentServices.deleteAgent(req.body.id);
                await Sys.App.Services.agentRelationServices.deleteAgent({ childId: req.body.id });
                return res.send("success");
            } else {
                return res.send("error");
            }

        } catch (e) {
            console.log("Error", e);
            return new Error("Error", e);
        }
    },

    agentsLogin: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
            };
            return res.render('agent/login', data);
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    },

    agentsPostLogin: async function(req, res) {
        try {
            let agent = null;
            //agent = await Sys.App.Services.agentServices.getAgentData({email: req.body.email});
            let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).format("YYYY-MM-DD HH:mm");
            let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).format("YYYY-MM-DD HH:mm");
            let current_date = moment(new Date()).format("YYYY-MM-DD HH:mm");
            if ((current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status == 'active') || Sys.Setting.maintenance.quickMaintenance == "active") {
                req.flash('error', 'Maintenance mode is on please try again later.');
                return res.redirect('/agents/login');
            } else {
                agent = await Sys.App.Services.agentServices.getPopulatedData({ $or: [{ 'email': req.body.email }, { 'username': req.body.email }] }, null, null, 'parentId');
                // console.log("agent-->",agent);
                if (agent == null || agent.length == 0) {
                    req.flash('error', 'No Such Agent Found');
                    return res.redirect('/agents/login');
                }
                var passwordTrue;
                if (bcrypt.compareSync(req.body.password, agent[0].password)) {
                    passwordTrue = true;
                } else {
                    passwordTrue = false;
                }
                if (passwordTrue == true) {
                    if (['senior', 'master', 'agent'].indexOf(agent[0].role) < 0) {
                        if (agent[0].status != 'active' || agent[0].parentId.status != 'active') {
                            req.flash('error', 'You are Blocked!');
                            return res.redirect('/agents/login');
                        }
                    } else {
                        if (agent[0].status != 'active') {
                            req.flash('error', 'You are Blocked!');
                            return res.redirect('/agents/login');
                        }
                    }

                    var token = jwt.sign({ id: agent[0].id }, jwtcofig.secret, {
                        expiresIn: 60 * 60 * 24 // expires in 24 hours
                    });
                    if (agent[0].profilePic == '') { profilePic = 'user.png'; } else { profilePic = agent[0].profilePic; }
                    // User Authenticate Success

                    let role = agent[0].role;
                    console.log("BEFORE ROLE", role)
                    let re = /^[A-Za-z]+$/;
                    if (!re.test(role)) {
                        role = role.replace(/[0-9]/g, '');
                    }
                    console.log("AFTER ROLE", role)

                    req.session.login = true;
                    req.session.details = {
                        id: agent[0].id,
                        name: agent[0].username,
                        jwt_token: token,
                        avatar: profilePic,
                        is_admin: 'No',
                        chips: agent[0].chips,
                        temp_chips: agent[0].temp_chips,
                        rake_chips: agent[0].rake_chips ? agent[0].rake_chips : 0,
                        isTransferAllow: agent[0].isTransferAllow ? agent[0].isTransferAllow : "true",
                        role: role,
                        parentId: agent[0].parentId ? agent[0].parentId.id : 'admin',
                        level: parseInt(agent[0].level),
                        isTransfer: agent[0].isTransfer,
                    };

                    if (agent[0].avatar) {
                        req.session.details.avatar = agent[0].avatar;
                    }

                    // console.log("agents req.session.details: ", req.session.details);

                    req.flash('success', 'Welcome To Admin Panel');
                    return res.redirect('/player');
                } else {
                    req.flash('error', 'Invalid Credentials');
                    return res.redirect('/agents/login');
                }
            }
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    },

    getAgentProfile: async function(req, res) {
        try {
            agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.session.details.id });
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                agent: agent
            };
            return res.render('agent/profile', data);
        } catch (e) {
            console.log("Error in Agent profile : ", e);
            return new Error(e);
        }
    },

    updateAgentProfile: async function(req, res) {
        try {
            let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.body.id });
            if (agent) {
                await Sys.App.Services.agentServices.updateAgentData({
                    _id: req.body.id
                }, {
                    email: req.body.email,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                });
                req.flash('success', 'Profile Updated Successfully');
                res.redirect('/agent/profile');
            } else {
                req.flash('error', 'Error in Profile Update');
                return res.redirect('agent/profile');
            }
        } catch (e) {
            console.log("Error in profileUpdate :", e);
            return new Error(e);
        }
    },

    // AgentChipsMove:async function (req,res){
    //   try{
    //     let agent = await Sys.App.Services.agentServices.getSingleAgentData({_id: req.body.id});
    //     if(agent){
    //       console.log(req.body,'test',agent)

    //       await Sys.App.Services.agentServices.updateAgentData({
    //         _id: req.body.id
    //       },{
    //         $set:{
    //           temp_chips_checkbox :req.body.temp_chips_checkbox == 'true' ? true :false,
    //         }         
    //       });

    //       await Sys.App.Services.agentServices.updateAgentData({
    //         parentId: req.body.id
    //       },{
    //         $set:{
    //           temp_chips_checkbox :req.body.temp_chips_checkbox == 'true' ? true :false,
    //         }         
    //       });

    //       let message = req.body.temp_chips_checkbox == 'true' ? 'checkbox activate successfully' :'checkbox box de activate successfully'

    //       res.send({'status':'success','message':message})
    //     }
    //     else{
    //       res.send({'status':'fail','message':'Agent not availabel'})
    //     }
    //   }catch(e){
    //     console.log(e)
    //   }
    // },

    // AgentChipsCloneJob:async function(req,res){
    //   try{
    //     let agent = await Sys.App.Services.agentServices.getByData({"temp_chips_checkbox" : true,"isTransfer":true});
    //     for(var i=0; i< agent.length ; i++){
    //       let agentchpisHistory ={
    //         agent_id:agent[i]._id,
    //         transfer_chips: agent[i].temp_chips,
    //         temp_chips:agent[i].temp_chips,
    //         main_chips :agent[i].chips,
    //         update_chips:parseFloat(agent[i].temp_chips)+parseFloat(agent[i].chips),
    //         type:'automatically'
    //       }
    //       let doc ={
    //         temp_chips:0,
    //         chips:parseFloat(agent[i].chips) +parseFloat(agent[i].temp_chips),
    //       }
    //       let updateChips =  await Sys.App.Services.agentServices.updateAgentData({ _id: agent[i]._id},{$set:doc});
    //       let insertChipsHistory =  await Sys.App.Services.agentServices.addChipsHistory(agentchpisHistory);
    //     }
    //   }catch(e){
    //     console.log(e,'error in clone job')
    //   }
    // },

    changeAgentPassword: async function(req, res) {
        try {
            let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.body.id });
            if (agent) {
                await Sys.App.Services.agentServices.updateAgentData({
                    _id: req.body.id
                }, {
                    password: bcrypt.hashSync(req.body.pass_confirmation, bcrypt.genSaltSync(8), null)
                });
                req.flash('success', 'Password updated successfully');
                res.redirect('/agent/profile');
            } else {
                req.flash('error', 'Password not updated successfully');
                return res.redirect('/agent/profile');
            }
        } catch (e) {
            console.log("Error in ChangePassword :", e);
            return new Error(e);
        }
    },

    changeAgentAvatar: async function(req, res) {
        try {
            if (req.files) {
                let image = req.files.avatar;

                var re = /(?:\.([^.]+))?$/;
                var ext = re.exec(image.name)[1];
                let fileName = Date.now() + '.' + ext;
                // Use the mv() method to place the file somewhere on your server
                image.mv('./public/profile/agents/' + fileName, async function(err) {
                    if (err) {
                        console.log(err);
                        req.flash('error', 'Error Uploading Profile Avatar');
                        return res.redirect('/agent/profile');
                    }

                    let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.body.id });
                    if (agent) {
                        await Sys.App.Services.agentServices.updateAgentData({
                            _id: req.body.id
                        }, {
                            profilePic: fileName
                        });
                        req.session.details.avatar = fileName;

                        req.flash('success', 'Profile Avatar Updated Successfully');
                        res.redirect('/agent/profile');
                    } else {
                        req.flash('error', 'Error in Profile Avatar Update');
                        return res.redirect('/agent/profile');
                    }
                });
            } else {
                req.flash('success', 'Profile Avatar Updated Successfully');
                res.redirect('/agent/profile');
            }
        } catch (e) {
            console.log("Error in changeAvatar : ", e);
            return new Error(e);
        }
    },

    active: async function(req, res) {
        try {
            let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.body.id });
            if (agent || agent.length > 0) {
                if (agent.status == 'active') {
                    await Sys.App.Services.agentServices.updateAgentData({
                        _id: req.body.id
                    }, {
                        status: 'Block'
                    })
                } else {
                    await Sys.App.Services.agentServices.updateAgentData({
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
            return new Error(e);
        }
    },

    // agentTransfer: async function(req,res){
    //   try{
    //     let agent = await Sys.App.Services.agentServices.getSingleAgentData({_id: req.body.id});
    //     if (agent || agent.length >0) {
    //       console.log("(agent.isTransfer: ", agent.isTransfer);
    //       if(agent.isTransfer == true){
    //         await Sys.App.Services.agentServices.updateAgentData(
    //         {
    //           _id: req.body.id
    //         },{
    //          $set:{
    //           isTransfer:false
    //          }
    //         }
    //         )
    //       }else{
    //         await Sys.App.Services.agentServices.updateAgentData(
    //         {
    //           _id: req.body.id
    //         },{
    //           $set:{
    //             isTransfer:true
    //            }
    //         }
    //         )
    //       }
    //       //req.flash('success','Status updated successfully');
    //       return res.send("success");
    //     }else {
    //       return res.send("error");
    //       req.flash('error', 'Problem while updating Status.');
    //     }

    //   } catch (e){
    //     console.log("Error",e);
    //     return new Error(e);
    //   }
    // },

    userAgentTransfer: async function(req, res) {
        try {
            let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).format("YYYY-MM-DD HH:mm");
            let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).format("YYYY-MM-DD HH:mm");
            let current_date = moment(new Date()).format("YYYY-MM-DD HH:mm");

            if ((current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status == 'active') || Sys.Setting.maintenance.quickMaintenance == "active") {
                req.flash('error', 'Maintenance mode is on please try again later.');
                res.send({ 'status': 'fail', 'message': 'Server under maintenance' });
            } else {
                if (req.session.details.isTransferAllow == true || req.session.details.isTransferAllow == "true") {
                    if (req.session.details.is_admin == 'yes') {
                        let transaction = {
                            to: req.session.details.id,
                            from: req.session.details.id,
                            chips: req.body.userChips,
                            fromRole: 'admin',
                            action: "deduct",
                            toRole: 'admin',
                            walletType: "rakeWallet"
                        }
                        let response = await Sys.Helper.Poker.Transaction(transaction);
                        console.log(response);
                        res.send({ 'status': 'success', 'message': "Transaction Successfully" });
                    } else {
                        let transaction = {
                            to: req.session.details.id,
                            from: req.session.details.id,
                            chips: req.body.userChips,
                            fromRole: 'agent',
                            action: "deduct",
                            toRole: 'agent',
                            walletType: "rakeWallet"
                        }
                        let response = await Sys.Helper.Poker.Transaction(transaction);
                        console.log(response);
                        res.send({ 'status': 'success', 'message': "Transaction Successfully" });
                    }

                } else { res.send({ 'status': 'fail', 'message': 'you can`t transfer chips Please content to admin' }); }
            }
        } catch (e) {
            res.send({ 'status': 'fail', 'message': e.message });
        }
    },

    userExtraChipsTransfer: async function(req, res) {
        try {
            let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).format("YYYY-MM-DD HH:mm");
            let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).format("YYYY-MM-DD HH:mm");
            let current_date = moment(new Date()).format("YYYY-MM-DD HH:mm");

            if ((current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status == 'active') || Sys.Setting.maintenance.quickMaintenance == "active") {
                req.flash('error', 'Maintenance mode is on please try again later.');
                res.send({ 'status': 'fail', 'message': 'Server under maintenance' });
            } else {
                console.log("req.body.extraChips", req.body.extraChips)
                    // var player = await Sys.App.Services.UserServices.getUserData({_id: req.session.details.id});

                let transaction = {
                    to: req.session.details.id,
                    from: req.session.details.id,
                    chips: +parseFloat(req.body.extraChips),
                    fromRole: 'admin',
                    action: "deduct",
                    toRole: 'admin',
                    walletType: "extraRakeWallet"
                }
                let response = await Sys.Helper.Poker.Transaction(transaction);
                console.log(response);
                res.send({ 'status': 'success', 'message': "Transaction Successfully" });
            }
        } catch (e) {

            res.send({ 'status': e.status, 'message': e.message });
        }
    },


    ChipsTransfer: async function(req, res) {
        try {
            let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).format("YYYY-MM-DD HH:mm");
            let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).format("YYYY-MM-DD HH:mm");
            let current_date = moment(new Date()).format("YYYY-MM-DD HH:mm");

            if ((current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status == 'active') || Sys.Setting.maintenance.quickMaintenance == "active") {
                req.flash('error', 'Maintenance mode is on please try again later.');
                return res.redirect('/agents');
            } else {
                var noteId = req.body.agentId;
                var isTransferAllow = req.body.hasOwnProperty('isTransferAllow') ? req.body.isTransferAllow : ''
                var chips = req.body.hasOwnProperty('rake_chips') ? req.body.rake_chips : ''
                let agent = await Sys.App.Services.agentServices.getByDataOne({ '_id': noteId });
                console.log("chips transfer by admin for agent rake wallet to main chips");
                if (agent.isTransferAllow !== isTransferAllow) {
                    await Sys.App.Services.agentServices.updateAgentData({ '_id': noteId }, {
                        'isTransferAllow': isTransferAllow ? isTransferAllow : agent.isTransferAllow
                    });
                }
                if (chips) {
                    let transaction = {
                        to: agent.id,
                        from: agent.id,
                        chips: chips,
                        fromRole: 'agent',
                        action: "deduct",
                        toRole: 'agent',
                        walletType: "rakeWallet",
                        message: "transfer by admin"
                    }
                    let response = await Sys.Helper.Poker.Transaction(transaction);
                    console.log(response);
                    req.flash("success", response.message);
                    let backURL = '/agents';
                    res.redirect(backURL);
                }
            }
        } catch (e) {
            console.log(e);
            req.flash("error", e.message);
            let backURL = '/agents';
            res.redirect(backURL);
        }
    },


    getTransferChip: async function(req, res) {
        try {
            let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.params.id }, ['isTransferAllow']);
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                agentActive: 'active',
                agent: agent,
            };
            return res.send(data);
        } catch (e) {
            console.log("Error", e);
            return new Error("Error", e);
        }
    },
    agentPlayerStats: async function(req, res) {
        try {
            //let level = 1;
            //if(req.session.details.is_admin != 'yes'){
            let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.params.id });
            let level = getLevel.level;
            //}

            let agentCount = await Sys.App.Services.agentServices.getAgentCount({ parentId: req.params.id });
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                agentActive: 'active',
                agentLevel: level,
                agentCount: agentCount,
                agentId: req.params.id,
                agentRole: getLevel.role,
                agent: getLevel,
                AgentMenu: 'active menu-open',
                is_admin: req.session.details.is_admin,
            };
            return res.render('agent/agentPlayerStats', data);
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    },

    getAgentStats: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;
            console.log(req.params.id);
            let query = {};

            if (search != '') {
                query = { parentId: req.params.id, email: { $regex: '.*' + search + '.*' } };
            } else {
                query = { parentId: req.params.id };
            }

            let agentCount = await Sys.App.Services.agentServices.getAgentCount(query);
            let data = await Sys.App.Services.agentServices.getAgentDatatable(query, length, start);
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': agentCount,
                'recordsFiltered': agentCount,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
            return new Error("Error", e);
        }
    },

    getPlayerStats: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;
            console.log(req.params.id);
            let query = {};

            if (search != '') {
                query = { agentId: req.params.id, email: { $regex: '.*' + search + '.*' } };
            } else {
                query = { agentId: req.params.id };
            }

            let playerCount = await Sys.App.Services.PlayerServices.getPlayerCount(query);
            let data = await Sys.App.Services.PlayerServices.getPlayerDatatable(query, length, start);
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': playerCount,
                'recordsFiltered': playerCount,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
            return new Error("Error", e);
        }
    },

    agentRackHistory: async function(req, res) {
        try {
            /*let query = [
          { 
            $match: { 
              rackToId :req.params.id,
            }
          },
          { $group: {
              _id: null,
              total:   { $sum:  "$totalRack"  },
            }
          },
        ];
      
      
      let totalRackReceived = await Sys.App.Services.RackHistoryServices.aggregateQuery(query);
      let totalRack = 0;
      if(totalRackReceived.length >0){
        totalRack = totalRackReceived[0].total;
      }*/

            let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.params.id });
            // let agentRole= rolesArray[agent.level -1];

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                agentActive: 'active',
                AgentMenu: 'active menu-open',
                agentId: req.params.id,
                //agentTotalRackReceived: parseFloat( parseFloat( totalRack ).toFixed(2) ),
                agentTotalRackReceived: 0.00,
                agentRole: agent.role,
                agent: agent,
            };
            return res.render('agent/agentRack', data);
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    },

    getAgentRackHistory: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;

            // query to get particular agent or admin's sub-agents
            let query = { rackToId: req.params.id };
            var matchQuery = { rackToId: req.params.id };
            if (req.query.is_datefilter == '1') {

                let start_date = new Date(req.query.start_date)
                let end_date = new Date(req.query.end_date)
                end_date.setHours(23, 59, 59, 999);

                query.createdAt = { "$gte": start_date, "$lte": end_date };
                matchQuery.createdAt = { "$gte": start_date, "$lte": end_date };
            }
            if (search != '') {
                query.gameNumber = { $regex: '.*' + search + '.*' };
                matchQuery.gameNumber = { $regex: '.*' + search + '.*' };
            }

            let aggQuery = [{
                    $match: matchQuery
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalRack" },
                    }
                },
            ];


            let totalRackReceived = await Sys.App.Services.RackHistoryServices.aggregateQuery(aggQuery);
            let totalRack = 0;
            if (totalRackReceived.length > 0) {
                totalRack = totalRackReceived[0].total;
            }

            let agentCount = await Sys.App.Services.RackHistoryServices.getCount(query);
            //let agentCount = agentsC.length;
            let data = await Sys.App.Services.RackHistoryServices.getPopulatedData(query, null, { skip: start, limit: length, sort: { createdAt: -1 } }, 'player');
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': agentCount,
                'recordsFiltered': agentCount,
                'data': data,
                'totalRack': totalRack
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
            return new Error("Error", e);
        }
    },

    agentRackHistoryTest: async function(req, res) {
        try {
            let query = [

                {
                    $match: {
                        rackToId: req.params.id,

                    }
                },

                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalRack" },
                        //total:   { $sum: { "$toDouble": "$totalRack" } },

                    }
                },
            ];


            let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.params.id });
            let agentRole = rolesArray[agent.level - 1];

            let totalRackReceived = await Sys.App.Services.RackHistoryServices.aggregateQuery(query);
            let totalRack = 0;
            if (totalRackReceived.length > 0) {
                totalRack = totalRackReceived[0].total;
            }
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                agentActive: 'active',
                AgentMenu: 'active menu-open',
                agentId: req.params.id,
                agentTotalRackReceived: parseFloat(parseFloat(totalRack).toFixed(2)),
                agentRole: agentRole,
                agent: agent,
            };
            return res.render('agent/agentRackTest', data);
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    },

    getAgentRackHistoryTest: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = '';
            var rackHistory = mongoose.model('rackHistory');

            // query to get particular agent or admin's sub-agents

            let startDate = new Date('2019-07-29')
            let endDate = new Date('2019-08-17')
            endDate.setHours(23, 59, 59, 999);

            let query = { rackToId: req.params.id };
            query.createdAt = { "$gte": startDate, "$lte": endDate };
            console.log("getAgentRackHistoryTest query: ", query);

            let agentCount = await Sys.App.Services.RackHistoryServices.getCount(query);
            //let agentCount = agentsC.length;


            let data = await Sys.App.Services.RackHistoryServices.getPopulatedData(query, null, { skip: start, limit: length, sort: { createdAt: -1 } }, 'player');
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': agentCount,
                'recordsFiltered': agentCount,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
            return new Error("Error", e);
        }
    },

    myRackHistory: async function(req, res) {
        try {

            /*let query = [

                { 
                    $match: { 
                      rackToId : req.session.details.id,
                        
                    }
                },
              
              { $group: {
                      _id: null,
                      total:   { $sum:  "$totalRack"  },
                      //total:   { $sum: { "$toDouble": "$totalRack" } },
                }
              },
        ];
           
      let totalRackReceived = await Sys.App.Services.RackHistoryServices.aggregateQuery(query);
      let totalRack = 0;
      if(totalRackReceived.length >0){
        totalRack = totalRackReceived[0].total;
      }*/
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                myRackActive: 'active',
                AgentMenu: 'active menu-open',
                //agentTotalRackReceived: parseFloat( parseFloat( totalRack ).toFixed(2) ),
                agentTotalRackReceived: 0,
            };
            return res.render('agent/myRack', data);
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    },

    getMyRackHistory: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;

            let query = { rackToId: req.session.details.id };
            var matchQuery = { rackToId: req.session.details.id };
            if (req.query.is_datefilter == '1') {

                let start_date = new Date(req.query.start_date)
                let end_date = new Date(req.query.end_date)
                start_date = new Date(start_date)
                start_date.setHours(00);
                end_date.setHours(23, 59, 59, 999);

                query.createdAt = { "$gte": start_date, "$lte": end_date };
                matchQuery.createdAt = { "$gte": start_date, "$lte": end_date };
            }

            // query to get particular agent or admin's sub-agents

            if (search != '') {
                query.gameNumber = { $regex: '.*' + search + '.*' };
                matchQuery.gameNumber = { $regex: '.*' + search + '.*' };
            }

            console.log("matchQuery: ", matchQuery);
            let aggQuery = [{
                    $match: matchQuery
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalRack" },
                    }
                },
            ];

            let totalRackReceived = await Sys.App.Services.RackHistoryServices.aggregateQuery(aggQuery);
            let totalRack = 0;
            if (totalRackReceived.length > 0) {
                totalRack = totalRackReceived[0].total;
            }


            let agentCount = await Sys.App.Services.RackHistoryServices.getCount(query);
            //let agentCount = agentsC.length;
            console.log("vaatsal", query);

            let data = await Sys.App.Services.RackHistoryServices.getPopulatedData(query, null, { skip: start, limit: length, sort: { createdAt: -1 } }, 'player');
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': agentCount,
                'recordsFiltered': agentCount,
                'data': data,
                'totalRack': totalRack
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
            return new Error("Error", e);
        }
    },

    agentTree: async function(req, res) {
        try {

            console.log("admin id or current user id", req.session.details.id);
            var stack = [];
            var descendants = {};
            let level = '2';
            if (req.session.details.is_admin != 'yes') {
                let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.session.details.id });
                level = getLevel.level;
            }

            let item = await Sys.App.Services.agentServices.getAgentData({ parentId: req.session.details.id, level: level });
            // stack.push(item);
            stack = stack.concat(item);
            descendants[req.session.details.id] = item;
            while (stack.length > 0) {
                console.log("inside length", stack.length);
                console.log("inside stacks", stack);
                var currentnode = stack.pop();
                var id = currentnode._id;
                console.log(id);
                //console.log("current node",currentnode);
                var children = await Sys.App.Services.agentServices.getAgentData({ parentId: id, level: (parseInt(currentnode.level) + 1) });
                console.log("next child", children);


                descendants[id] = children;
                children.forEach(function(next) {

                    stack = stack.concat(children);

                });

            }




            res.send(descendants);




            /*var descendants=[]
            var stack=[];
            let item = await Sys.App.Services.agentRelationServices.getSingleAgentRelationData({parentId: req.session.details.id});
            stack.push(item);
            //console.log("stacks", stack);console.log(stack.length);
            while (stack.length>0){
              //console.log("inside length",stack.length); console.log("inside stacks", stack);
                var currentnode = stack.pop();
                var id =currentnode.parentId;
                //console.log(id);
                //console.log("current node",currentnode);
                var children =  await Sys.App.Services.agentRelationServices.getAgentRelationData({parentId:{$in:currentnode.childId}});
                //console.log("next child",children);
                
                
                descendants.push({id:children});
                children.forEach(function(next) {
                    
                    stack.push(next);
                    
                });

            }*/

            //descendants.join(",") 

            // var data = {
            //   App : Sys.Config.App.details,Agent : req.session.details,
            //   error: req.flash("error"),
            //   success: req.flash("success"),
            //   agentActive : 'active'
            // };
            // return res.render('agent/treeStructure',data);


            //console.log(item);
            //res.send(descendants);
        } catch (e) {
            console.log("Error in getting tree data : ", e);
            return new Error(e);
        }
    },

    requestCash: async function(req, res) {
        try {
            let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).format("YYYY-MM-DD HH:mm");
            let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).format("YYYY-MM-DD HH:mm");
            let current_date = moment(new Date()).format("YYYY-MM-DD HH:mm");
            if ((current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status == 'active') || Sys.Setting.maintenance.quickMaintenance == "active") {
                req.flash('error', 'Maintenance mode is on please try again later.');
                let backURL = req.header('Referer') || '/agents';
                res.redirect(backURL);
                return;
            } else {
                let requestedAgent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: req.body.agentId })
                if (req.session.details.is_admin == 'yes') {
                    let transaction = {
                        to: req.body.agentId,
                        from: req.session.details.id,
                        chips: req.body.chips,
                        fromRole: 'admin',
                        action: req.body.requestType,
                        toRole: 'agent'
                    }
                    let response = await Sys.Helper.Poker.Transaction(transaction);
                    console.log(response);
                } else if (req.session.details.is_admin != 'yes' && requestedAgent.parentId == req.session.details.id) {
                    let transaction = {
                        to: req.body.agentId,
                        from: req.session.details.id,
                        chips: req.body.chips,
                        fromRole: 'agent',
                        action: req.body.requestType,
                        toRole: 'agent'
                    }
                    let response = await Sys.Helper.Poker.Transaction(transaction);
                    console.log(response);
                } else if (req.session.details.is_admin != 'yes' && requestedAgent.parentId != req.session.details.id) {
                    console.log("no, you are not eligible to add or deduct the cash for this particular agent.")
                    req.flash("error", 'You are not eligible to add or deduct the cash for this particular agent.');
                    let backURL = req.header('Referer') || '/agents';
                    res.redirect(backURL);
                }
                let noteDetail = await Sys.App.Services.agentServices.getSingleChipsNote({ 'requestById': req.session.details.id, 'requestToId': req.body.agentId });
                if (noteDetail == null) {
                    await Sys.App.Services.agentServices.insertChipsNoteData({
                        requestById: req.session.details.id,
                        requestToId: req.body.agentId,
                        note: req.body.chips_note,
                        type: 'agent'
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
            console.log(e);
            req.flash('error', e.message);
            return res.redirect('/agents');
        }
    },


    getChipsNotes: async function(req, res) {
        try {

            // console.log("req.session.details.id: ", req.session.details.id);
            var noteDetail = await Sys.App.Services.agentServices.getSingleChipsNote({ 'requestById': req.session.details.id, 'requestToId': req.body.agent_id });
            console.log("noteDetail: ", noteDetail);
            res.send({ 'status': 'success', 'message': 'chips note', data: noteDetail });
        } catch (e) {
            console.log("Error when get chips note: ", e)
            res.send({ 'status': 'fail', 'message': 'Agent chips note not availabel' });
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
                    type: 'agent'
                });

                req.flash("success", 'Note save successfully');
            }


            let backURL = '/agents';
            res.redirect(backURL);
        } catch (e) {
            req.flash("error", 'Note note update');
            let backURL = '/agents';
            res.redirect(backURL);
        }
    },

    agentUpdateBalance: async function(req, res) {
        try {
            var agentList = await Sys.App.Services.agentServices.getAgentData({});

            //console.log("agentList: ", agentList);

            for (var i = 0; i < agentList.length; i++) {

                var newChips = parseFloat(agentList[i].chips) + parseFloat(agentList[i].temp_chips);

                console.log("agentList[i].chips: ", agentList[i].chips);
                console.log("agentList[i].temp_chips: ", agentList[i].temp_chips);
                console.log("newChips: ", newChips);

                await Sys.App.Services.agentServices.updateAgentData({ _id: agentList[i].id }, { 'temp_chips': 0.00 })
            }

        } catch (err) {
            console.log("error when agent balance update: ", err);
        }
    }

}