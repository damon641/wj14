const mongoose = require('mongoose');
var Sys = require('../Boot/Sys');
module.exports = {

    numFormater: function(num) {
        try {
            var si = [
                { value: 1, symbol: "" },
                { value: 1E3, symbol: "k" },
                { value: 1E6, symbol: "M" },
                { value: 1E9, symbol: "G" },
                { value: 1E12, symbol: "T" },
                { value: 1E15, symbol: "P" },
                { value: 1E18, symbol: "E" }
            ];
            var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
            var i;
            for (i = si.length - 1; i > 0; i--) {
                if (num >= si[i].value) {
                    break;
                }
            }
            return (num / si[i].value).toFixed(0).replace(rx, "$1") + si[i].symbol;
        } catch (e) {
            console.log("")
            return 0;
        }
    },
    getAgoTime: function(date) {
        let incommingDate = new Date(date);
        let currentDate = new Date();
        // let currentTimeUtc =new Date(
        //   date.getUTCFullYear(),
        //   date.getUTCMonth(),
        //   date.getUTCDate(),
        //   date.getUTCHours(),
        //   date.getUTCMinutes(), 
        //   date.getUTCSeconds()
        // );
        let seconds = (currentDate.getTime() - incommingDate.getTime()) / 1000;
        console.log(seconds)
        let message = "few seconds ago"
        if (seconds > 60) {
            if (Math.floor(seconds / (24 * 60 * 60)) < 1) {
                if (Math.floor(seconds / 3600) < 1) {
                    message = (Math.floor(seconds % 3600 / 60)) + " minutes ago";
                } else {
                    if (Math.floor(seconds / 3600) == 1) {
                        message = (Math.floor(seconds / 3600)) + " hour ago";
                    } else {
                        message = (Math.floor(seconds / 3600)) + " hours ago";
                    }
                }
            } else {
                message = (Math.floor(seconds / (24 * 60 * 60))) + " day ago";
            }
        }
        return message;
    },

    Transaction: async function(data) {
        let session = await mongoose.startSession();
        await session.startTransaction();
        try {
            let opts = { session: session };
            let toDetails;
            let fromDetails; {
                if (data.toRole == "admin") {
                    toDetails = await Sys.App.Services.UserServices.getUserCount({ _id: data.to })
                    if (!toDetails) {
                        console.log("This (" + data.to + ") Admin Detail Not Found.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.to,
                            providerId: data.from,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.to + ") Admin Detail Not Found."
                        });
                        throw { "status": "Error", "message": "This Admin Detail Not Found." };
                    }
                } else if (data.toRole == "senior" || data.toRole == "master" || data.toRole == "agent") {
                    toDetails = await Sys.App.Services.agentServices.getAgentCount({ _id: data.to })
                    if (!toDetails) {
                        console.log("This (" + data.to + ") Agent Detail Not Found.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.to,
                            providerId: data.from,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.to + ") Agent Detail Not Found."
                        });
                        throw { "status": "Error", "message": "This Agent Detail Not Found." };
                    }
                } else if (data.toRole == "player") {
                    toDetails = await Sys.App.Services.PlayerServices.getPlayerCount({ _id: data.to })
                    if (!toDetails) {
                        console.log("This (" + data.to + ") Player Detail Not Found.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.to,
                            providerId: data.from,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.to + ") Player Detail Not Found."
                        });
                        throw { "status": "Error", "message": "This Player Detail Not Found." };
                    }
                } else if (data.toRole == "system") {
                    toDetails = await Sys.App.Services.SettingsServices.getSettingsData({ _id: data.to })
                    console.log("", toDetails);
                    if (!toDetails) {
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.to,
                            providerId: data.from,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.to + ") System Detail Not Found."
                        });
                        console.log("This (" + data.to + ") System Detail Not Found.");
                        throw { "status": "Error", "message": "This System Detail Not Found." };
                    }
                }
                if (data.fromRole == "admin") {
                    toDetails = await Sys.App.Services.UserServices.getUserCount({ _id: data.from })
                    if (!toDetails) {
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.to,
                            providerId: data.from,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.from + ") Admin Detail Not Found."
                        });
                        console.log("This (" + data.from + ") Admin Detail Not Found.");
                        throw { "status": "Error", "message": "This Admin Detail Not Found." };
                    }
                } else if (data.fromRole == "senior" || data.fromRole == "master" || data.fromRole == "agent") {
                    toDetails = await Sys.App.Services.agentServices.getAgentCount({ _id: data.from })
                    if (!toDetails) {
                        console.log("This (" + data.from + ") Agent Detail Not Found.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.to,
                            providerId: data.from,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.from + ") Agent Detail Not Found."
                        });
                        throw { "status": "Error", "message": "This Agent Detail Not Found." };
                    }
                } else if (data.fromRole == "player") {
                    toDetails = await Sys.App.Services.PlayerServices.getPlayerCount({ _id: data.from })
                    if (!toDetails) {
                        console.log("This (" + data.from + ") Player Detail Not Found.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.to,
                            providerId: data.from,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.from + ") Player Detail Not Found."
                        });
                        throw { "status": "Error", "message": "This Player Detail Not Found." };
                    }
                } else if (data.fromRole == "system") {
                    toDetails = await Sys.App.Services.SettingsServices.getSettingsData({ _id: data.from })
                    if (!toDetails) {
                        console.log("This (" + data.from + ") System Detail Not Found.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.to,
                            providerId: data.from,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.from + ") System Detail Not Found."
                        });
                        throw { "status": "Error", "message": "This System Detail Not Found." };
                    }
                }
            }
            console.log("action :", data.action);
            if (data.action == "Add" || data.action == "add") {
                if (data.fromRole == "admin") {
                    fromDetails = await Sys.App.Services.UserServices.findUpdateUserData({ _id: data.from }, { $inc: { chips: -data.chips } }, opts);
                    if (!fromDetails) {
                        console.log("This (" + data.fromRole + ") Admin Detail Not Found.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.to,
                            providerId: data.from,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.from + ") Admin Detail Not Found."
                        });

                        throw { "status": "Error", "message": "This Admin Detail Not Found." };
                    } else if (fromDetails.chips < 0 || fromDetails.chips < data.chips) {
                        console.log(" Admin does not have enough chips.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.to,
                            providerId: data.from,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.from + ") Admin Insufficient chips In Your Wallet."
                        });
                        throw { "status": "Error", "message": "This Admin  does not have enough chips." };
                    }
                    if (data.toRole == "senior" || data.toRole == "master" || data.toRole == "agent") {
                        console.log("requested is admin and transaction with admin of agents or all agents")
                        toDetails = await Sys.App.Services.agentServices.FindOneUpdateAgentData({ _id: data.to }, { $inc: { chips: data.chips } }, opts)
                        if (!toDetails) {
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.to,
                                providerId: data.from,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Agent Detail Not Found."
                            });
                            console.log("This (" + data.toRole + ") Agent Detail Not Found.");
                            throw { "status": "Error", "message": "This Agent Detail Not Found." };
                        } else if (toDetails.chips < 0) {
                            console.log("This (" + data.toRole + ") Agent does not have enough chips.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.to,
                                providerId: data.from,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Agent does not have enough chips."
                            });
                            throw { "status": "Error", "message": "This Agent does not have enough chips." };
                        }
                    } else if (data.toRole == "player") {
                        console.log("requested is admin and transaction with admin of players or all players")
                        toDetails = await Sys.App.Services.PlayerServices.FindOneUpdatePlayerData({ _id: data.to }, { $inc: { chips: data.chips } }, opts)
                        if (!toDetails) {
                            console.log("This (" + data.toRole + ") Player Detail Not Found.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.to,
                                providerId: data.from,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Player Detail Not Found."
                            });
                            throw { "status": "Error", "message": "This Player Detail Not Found." };
                        } else if (toDetails.chips < 0) {
                            console.log("This (" + data.toRole + ") Player does not have enough chips.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.to,
                                providerId: data.from,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Player does not have enough chips."
                            });
                            throw { "status": "Error", "message": "This Player does not have enough chips." };
                        }
                    } else if (data.toRole == "system") {
                        toDetails = await Sys.App.Services.SettingsServices.FindOneAndUpdateSettingsData({ _id: data.to }, { $inc: { systemChips: data.chips } }, opts);
                        if (!toDetails) {
                            console.log("This (" + data.toRole + ") System Detail Not Found.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.to,
                                providerId: data.from,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") System Detail Not Found."
                            });
                            throw { "status": "Error", "message": "This System Detail Not Found." };
                        }
                    }
                    let traNumber = +new Date()
                    await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                        'receiverId': fromDetails.id,
                        'receiverRole': fromDetails.role,
                        'providerId': toDetails.id,
                        'providerRole': data.toRole == "system" ? "system" : toDetails.role,
                        'providerEmail': data.toRole == "system" ? "system" : data.toRole == "player" ? toDetails.username : toDetails.email,
                        'chips': parseFloat(parseFloat(data.chips).toFixed(2)),
                        'message': data.toRole == "system" ? 'Transaction To system' : data.toRole == "player" ? 'Transaction To ' + toDetails.uniqId : 'Transaction To ' + toDetails.email,
                        'remark': data.toRole == "system" ? 'Transaction To system' : data.toRole == "player" ? 'Transaction To ' + toDetails.uniqId : 'Transaction To ' + toDetails.email,
                        'transactionNumber': 'DE-' + traNumber,
                        'beforeBalance': eval(parseFloat(fromDetails.chips).toFixed(2)),
                        'afterBalance': eval(parseFloat(fromDetails.chips).toFixed(2) - parseFloat(data.chips).toFixed(2)),
                        'type': 'deduct',
                        'status': 'success',
                    });
                    console.log(toDetails);
                    await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                        'receiverId': data.toRole != "system" ? toDetails.id : "System",
                        'receiverRole': toDetails.role,
                        'providerId': fromDetails.id,
                        'providerRole': fromDetails.role,
                        'providerEmail': fromDetails.email,
                        'chips': parseFloat(parseFloat(data.chips).toFixed(2)),
                        'message': 'Received From ' + fromDetails.email,
                        'remark': 'Received From ' + fromDetails.email,
                        'transactionNumber': 'DEP-' + traNumber,
                        'beforeBalance': data.toRole == "system" ? +parseFloat(toDetails.systemChips).toFixed(2) : eval(parseFloat(toDetails.chips).toFixed(2)),
                        'afterBalance': data.toRole == "system" ? parseFloat(parseFloat(toDetails.systemChips) + parseFloat(data.chips)) : parseFloat(parseFloat(toDetails.chips) + parseFloat(data.chips)).toFixed(2),
                        'type': 'deposit',
                        'category': 'credit',
                        'status': 'success',
                    });
                } else if (data.fromRole == "senior" || data.fromRole == "master" || data.fromRole == "agent") {
                    fromDetails = await Sys.App.Services.agentServices.FindOneUpdateAgentData({ _id: data.from }, { $inc: { chips: -data.chips } }, opts);
                    if (!fromDetails) {
                        console.log("This (" + data.fromRole + ") Agent Detail Not Found.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.to,
                            providerId: data.from,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.from + ") Agent Detail Not Found."
                        });
                        throw { "status": "Error", "message": "This Agent Detail Not Found." };
                    } else if (fromDetails.chips < 0 || fromDetails.chips < data.chips) {
                        console.log("This (" + data.fromRole + ") Agent insufficient chips In Your Wallet.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.to,
                            providerId: data.from,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.from + ") Agent insufficient chips In Your Wallet."
                        });
                        throw { "status": "Error", "message": "This Agent insufficient chips In Your Wallet." };
                    }
                    if (data.toRole == "senior" || data.toRole == "master" || data.toRole == "agent") {
                        console.log(" requested id is parent Id of session Detail Id, agent to agent transfer")
                        toDetails = await Sys.App.Services.agentServices.FindOneUpdateAgentData({ _id: data.to }, { $inc: { chips: data.chips } }, opts)
                        if (!toDetails) {
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.to,
                                providerId: data.from,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Agent Detail Not Found."
                            });
                            console.log("This (" + data.toRole + ") Agent Detail Not Found.");
                            throw { "status": "Error", "message": "This Agent Detail Not Found." };
                        } else if (toDetails.chips < 0) {
                            console.log("This (" + data.toRole + ") Agent does not have enough chips.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.to,
                                providerId: data.from,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Agent does not have enough chips."
                            });

                            throw { "status": "Error", "message": "This Agent does not have enough chips." };
                        }
                    } else if (data.toRole == "player") {
                        console.log(" requested id is parent Id of session Detail Id, agent to player transfer")
                        toDetails = await Sys.App.Services.PlayerServices.FindOneUpdatePlayerData({ _id: data.to }, { $inc: { chips: data.chips } }, opts)
                        if (!toDetails) {
                            console.log("This (" + data.toRole + ") Player Detail Not Found.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.to,
                                providerId: data.from,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Player Detail Not Found."
                            });
                            throw { "status": "Error", "message": "This Player Detail Not Found." };
                        } else if (toDetails.chips < 0) {
                            console.log("This (" + data.toRole + ") Player does not have enough chips.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.to,
                                providerId: data.from,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Player does not have enough chips."
                            });
                            throw { "status": "Error", "message": "This Player does not have enough chips." };
                        }
                    }
                    let traNumber = +new Date()
                    await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                        'receiverId': fromDetails.id,
                        'receiverRole': fromDetails.role,
                        'providerId': toDetails.id,
                        'providerRole': toDetails.role,
                        'providerEmail': data.toRole == "player" ? toDetails.uniqId : toDetails.email,
                        'chips': parseFloat(parseFloat(data.chips).toFixed(2)),
                        'message': data.toRole == "player" ? 'Transaction To ' + toDetails.uniqId : 'Transaction To ' + toDetails.email,
                        'remark': data.toRole == "player" ? 'Transaction To ' + toDetails.uniqId : 'Transaction To ' + toDetails.email,
                        'transactionNumber': 'DE-' + traNumber,
                        'beforeBalance': eval(parseFloat(fromDetails.chips).toFixed(2)),
                        'afterBalance': eval(parseFloat(fromDetails.chips).toFixed(2) - parseFloat(data.chips).toFixed(2)),
                        'type': 'deduct',
                        'category': 'debit',
                        'status': 'success',
                    });
                    await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                        'receiverId': toDetails.id,
                        'receiverRole': toDetails.role,
                        'providerId': fromDetails.id,
                        'providerRole': toDetails.role,
                        'providerEmail': fromDetails.email,
                        'chips': parseFloat(parseFloat(data.chips).toFixed(2)),
                        'message': 'Received From ' + fromDetails.email,
                        'remark': 'Received From ' + fromDetails.email,
                        'transactionNumber': 'DEP-' + traNumber,
                        'beforeBalance': eval(parseFloat(toDetails.chips).toFixed(2)),
                        'afterBalance': parseFloat(parseFloat(toDetails.chips) + parseFloat(data.chips)).toFixed(2),
                        'type': 'deposit',
                        'category': 'credit',
                        'status': 'success',
                    });
                } else if (data.fromRole == "player" && data.toRole == "player") {
                    console.log("player to player transfer")
                    fromDetails = await Sys.App.Services.PlayerServices.FindOneUpdatePlayerData({ _id: data.from }, { $inc: { chips: -data.chips } }, opts);
                    if (!fromDetails) {
                        console.log("This (" + data.fromRole + ") Player Detail Not Found.");
                        throw { "status": "Error", "message": "This Player Detail Not Found." };
                    } else if (fromDetails.chips < 0 || fromDetails.chips < data.chips) {
                        console.log("This (" + data.fromRole + ") Player Insufficient chips In Your Wallet.");
                        throw { "status": "Error", "message": "This Player Insufficient chips In Your Wallet." };
                    } else {
                        toDetails = await Sys.App.Services.PlayerServices.FindOneUpdatePlayerData({ _id: data.to }, { $inc: { chips: data.chips } }, opts)
                        if (!toDetails) {
                            console.log("This (" + data.toRole + ") Player Detail Not Found.");
                            throw { "status": "Error", "message": "This Player Detail Not Found." };
                        } else if (toDetails.chips < 0) {
                            console.log("This (" + data.toRole + ") Player does not have enough chips.");
                            throw { "status": "Error", "message": "This Player does not have enough chips." };
                        }
                        let traNumber = +new Date()
                        let transactionDebitData = {
                            user_id: fromDetails.id,
                            username: toDetails.username,
                            chips: parseFloat(data.chips),
                            previousBalance: parseFloat(fromDetails.chips),
                            providerEmail: toDetails.uniqId,
                            afterBalance: parseFloat(parseFloat(fromDetails.chips) - parseFloat(data.chips)).toFixed(2),
                            providerId: fromDetails.id,
                            category: 'debit',
                            type: 'deduct',
                            status: "success",
                            remark: 'Transaction To ' + toDetails.uniqId,
                            message: 'Transaction To ' + toDetails.uniqId,
                            transactionNumber: 'DE-' + traNumber,

                        }
                        await Sys.Game.Common.Services.PlayerServices.insertData(transactionDebitData);
                        let transactionCreditData = {
                            user_id: toDetails.id,
                            username: fromDetails.username,
                            chips: parseFloat(data.chips),
                            providerEmail: fromDetails.uniqId,
                            previousBalance: parseFloat(toDetails.chips),
                            afterBalance: parseFloat(parseFloat(toDetails.chips) + parseFloat(data.chips)).toFixed(2),
                            providerId: fromDetails.id,
                            category: 'credit',
                            type: 'deposit',
                            status: "success",
                            remark: 'Received From ' + fromDetails.uniqId,
                            message: 'Received From ' + fromDetails.uniqId,
                            transactionNumber: 'DEP-' + traNumber,
                        }
                        await Sys.Game.Common.Services.PlayerServices.insertData(transactionCreditData);
                    }
                }
            } else {
                if (data.fromRole == "admin") {
                    if (data.toRole == "senior" || data.toRole == "master" || data.toRole == "agent") {
                        console.log("requested is admin and transaction with admin of agents or all agents")
                        fromDetails = await Sys.App.Services.agentServices.FindOneUpdateAgentData({ _id: data.to }, { $inc: { chips: -data.chips } }, opts);
                        if (!fromDetails) {
                            console.log("This (" + data.toRole + ") Agent Detail Not Found.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.from,
                                providerId: data.to,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Agent Detail Not Found."
                            });
                            throw { "status": "Error", "message": "This Agent Detail Not Found." };
                        } else if (fromDetails.chips < 0 || fromDetails.chips < data.chips) {
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.from,
                                providerId: data.to,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Agent Insufficient chips In Your Wallet."
                            });
                            console.log("This (" + data.toRole + ") Agent Insufficient chips In Your Wallet.");
                            throw { "status": "Error", "message": "This Agent Insufficient chips In Your Wallet." };
                        }
                    } else if (data.toRole == "player") {
                        console.log("requested is admin and transaction with admin of player or all player")
                        fromDetails = await Sys.App.Services.PlayerServices.FindOneUpdatePlayerData({ _id: data.to }, { $inc: { chips: -data.chips } }, opts);
                        if (!fromDetails) {
                            console.log("This (" + data.toRole + ") Player Detail Not Found.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.from,
                                providerId: data.to,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Player Detail Not Found."
                            });
                            throw { "status": "Error", "message": "This Player Detail Not Found." };
                        } else if (fromDetails.chips < 0 || fromDetails.chips < data.chips) {
                            console.log("This (" + data.toRole + ") Player Insufficient chips In Your Wallet.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.from,
                                providerId: data.to,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.toRole + ") Player Insufficient chips In Your Wallet."
                            });
                            throw { "status": "Error", "message": "This Player Insufficient chips In Your Wallet." };
                        }
                    } else if (data.toRole == "system") {
                        fromDetails = await Sys.App.Services.SettingsServices.FindOneAndUpdateSettingsData({ _id: data.to }, { $inc: { systemChips: -data.chips } }, opts);
                        if (!fromDetails) {
                            console.log("This (" + data.toRole + ") System Detail Not Found.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.from,
                                providerId: data.to,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.toRole + ") System Detail Not Found."
                            });
                            throw { "status": "Error", "message": "This System Detail Not Found." };
                        }
                    } else if (data.toRole == "admin") {
                        if (data.walletType == "rakeWallet") {
                            fromDetails = await Sys.App.Services.UserServices.findUpdateUserData({ _id: data.from }, { $inc: { rake_chips: -data.chips } }, opts)
                            if (!fromDetails) {
                                console.log("This (" + data.fromRole + ") Admin Detail Not Found.");
                                await Sys.App.Services.errorReportServices.createErrorLog({
                                    receiverId: data.from,
                                    providerId: data.to,
                                    gameTotalChips: data.chips,
                                    remark: "This (" + data.from + ") Admin Detail Not Found."
                                });
                                throw { "status": "Error", "message": "This Admin Detail Not Found." };
                            } else if (fromDetails.rake_chips < 0 || fromDetails.rake_chips < data.chips) {
                                console.log("This (" + data.fromRole + ") Admin does not have enough chips.");
                                await Sys.App.Services.errorReportServices.createErrorLog({
                                    receiverId: data.from,
                                    providerId: data.to,
                                    gameTotalChips: data.chips,
                                    remark: "This (" + data.fromRole + ") Admin does not have enough chips."
                                });
                                throw { "status": "Error", "message": "This Admin does not have enough chips." };
                            }
                        } else if (data.walletType == "extraRakeWallet") {
                            fromDetails = await Sys.App.Services.UserServices.findUpdateUserData({ _id: data.from }, { $inc: { extraRakeChips: -data.chips } }, opts)
                            if (!fromDetails) {
                                await Sys.App.Services.errorReportServices.createErrorLog({
                                    receiverId: data.from,
                                    providerId: data.to,
                                    gameTotalChips: data.chips,
                                    remark: "This (" + data.from + ") Admin Detail Not Found."
                                });
                                console.log("This (" + data.fromRole + ") Admin Detail Not Found.");
                                throw { "status": "Error", "message": "This Admin Detail Not Found." };
                            } else if (fromDetails.extraRakeChips < 0 || fromDetails.extraRakeChips < data.chips) {
                                console.log("This (" + data.fromRole + ") Admin does not have enough chips.");
                                await Sys.App.Services.errorReportServices.createErrorLog({
                                    receiverId: data.from,
                                    providerId: data.to,
                                    gameTotalChips: data.chips,
                                    remark: "This (" + data.fromRole + ") Admin does not have enough chips."
                                });
                                throw { "status": "Error", "message": "This Admin does not have enough chips." };
                            }
                        }
                    }
                    toDetails = await Sys.App.Services.UserServices.findUpdateUserData({ _id: data.from }, { $inc: { chips: data.chips } }, opts)
                    if (!toDetails) {
                        console.log("This (" + data.fromRole + ") Admin Detail Not Found.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.from,
                            providerId: data.to,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.from + ") Admin Detail Not Found."
                        });
                        throw { "status": "Error", "message": "This Admin Detail Not Found." };
                    } else if (toDetails.chips < 0) {
                        console.log("This (" + data.fromRole + ") Admin does not have enough chips.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.from,
                            providerId: data.to,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.from + ") Admin does not have enough chips."
                        });
                        throw { "status": "Error", "message": "This Admin does not have enough chips." };
                    }
                    let traNumber = +new Date()
                    await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                        'receiverId': toDetails.id,
                        'receiverRole': fromDetails.role,
                        'providerId': fromDetails.id,
                        'providerRole': toDetails.role,
                        'providerEmail': data.toRole == "system" ? "system" : data.toRole == "player" ? fromDetails.username : fromDetails.email,
                        'chips': parseFloat(parseFloat(data.chips).toFixed(2)),
                        'message': data.toRole == "system" ? 'Received From system' : data.toRole == "player" ? 'Received From ' + fromDetails.uniqId : 'Received From ' + fromDetails.email,
                        'remark': data.toRole == "system" ? 'Received From system' : data.toRole == "player" ? 'Received From ' + fromDetails.uniqId : 'Received From ' + fromDetails.email,
                        'transactionNumber': 'DEP-' + traNumber,
                        'beforeBalance': eval(parseFloat(toDetails.chips).toFixed(2)),
                        'afterBalance': parseFloat(parseFloat(toDetails.chips) + parseFloat(data.chips)).toFixed(2),
                        'type': 'deposit',
                        'category': 'credit',
                        'status': 'success',
                    });
                    await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                        'receiverId': data.toRole != "system" ? fromDetails.id : "System",
                        'receiverRole': fromDetails.role,
                        'providerId': toDetails.id,
                        'providerRole': toDetails.role,
                        'providerEmail': toDetails.email,
                        'chips': parseFloat(parseFloat(data.chips).toFixed(2)),
                        'message': 'Transaction To ' + toDetails.email,
                        'remark': 'Transaction To ' + toDetails.email,
                        'transactionNumber': 'DE-' + traNumber,
                        'beforeBalance': data.toRole == "system" ? fromDetails.systemChips : data.walletType == "rakeWallet" ? eval(parseFloat(fromDetails.rake_chips).toFixed(2)) : data.walletType == "extraRakeWallet" ? eval(parseFloat(fromDetails.extraRakeChips).toFixed(2)) : eval(parseFloat(fromDetails.chips).toFixed(2)),
                        'afterBalance': data.toRole == "system" ? eval(parseFloat(fromDetails.systemChips).toFixed(2) - parseFloat(data.chips).toFixed(2)) : data.walletType == "rakeWallet" ? eval(parseFloat(fromDetails.rake_chips).toFixed(2) - parseFloat(data.chips).toFixed(2)) : data.walletType == "extraRakeWallet" ? eval(parseFloat(fromDetails.extraRakeChips).toFixed(2) - parseFloat(data.chips).toFixed(2)) : eval(parseFloat(fromDetails.chips).toFixed(2) - parseFloat(data.chips).toFixed(2)),
                        'type': 'deduct',
                        'category': 'debit',
                        'status': 'success',
                        'rakeChips': data.walletType == "rakeWallet" ? "true" : "",
                        'adminChips': data.walletType == "extraRakeWallet" ? 'true' : ""
                    });


                } else if (data.fromRole == "senior" || data.fromRole == "master" || data.fromRole == "agent") {
                    if (data.toRole == "senior" || data.toRole == "master" || data.toRole == "agent") {
                        if (data.walletType == "rakeWallet") {
                            console.log(" rake wallet to main transfer")
                            fromDetails = await Sys.App.Services.agentServices.FindOneUpdateAgentData({ _id: data.to }, { $inc: { rake_chips: -data.chips } }, opts)
                            console.log(fromDetails);
                            console.log("Details :", fromDetails.rake_chips);
                            if (!fromDetails) {
                                console.log("This (" + data.fromRole + ") Agent Detail Not Found.");
                                await Sys.App.Services.errorReportServices.createErrorLog({
                                    receiverId: data.from,
                                    providerId: data.to,
                                    gameTotalChips: data.chips,
                                    remark: "This (" + data.from + ") Agent Detail Not Found."
                                });
                                throw { "status": "Error", "message": "This Agent Detail Not Found." };
                            } else if (fromDetails.rake_chips < 0 || fromDetails.rake_chips < data.chips) {
                                await Sys.App.Services.errorReportServices.createErrorLog({
                                    receiverId: data.from,
                                    providerId: data.to,
                                    gameTotalChips: data.chips,
                                    remark: "This (" + data.from + ") Agent Insufficient chips In Your Wallet."
                                });
                                console.log("This (" + data.fromRole + ") Agent Insufficient chips In Your Wallet.");
                                throw { "status": "Error", "message": "This Agent Insufficient chips In Your Wallet." };
                            }
                        } else {
                            console.log(" requested id is parent Id of session Detail Id, agent to agent transfer")
                            fromDetails = await Sys.App.Services.agentServices.FindOneUpdateAgentData({ _id: data.to }, { $inc: { chips: -data.chips } }, opts)
                            if (!fromDetails) {
                                console.log("This (" + data.fromRole + ") Agent Detail Not Found.");
                                await Sys.App.Services.errorReportServices.createErrorLog({
                                    receiverId: data.from,
                                    providerId: data.to,
                                    gameTotalChips: data.chips,
                                    remark: "This (" + data.from + ") Agent Detail Not Found."
                                });
                                throw { "status": "Error", "message": "This Agent Detail Not Found." };
                            } else if (fromDetails.chips < 0 || fromDetails.chips < data.chips) {
                                console.log("This (" + data.fromRole + ") Agent Insufficient chips In Your Wallet.");
                                await Sys.App.Services.errorReportServices.createErrorLog({
                                    receiverId: data.from,
                                    providerId: data.to,
                                    gameTotalChips: data.chips,
                                    remark: "This (" + data.from + ") Agent Insufficient chips In Your Wallet."
                                });
                                throw { "status": "Error", "message": "This Agent Insufficient chips In Your Wallet." };
                            }
                        }
                    } else if (data.toRole == "player") {
                        console.log(" requested id is parent Id of session Detail Id, player to agent transfer")
                        fromDetails = await Sys.App.Services.PlayerServices.FindOneUpdatePlayerData({ _id: data.to }, { $inc: { chips: -data.chips } }, opts)
                        if (!fromDetails) {
                            console.log("This (" + data.toRole + ") Agent Detail Not Found.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.from,
                                providerId: data.to,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Agent Detail Not Found."
                            });
                            throw { "status": "Error", "message": "This Agent Detail Not Found." };
                        } else if (fromDetails.chips < 0 || fromDetails.chips < data.chips) {
                            console.log("This (" + data.toRole + ") Agent Insufficient chips In Your Wallet.");
                            await Sys.App.Services.errorReportServices.createErrorLog({
                                receiverId: data.from,
                                providerId: data.to,
                                gameTotalChips: data.chips,
                                remark: "This (" + data.to + ") Agent Insufficient chips In Your Wallet."
                            });
                            throw { "status": "Error", "message": "This Agent Insufficient chips In Your Wallet." };
                        }
                    }
                    toDetails = await Sys.App.Services.agentServices.FindOneUpdateAgentData({ _id: data.from }, { $inc: { chips: data.chips } }, opts);
                    if (!toDetails) {
                        console.log("This (" + data.fromRole + ") Player Detail Not Found.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.from,
                            providerId: data.to,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.fromRole + ") Player Detail Not Found."
                        });
                        throw { "status": "Error", "message": "This Player Detail Not Found." };
                    } else if (toDetails.chips < 0) {
                        console.log("This (" + data.fromRole + ") Player does not have enough chips.");
                        await Sys.App.Services.errorReportServices.createErrorLog({
                            receiverId: data.from,
                            providerId: data.to,
                            gameTotalChips: data.chips,
                            remark: "This (" + data.fromRole + ") Player does not have enough chips."
                        });
                        throw { "status": "Error", "message": "This Player does not have enough chips." };
                    }
                    let traNumber = +new Date()
                    await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                        'receiverId': fromDetails.id,
                        'receiverRole': fromDetails.role,
                        'providerId': toDetails.id,
                        'providerRole': toDetails.role,
                        'providerEmail': toDetails.email,
                        'chips': parseFloat(parseFloat(data.chips).toFixed(2)),
                        'message': 'Transaction To ' + toDetails.email,
                        'remark': 'Transaction To ' + toDetails.email,
                        'transactionNumber': 'DE-' + traNumber,
                        'beforeBalance': data.walletType == "rakeWallet" ? eval(parseFloat(fromDetails.rake_chips).toFixed(2)) : eval(parseFloat(fromDetails.chips).toFixed(2)),
                        'afterBalance': data.walletType == "rakeWallet" ? eval(parseFloat(fromDetails.rake_chips).toFixed(2) - parseFloat(data.chips).toFixed(2)) : eval(parseFloat(fromDetails.chips).toFixed(2) - parseFloat(data.chips).toFixed(2)),
                        'type': 'deduct',
                        'category': 'debit',
                        'status': 'success',
                        'rakeChips': data.walletType == "rakeWallet" ? "true" : "",
                        'adminChips': data.walletType == "extraRakeWallet" ? 'true' : ""
                    });

                    await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                        'receiverId': toDetails.id,
                        'receiverRole': toDetails.role,
                        'providerId': fromDetails.id,
                        'providerRole': toDetails.role,
                        'providerEmail': data.toRole == "player" ? fromDetails.uniqId : fromDetails.email,
                        'chips': parseFloat(parseFloat(data.chips).toFixed(2)),
                        'message': data.toRole == "player" ? 'Received From ' + fromDetails.uniqId : 'Received From ' + fromDetails.email,
                        'remark': data.toRole == "player" ? 'Received From ' + fromDetails.uniqId : 'Received From ' + fromDetails.email,
                        'transactionNumber': 'DEP-' + traNumber,
                        'beforeBalance': eval(parseFloat(toDetails.chips).toFixed(2)),
                        'afterBalance': parseFloat(parseFloat(toDetails.chips) + parseFloat(data.chips)).toFixed(2),
                        'type': 'deposit',
                        'category': 'credit',
                        'status': 'success',
                    });
                    console.log(fromDetails.chips);

                }
            }
            await session.commitTransaction();
            await session.endSession();
            return { "status": "success", "message": "Successfully Transaction " + data.chips + "  from  " + fromDetails.email + " to " + toDetails.email };
        } catch (error) {
            await session.abortTransaction();
            await session.endSession();
            throw error; // Rethrow so calling function sees error
        }
    }
}