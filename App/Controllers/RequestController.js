var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');
var Coinpayments = require('coinpayments');
var options = {
    'key' : '0454522cf98c9594afdfde6f238d428b611d62f09f663a9c61dfb035ef73ff77', // public key
    'secret' :'442c4e08d021A159d82cBe01c934A95529F3a22Cd95cd2116F17F7aE43c4A91d' // private key
};

let client = new Coinpayments(options); 
module.exports = {
	requestList: async function(req,res){
		try {

			var data = {
				App : Sys.Config.App.details,
				error: req.flash("error"),
				success: req.flash("success"),
        		requestActive : 'active'
			};
			return res.render('requestMaster/index',data);
		} catch (e) {
			console.log("Error",e);
		}
	},

	getRequest: async function(req,res){
		try {
			// let query = { flag : 'active' }
			let query = { $and: [{flag : 'active' },{pay_type :'withdraw' }] }
            let data = await Sys.App.Services.DepositeHistory.getByData(query);
            for (var i = 0; i < data.length; i++) {
        		data[i] = JSON.stringify(data[i]);
        		data[i] = JSON.parse(data[i]);
            	let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id: data[i].userId});
            	if(player){
                    data[i].playerName = player.username;
                }else{
                    data[i].playerName = 'null';
                }
            }
            var obj = {
            	'data': data
            };
            res.send(obj);

		}catch (e){
			console.log("Error",e);
		}
	},

	cloneRequest: async function(req,res){
		try {
			console.log("log check");
          // let data = await Sys.App.Services.DepositeHistory.getOneData({_id: req.body.id});
          let data = await Sys.App.Services.DepositeHistory.getOneData({$and: [{_id : req.body.id },{flag :'active' }]});
          if (data) {

           	let  getWallets = await Sys.App.Services.WalletService.getWalletData({$and: [{playerId : data.userId },{currencyType :data.coin_type }]});
          	 if(data.pay_type == 'withdraw'){
		          	client.createWithdrawal({
		    			'currency' : data.coin_type, // BTC, LTC
		    			'amount' : data.depositAmount, // 0.05
		    			'address' : data.walletsAddress  //INSERT_WALLET_ADDRESS 

		    		},function(err,result){
	    			console.log("result >>>>>",result);
	    			if(result != undefined){

	    			if(result.status == 1){
	    				Sys.App.Services.DepositeHistory.updateData(
	    				{
	    				_id : data.id	
	    			   },{
	    			   	withdrawId : result.id
	    			   }
	    			 );
		          	// if(getWallets){
		           //       // let plusDeposit = getWallets.amount -= parseInt(data.depositAmount);
		           //       let plusDeposit = getWallets.amount - data.depositAmount;
		           //       console.log("plus depositvalue >>>>>>>>>>>",plusDeposit)
		           //      transactionUpdate = Sys.App.Services.WalletService.updateWalletData(
		           //        { 
		           //            _id :getWallets.id 
		           //        },
		           //        {
		           //            amount: plusDeposit
		           //        }
		           //     );
		           //        Sys.App.Services.DepositeHistory.updateData(
	            //             { 
	            //                 _id :data.id 
	            //             },
	            //             {
	            //                flag   : 'inactive'  
	            //             }
	            //          );
		          	//  }
		          	 return res.send("success");
		          	}else{
		          	 return res.send("error");
		          	}
		          }else{
		          	return res.send("error");
		          }
	    		});
	          }
            // return res.send("success");
          }else {
            return res.send("error");
          }
        } catch (e) {
          console.log("Error",e);
        }
	},

	reqestDelete: async function(req,res){
		console.log("get post data",req.body);
		try {
          let data = await Sys.App.Services.DepositeHistory.getOneData({$and: [{_id : req.body.id },{flag :'active' }]});
          if (data) {
            Sys.App.Services.DepositeHistory.updateData(
            {
            	_id : req.body.id
            },
            {
            	status : 'Cancelled',
            	flag : 'inactive',
            	updatedAt : Date.now()
            });
            return res.send("success");
          }else {
            return res.send("error");
          }
        } catch (e) {
          console.log("Error",e);
        }
	},

	/******* CoinPayment  API  start ***********************************/

	deposite: async function(req,res){
		try{
			console.log("deposit post data ",req.body);
			let currencyType = req.body.currencyType;
			let depositvalue = parseInt(req.body.amount);
			let playerId = req.body.playerId;
			client.createTransaction({
    			'currency1' : currencyType,
    			'currency2' : currencyType,
    			'amount' : depositvalue

    		},function(err,result){
    			console.log("createTransaction responce >>>>>",result)
    			 Sys.App.Services.DepositeHistory.create({
    	            userId            : playerId,
    	            qrcode_url        : result.qrcode_url,
    	            txn_id            : result.txn_id,
    	            address           : result.address ,
    	            status_url        : result.status_url ,
    	            amount            : result.amount,
    	            confirms_needed   : result.confirms_needed,
    	            coin_type         : currencyType,
    	            depositAmount     : depositvalue,
                    pay_type          : 'deposit'
    	          });

			  let data = {
				  	result : {
				  		qr : result.qrcode_url,
				  		address : result.address
				  	},
				  	status: 'success',
		            message: 'Deposit request send to Successfully!'
			  }
			  console.log("send responce data >>>>",data);
			  res.send(data);
    		});
		}catch (e){
			console.log("Error",e);
		}
	},

	withdraw: async function(req,res){
		try{	
			console.log("withdraw post data >>>>>>.",req.body);
    		let currencyType = req.body.currencyType;
    		let withdrawValue = parseInt(req.body.amount);
    		let walletsAddress = req.body.walletsAddress;
    		let playerId = req.body.playerId

        	player = await Sys.App.Services.WalletService.getWalletData({$and: [{playerId : playerId},{currencyType :currencyType }]});
            if(player.amount < withdrawValue){
              let resutl = {
                  message : 'You do not have enough balance in your account'
                }
                res.send(resutl);
                return false;
            }

            let data = {
            	status: 'success',
            	result : null,
	            message: 'Withdraw request completed!'
            	};
                Sys.App.Services.DepositeHistory.create({
                      userId            : playerId,
                      walletsAddress    : walletsAddress,
                      coin_type         : currencyType,
                      depositAmount     : withdrawValue,
                      pay_type          : 'withdraw'
                    });

            console.log("get data",data)
            res.send(data);

		}catch (e){
			console.log('Error',e);
		}
	},

 	/******* CoinPayment  API  End ***********************************/

 	getDeposit: async function(req,res){
 		try {

			var data = {
				App : Sys.Config.App.details,
				error: req.flash("error"),
				success: req.flash("success"),
        		deposit : 'active'
			};
			return res.render('requestMaster/deposit',data);
		} catch (e) {
			console.log("Error",e);
		}
 	},

 	getDepositList: async function(req,res){
 		try{
 			depositData = await Sys.App.Services.DepositeHistory.getByData({pay_type : 'deposit'});
 			for (var i = 0; i < depositData.length; i++) {
        		depositData[i] = JSON.stringify(depositData[i]);
        		depositData[i] = JSON.parse(depositData[i]);
            	let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id: depositData[i].userId});
            	if(player){
                depositData[i].playerName = player.username;
                }else{
                depositData[i].playerName = 'null';
                }
            }

            for (var j = 0; j < depositData.length; j++) {
            depositData[j] = JSON.stringify(depositData[j]);
            depositData[j] = JSON.parse(depositData[j]);
            let dt = new Date(depositData[j].createdAt);
            let date = dt.getDate();
            let month = parseInt(dt.getMonth()+1);
            let year = dt.getFullYear();
            let hours = dt.getHours();
            let minutes = dt.getMinutes();
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0'+ minutes : minutes;
            let createdAt = month + '/' + date + '/' + year + ' ' + hours + ':' + minutes + ' ' + ampm;
            depositData[j].createdAt = createdAt;

            let updt = new Date(depositData[j].updatedAt);
            let up_date = updt.getDate();
            let up_month = parseInt(updt.getMonth()+1);
            let up_year = updt.getFullYear();
            let up_hours = updt.getHours();
            let up_minutes = updt.getMinutes();
            let up_ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0'+ minutes : minutes;
            let updatedAt = up_month + '/' + up_date + '/' + up_year + ' ' + up_hours + ':' + up_minutes + ' ' + up_ampm;
            depositData[j].updatedAt = updatedAt;

          }
 			 var obj = {
                'data': depositData
              };
              res.send(obj);
 		}catch (e){
 			console.log("Error",e);
 		}
 	},

 	getWithdraw: async function(req,res){
 		try {

			var data = {
				App : Sys.Config.App.details,
				error: req.flash("error"),
				success: req.flash("success"),
        		withraw : 'active'
			};
			return res.render('requestMaster/withraw',data);
		} catch (e) {
			console.log("Error",e);
		}
 	},

 	getWithdrawList: async function(req,res){
 		try{
 			depositData = await Sys.App.Services.DepositeHistory.getByData({pay_type : 'withdraw'});
 			for (var i = 0; i < depositData.length; i++) {
        		depositData[i] = JSON.stringify(depositData[i]);
        		depositData[i] = JSON.parse(depositData[i]);
            	let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id: depositData[i].userId});
            	if(player){
                depositData[i].playerName = player.username;
                }else{
                depositData[i].playerName = 'null';
                }
            }

            for (var j = 0; j < depositData.length; j++) {
            depositData[j] = JSON.stringify(depositData[j]);
            depositData[j] = JSON.parse(depositData[j]);
            let dt = new Date(depositData[j].createdAt);
            let date = dt.getDate();
            let month = parseInt(dt.getMonth()+1);
            let year = dt.getFullYear();
            let hours = dt.getHours();
            let minutes = dt.getMinutes();
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0'+ minutes : minutes;
            let createdAt = month + '/' + date + '/' + year + ' ' + hours + ':' + minutes + ' ' + ampm;
            depositData[j].createdAt = createdAt;

            let updt = new Date(depositData[j].updatedAt);
            let up_date = updt.getDate();
            let up_month = parseInt(updt.getMonth()+1);
            let up_year = updt.getFullYear();
            let up_hours = updt.getHours();
            let up_minutes = updt.getMinutes();
            let up_ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0'+ minutes : minutes;
            let updatedAt = up_month + '/' + up_date + '/' + up_year + ' ' + up_hours + ':' + up_minutes + ' ' + up_ampm;
            depositData[j].updatedAt = updatedAt;

          }
 			 var obj = {
                'data': depositData
              };
              res.send(obj);
 		}catch (e){
 			console.log("Error",e);
 		}
 	},
}

async function getPlayerName(element){
	let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id: element.userId});
	return player.username;
}

