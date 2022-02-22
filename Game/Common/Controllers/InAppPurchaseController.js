var Sys = require('../../../Boot/Sys');
var bcrypt = require('bcryptjs');
const iap = require('in-app-purchase');
const moment = require('moment');


iap.config({

    //googlePublicKeyPath: './iap-sandbox.json',
    //googlePublicKeyStrLive: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq7w28YIuYhhbFu6+Me1TB2WKvHsi/RsvcaG49XHjqe2oYi/7J3ySFwGBIt6YvHPV4M55qyHERWQyd7e9Ll/gYLWyG1ZlZixdWOxiXc13ryw83PxBM/RIH0ZyO/V1HpcS6cV/mvPkVIjnFpIRY5Y6MoK99S2Axlu1yw2jpw+W44Mdw4KMEsACPifSICCa8/ZtqOJeBD9Cw/F4FRYVpLABlQHrovT0/0Na1YtHAIHTYLdJ9ZgL2mkv9XC7NFt3T08bK+G+Q+6UScX0hBy4sF1dK5f33CwvBb7K8F4SFdWelWkRTSu6E0vDjBNrdZNeo75PzuLvWAFK/l/89O+xDvDzEQIDAQAB',
    googlePublicKeyStrLive: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmF/RL1N+/6H+/RmhLU2KBYcySDNnGl88GccStFWhRl6/N04+91Pf8jSRGQXmKmzfYJLoqhB5OPUb4DaFlZSmJMNU3jaWInCaOIvDt8tTLLNFAtsKjoNAmeEmuvAV7vY+8XBfWuzRX6iMHDCZTcTr/KtnR+w1+Gy8CMLyN2coIiwxSmq/dxWeKCSEIcct/2NGRliR/j2OqhFFtKLk9+U18okqGudnznlnfCdYrNwq46uhs9S8weLx4GPsuaK9Fw1mdsqfMkgk9l1DHLqLUpHChfp1zZB/15k39POdKo+8NolFNpWRkzKLndr0o2yiTugxvoy6r7tvUik7CUOgIEVGywIDAQAB',

    applePassword: '2e052099f9984871bf349ce2109ad4c22e052099f9984871bf349ce2109ad4c2',

    //test: true, // For Apple and Googl Play to force Sandbox validation only
    verbose: true // Output debug logs to stdout stream 

});

module.exports = {

    availablePromocode: async function(socket, data) {
        try {
            let promocode = await Sys.Game.Common.Services.PromocodeServices.getByData({ status: 'Active', usage_limit: { $gt: 0 }, $and: [{ start_date: { $lte: new Date() } }, { end_date: { $gte: new Date() } }] });
            if (promocode.length > 0) {
                return {
                    status: 'success',
                    result: promocode,
                    message: "Promocode Found",
                    statusCode: 200,
                }
            }
            return {
                status: 'fail',
                result: null,
                message: 'No Promocode available at this moment.',
                statusCode: 400
            }
        } catch (e) {
            Sys.Log.info('Error in AvailablePromocode : ' + error);
        }
    },

    availableInAppPurchase: async function(socket, data) {
        try {
            //let inAppPurchase = await Sys.Game.Common.Services.InAppPurchaseServices.getByData({$and:[{start_date:{$lte:new Date()}},{end_date:{$gte:new Date()}}]});
            let inAppPurchase = await Sys.Game.Common.Services.InAppPurchaseServices.getByData({ status: 'active' });
            //console.log("inapp-------------------------->",inAppPurchase);
            if (inAppPurchase.length > 0) {
                let allInAppPurchase = [];
                for (let i = 0; i < inAppPurchase.length; i++) {
                    let date = new Date();
                    if ((inAppPurchase[i].start_date <= date && inAppPurchase[i].end_date >= date && inAppPurchase[i].purchase_type == 'special') || inAppPurchase[i].purchase_type == 'normal') {
                        allInAppPurchase.push(inAppPurchase[i]);
                    }
                }
                console.log(allInAppPurchase);
                return {
                    status: 'success',
                    result: allInAppPurchase,
                    message: "InAppPurchase Found",
                    statusCode: 200,
                }
            }
            return {
                status: 'fail',
                result: null,
                message: 'No InAppPurchase available at this moment.',
                statusCode: 400
            }
        } catch (e) {
            Sys.Log.info('Error in AvailableInAppPurchase : ' + error);
        }
    },

    checkPromocode: async function(socket, data) {
        try {
            let promocode = await Sys.Game.Common.Services.PromocodeServices.getSingleData({ code: data.promocode });
            if (promocode) {
                let date = new Date();
                let startDate = promocode.start_date;
                let endDate = promocode.end_date;
                //let gameUsageLimit =promocode.usage_limit;
                let usedCount = await Sys.Game.Common.Services.PromocodeHistoryServices.getCount({ player: data.playerId });
                //console.log("date======>",moment(date).format('DD/MM/YY, HH:mm a'),moment(startDate).format('DD/MM/YY, HH:mm a'),moment(endDate).format('DD/MM/YY, HH:mm a'));
                if (date >= startDate && date <= endDate && promocode.usage_limit > 0) {
                    if (data.price < promocode.min_transaction) {
                        return {
                            status: 'fail',
                            result: null,
                            message: 'Minimum Transaction value of ' + promocode.min_transaction + ' is Required! ',
                            statusCode: 401
                        }
                    } else if (usedCount > promocode.individual_usage_limit) {
                        return {
                            status: 'fail',
                            result: null,
                            message: 'You have already used this promocode! ',
                            statusCode: 401
                        }
                    }
                    return {
                        status: 'success',
                        result: null,
                        message: 'Promocode is Valid',
                        statusCode: 200
                    }

                } else {
                    return {
                        status: 'fail',
                        result: null,
                        message: 'Promocode is Expired!',
                        statusCode: 401
                    }
                }
            }
            return {
                status: 'fail',
                result: null,
                message: 'Invalid Promocode!',
                statusCode: 401
            }
        } catch (e) {
            Sys.Log.info('Error in checkPromocode : ' + error);
        }
    },


    /*verifyInApp: async function(socket, data){
    	try {
    		
    		    let receiptData = { availableToPurchase: 'True',
    		    receipt: '{"Store":"GooglePlay","TransactionID":"GPA.3346-4068-8992-09463","Payload":"{\\"json\\":\\"{\\\\\\"orderId\\\\\\":\\\\\\"GPA.3346-4068-8992-09463\\\\\\",\\\\\\"packageName\\\\\\":\\\\\\"com.erwin.fruitMountain\\\\\\",\\\\\\"productId\\\\\\":\\\\\\"100diamonds\\\\\\",\\\\\\"purchaseTime\\\\\\":1546076845945,\\\\\\"purchaseState\\\\\\":0,\\\\\\"developerPayload\\\\\\":\\\\\\"{\\\\\\\\\\\\\\"developerPayload\\\\\\\\\\\\\\":\\\\\\\\\\\\\\"\\\\\\\\\\\\\\",\\\\\\\\\\\\\\"is_free_trial\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\"has_introductory_price_trial\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\"is_updated\\\\\\\\\\\\\\":false}\\\\\\",\\\\\\"purchaseToken\\\\\\":\\\\\\"bbfnnjailgnocloaimhpkhgi.AO-J1Ox9bx5F9FDOZwblQKNUnwPQB8G5F0E7b1yLYTxei5-tBUK8PJa_MZlRUYRDkPBV3tPL4DpdKtsv8e6joXsLD11Ppsv6Wu1b9BOVp3l6U6dRGOsKiRoxiyMnj9c57EapMPWbsC27\\\\\\"}\\",\\"signature\\":\\"R0jv1RqkhYqUGYBtDOAhkQ5GGMKm6rWVNq4UzEvyUj+LmM9EM9T5eCxUdOL2gQ7VUODSB+UMBTkCmvp7eZl\\\\/n4gJkCGyU6lI3xOBJnx7Z19vFQh86+yR9aWc5q4rpmGjALAEaC+JxVgwbl1ZFmAt\\\\/F+LgrQ0yhtERGwWxp7jcfcgPFswkzgDGurzOMu7BwMv9JjzQsXz5GN+OYNoMH2aJtvePPsV\\\\/TBUwkk0dM1h9Ff3k7u\\\\/WmLV5fPiM7T\\\\/CSUyoe+HHVDstYr9cVjn7dIHyLqmNph2yVLR\\\\/veizxj0n6q3fVrakXXvUB65BBp8uuwDJOe3FVL9ZPB29KeWvkwHDg==\\",\\"skuDetails\\":\\"{\\\\\\"productId\\\\\\":\\\\\\"100diamonds\\\\\\",\\\\\\"type\\\\\\":\\\\\\"inapp\\\\\\",\\\\\\"price\\\\\\":\\\\\\"₹ 250.00\\\\\\",\\\\\\"price_amount_micros\\\\\\":250000000,\\\\\\"price_currency_code\\\\\\":\\\\\\"INR\\\\\\",\\\\\\"title\\\\\\":\\\\\\"100diamonds (Fruit Mountain)\\\\\\",\\\\\\"description\\\\\\":\\\\\\"Buy 100 Diamonds\\\\\\"}\\",\\"isPurchaseHistorySupported\\":true}"}',
    		    transactionID: 'GPA.3346-4068-8992-09463',
    		    isoCurrencyCode: 'INR',
    		    localizedDescription: 'Buy 100 Diamonds',
    		    localizedPrice: '250',
    		    localizedPriceString: '₹ 250.00',
    		    localizedTitle: '100diamonds (Fruit Mountain)' }*/
    /*
    			 	


    			    let receiptData = data;
    			    //console.log("receipt data", receiptData.receipt);
    			    //console.log("receipt player id", receiptData.playerId)
    				
    		 		await iap.setup();
    		 		let purchaseResponseData =await iap.validate(receiptData.receipt);
    				
    				if (await iap.isValidated(purchaseResponseData)) {
    				    
    				    let purchaseData = await iap.getPurchaseData(purchaseResponseData);
    				    
    				    // check already existed transaction
    				    let inAppPurchaseCount = await Sys.Game.Common.Services.PlayerCashTransactionServices.getCount({transactionNumber: receiptData.transactionID });
    				    console.log("count--",inAppPurchaseCount)
    				    if(inAppPurchaseCount >= 1){
    				    	return {
    				    	   status: 'fail',
    				    	   result: null,
    				    	   message: 'Invalid Purchase!This Transaction already Redeemed.',
    				    	   statusCode: 400
    				    	}
    				    }

    				    // add chips without promocode offer chips
    				    let player = await Sys.Game.Common.Services.PlayerServices.getById(data.playerId);
    				    let inAppPurchase = await Sys.Game.Common.Services.InAppPurchaseServices.getSingleData({in_app_purchase_id: purchaseData[0].productId });
    				    await  Sys.Game.Common.Services.PlayerServices.updatePlayerData({_id: data.playerId},{chips: (player.chips + inAppPurchase.chips ) })
    				    

    				    await Sys.Game.Common.Services.PlayerCashTransactionServices.insertData({
    				    	'playerId': data.playerId,
    				    	//'userName': data.username,
    				    	'chips' : inAppPurchase.chips,
    				    	'cash': inAppPurchase.price,
    				    	'message' : 'Payment through In-App Purchase',
    				    	'transactionNumber': receiptData.transactionID,
    				    	'beforeBalance' : player.chips,
    				    	'afterBalance' : parseFloat( player.chips + parseFloat(inAppPurchase.chips) ),
    				    	'status': 'Paid',
    				    });

    				    //update total bought chips in settings Model
    				    let settings = await Sys.Game.Common.Services.InAppPurchaseServices.getSingleSettingsData({});
    				    await  Sys.Game.Common.Services.InAppPurchaseServices.updateSettingsData({_id: settings._id},{chipsBought: (settings.chipsBought + inAppPurchase.chips  ) })

    				    // Now check for promocode and if promocode is valid then store data into promocdeHistory collection

    				    if(data.promocode){
    				    	let promocode = await Sys.Game.Common.Services.PromocodeServices.getSingleData({code: data.promocode});
    				    	
    				    	if(promocode){
    				    		let date = new Date();
    				    		let startDate = promocode.start_date;
    				    		let endDate = promocode.end_date;
    				    		//console.log("date======>",moment(date).format('DD/MM/YY, HH:mm a'),moment(startDate).format('DD/MM/YY, HH:mm a'),moment(endDate).format('DD/MM/YY, HH:mm a'));
    				    		if(date >= startDate && date <= endDate){
    				    			//console.log("purchased id before", purchaseData[0].productId)
    				    			//let inAppPurchase = await Sys.Game.Common.Services.InAppPurchaseServices.getSingleData({in_app_purchase_id: purchaseData[0].productId });
    				    			
    				    			if(inAppPurchase.price >= promocode.min_transaction){ 
    				    				let usedCount = await Sys.Game.Common.Services.PromocodeHistoryServices.getCount({player: data.playerId});
    				    				console.log("promocode usee====>", usedCount);
    				    				if(usedCount < promocode.individual_usage_limit){
    				    					
    				    					let offerdChips = eval( parseFloat( (inAppPurchase.chips / promocode.offer)*100  ).toFixed(2) );
    				    					if(offerdChips >= promocode.maximum_offer){
    				    						offerdChips = promocode.maximum_offer;
    				    					}
    				    					await Sys.Game.Common.Services.PromocodeHistoryServices.insertData({
    				    						'player': data.playerId,
    				    						'promocode': promocode.id,
    				    						'transactionNumber': receiptData.transactionID,
    				    						'offeredChips': offerdChips, 
    				    					});
    				    					await Sys.Game.Common.Services.PromocodeServices.updateData({_id: promocode._id},{ $inc: {usage_limit: -1}  });
    				    					
    				    					return {
    				    					  status: 'success',
    				    					  message: 'Promocode applied Successfully.You will get extra ' +offerdChips+ ' Chips After successfully fulfilling all the conditions.', 
    				    					}
    				    				}
    				    				return {
    				    				  status: 'fail',
    				    				  result: null,
    				    				  message: 'You have already used this promocode!, so will not get extra chips ,you have got specified chips in the package.',
    				    				  statusCode: 401
    				    				}
    				    			}
    				    			return {
    				    			  status: 'fail',
    				    			  result: null,
    				    			  message: 'Minimum Transaction of ' + promocode.min_transaction +  ' is required!,  so will not get extra chips ,you have got specified chips in the package.',
    				    			  statusCode: 401
    				    			}
    				    			
    				    		}else{
    				    			return {
    				    			  status: 'fail',
    				    			  result: null,
    				    			  message: 'Promocode is Expired!,  so will not get extra chips ,you have got specified chips in the package.',
    				    			  statusCode: 401
    				    			}
    				    		}
    				    	}
    				    	return {
    				    	  status: 'fail',
    				    	  result: null,
    				    	  message: 'Invalid Promocode!, so will not get extra chips ,you have got specified chips in the package.',
    				    	  statusCode: 401
    				    	}
    				    }

    				    return {
    				      status: 'success',
    				      result:{
    				      	totalChips: ( player.chips + inAppPurchase.chips)
    				      }, 
    				      message: 'Chips Successfully Added.', 
    				    }
    				   
    				}
    				return {
    				   status: 'fail',
    				   result: null,
    				   message: 'Invalid Purchase!',
    				   statusCode: 400
    				}
    		 
    			} catch (error) {
    		     console.log(error);
    		     Sys.Log.info('Error in VerifyInApp  : ' + error);
    		     return {
    		       status: 'fail',
    		       result: error,
    		       message: 'Invalid Purchase!',
    		       statusCode: 400
    		     }
    		}
    	},
    	
    	/*VerifyInApp: async function(socket, data){
    	   try {

    		    let receiptData = { availableToPurchase: 'True',
    		    receipt: '{"Store":"GooglePlay","TransactionID":"GPA.3346-4068-8992-09463","Payload":"{\\"json\\":\\"{\\\\\\"orderId\\\\\\":\\\\\\"GPA.3346-4068-8992-09463\\\\\\",\\\\\\"packageName\\\\\\":\\\\\\"com.erwin.fruitMountain\\\\\\",\\\\\\"productId\\\\\\":\\\\\\"100diamonds\\\\\\",\\\\\\"purchaseTime\\\\\\":1546076845945,\\\\\\"purchaseState\\\\\\":0,\\\\\\"developerPayload\\\\\\":\\\\\\"{\\\\\\\\\\\\\\"developerPayload\\\\\\\\\\\\\\":\\\\\\\\\\\\\\"\\\\\\\\\\\\\\",\\\\\\\\\\\\\\"is_free_trial\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\"has_introductory_price_trial\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\"is_updated\\\\\\\\\\\\\\":false}\\\\\\",\\\\\\"purchaseToken\\\\\\":\\\\\\"bbfnnjailgnocloaimhpkhgi.AO-J1Ox9bx5F9FDOZwblQKNUnwPQB8G5F0E7b1yLYTxei5-tBUK8PJa_MZlRUYRDkPBV3tPL4DpdKtsv8e6joXsLD11Ppsv6Wu1b9BOVp3l6U6dRGOsKiRoxiyMnj9c57EapMPWbsC27\\\\\\"}\\",\\"signature\\":\\"R0jv1RqkhYqUGYBtDOAhkQ5GGMKm6rWVNq4UzEvyUj+LmM9EM9T5eCxUdOL2gQ7VUODSB+UMBTkCmvp7eZl\\\\/n4gJkCGyU6lI3xOBJnx7Z19vFQh86+yR9aWc5q4rpmGjALAEaC+JxVgwbl1ZFmAt\\\\/F+LgrQ0yhtERGwWxp7jcfcgPFswkzgDGurzOMu7BwMv9JjzQsXz5GN+OYNoMH2aJtvePPsV\\\\/TBUwkk0dM1h9Ff3k7u\\\\/WmLV5fPiM7T\\\\/CSUyoe+HHVDstYr9cVjn7dIHyLqmNph2yVLR\\\\/veizxj0n6q3fVrakXXvUB65BBp8uuwDJOe3FVL9ZPB29KeWvkwHDg==\\",\\"skuDetails\\":\\"{\\\\\\"productId\\\\\\":\\\\\\"100diamonds\\\\\\",\\\\\\"type\\\\\\":\\\\\\"inapp\\\\\\",\\\\\\"price\\\\\\":\\\\\\"₹ 250.00\\\\\\",\\\\\\"price_amount_micros\\\\\\":250000000,\\\\\\"price_currency_code\\\\\\":\\\\\\"INR\\\\\\",\\\\\\"title\\\\\\":\\\\\\"100diamonds (Fruit Mountain)\\\\\\",\\\\\\"description\\\\\\":\\\\\\"Buy 100 Diamonds\\\\\\"}\\",\\"isPurchaseHistorySupported\\":true}"}',
    		    transactionID: 'GPA.3346-4068-8992-09463',
    		    isoCurrencyCode: 'INR',
    		    localizedDescription: 'Buy 100 Diamonds',
    		    localizedPrice: '250',
    		    localizedPriceString: '₹ 250.00',
    		    localizedTitle: '100diamonds (Fruit Mountain)' }

    			console.log("purchaseToken", JSON.parse( JSON.parse ( JSON.parse(receiptData.receipt).Payload ).json ).purchaseToken );
    	 		console.log("signature" , JSON.parse( JSON.parse(receiptData.receipt).Payload ).signature );
    			let receipt = {
    			     packageName: 'com.erwin.fruitMountain',
    			     productId: '100diamonds',
    			     purchaseToken: 'bbfnnjailgnocloaimhpkhgi.AO-J1Ox9bx5F9FDOZwblQKNUnwPQB8G5F0E7b1yLYTxei5-tBUK8PJa_MZlRUYRDkPBV3tPL4DpdKtsv8e6joXsLD11Ppsv6Wu1b9BOVp3l6U6dRGOsKiRoxiyMnj9c57EapMPWbsC27',
    			     subscription: false
    			}
    	     
    			let rrData ={
    			     packageName: 'com.erwin.fruitMountain',
    			     productId: '100diamonds',
    			     purchaseToken: 'bbfnnjailgnocloaimhpkhgi.AO-J1Ox9bx5F9FDOZwblQKNUnwPQB8G5F0E7b1yLYTxei5-tBUK8PJa_MZlRUYRDkPBV3tPL4DpdKtsv8e6joXsLD11Ppsv6Wu1b9BOVp3l6U6dRGOsKiRoxiyMnj9c57EapMPWbsC27',
    			     subscription: false,

    			}

    			var receiptFinal = {
    			     data: rrData,
    			     signature: "R0jv1RqkhYqUGYBtDOAhkQ5GGMKm6rWVNq4UzEvyUj+LmM9EM9T5eCxUdOL2gQ7VUODSB+UMBTkCmvp7eZl/n4gJkCGyU6lI3xOBJnx7Z19vFQh86+yR9aWc5q4rpmGjALAEaC+JxVgwbl1ZFmAt/F+LgrQ0yhtERGwWxp7jcfcgPFswkzgDGurzOMu7BwMv9JjzQsXz5GN+OYNoMH2aJtvePPsV/TBUwkk0dM1h9Ff3k7u/WmLV5fPiM7T/CSUyoe+HHVDstYr9cVjn7dIHyLqmNph2yVLR/veizxj0n6q3fVrakXXvUB65BBp8uuwDJOe3FVL9ZPB29KeWvkwHDg=="
    			}


    	 		await iap.setup();
    	 		let purchaseResponseData =await iap.validate(receiptData.receipt);
    			if (await iap.isValidated(purchaseResponseData)) {
    			     //console.log("success",purchaseResponseData);
    			    let purchaseData = iap.getPurchaseData(purchaseResponseData);
    			    //console.log("purchased data===>",purchaseData);
    			    if(data.promocode){
    			    	let promocode = await Sys.Game.Common.Services.PromocodeServices.getSingleData({code: data.promocode});
    			    	
    			    	if(promocode){
    			    		let date = new Date();
    			    		let startDate = promocode.start_date;
    			    		let endDate = promocode.end_date;
    			    		//console.log("date======>",moment(date).format('DD/MM/YY, HH:mm a'),moment(startDate).format('DD/MM/YY, HH:mm a'),moment(endDate).format('DD/MM/YY, HH:mm a'));
    			    		if(date >= startDate && date <= endDate){
    			    			//console.log("purchased id before", purchaseData[0].productId)
    			    			let inAppPurchase = await Sys.Game.Common.Services.InAppPurchaseServices.getSingleData({in_app_purchase_id: purchaseData[0].productId });
    			    			//console.log("in App purchase Data=====>", inAppPurchase);
    			    			if(inAppPurchase.price >= promocode.min_transaction){ //1099 from in app purchase package
    			    				let usedCount = await Sys.Game.Common.Services.PromocodeHistoryServices.getCount({player: data.playerId});
    			    				console.log("promocode usee====>", usedCount);
    			    				if(usedCount < promocode.individual_usage_limit){
    			    					
    			    					let offerdChips = parseInt( (inAppPurchase.chips / promocode.offer)*100  );
    			    					if(offerdChips >= promocode.maximum_offer){
    			    						offerdChips = promocode.maximum_offer;
    			    					}
    			    					await Sys.Game.Common.Services.PromocodeHistoryServices.insertData({
    			    						'player': data.playerId,
    			    						'promocode': promocode.id, 
    			    					});
    			    					await Sys.Game.Common.Services.PromocodeServices.updateData({_id: promocode._id},{ $inc: {usage_limit: -1}  });
    			    					return {
    			    					  status: 'success',
    			    					  result: {
    			    					    cash : '0',
    			    					  },
    			    					  message: 'Promocode applied Successfully.You have got extra ' +offerdChips+ ' Chips', 
    			    					}
    			    				}
    			    				return {
    			    				  status: 'fail',
    			    				  result: null,
    			    				  message: 'You have already used this promocode!',
    			    				  statusCode: 401
    			    				}
    			    			}
    			    			return {
    			    			  status: 'fail',
    			    			  result: null,
    			    			  message: 'Minimum Transaction of ' + promocode.min_transaction +  ' is required!',
    			    			  statusCode: 401
    			    			}
    			    			
    			    		}else{
    			    			return {
    			    			  status: 'fail',
    			    			  result: null,
    			    			  message: 'Promocode is Expired!',
    			    			  statusCode: 401
    			    			}
    			    		}
    			    	}
    			    	return {
    			    	  status: 'fail',
    			    	  result: null,
    			    	  message: 'Invalid Promocode!',
    			    	  statusCode: 401
    			    	}
    			    }
    			   
    			}
    			return {
    			   status: 'fail',
    			   result: null,
    			   message: 'Invalid Purchase!',
    			   statusCode: 400
    			}
    	 
    		} catch (error) {
    	     console.log(error);
    	     Sys.Log.info('Error in VerifyInApp  : ' + error);
    	     return {
    	       status: 'fail',
    	       result: error,
    	       message: 'Invalid Purchase!',
    	       statusCode: 400
    	     }
    	   }
    	},*/

    sendMulNotifications: async function(data) {
        /*try{
        	let Tokens = ['dWsygqK_zrA:APA91bGDk43Nzc8YCy7yWwnuZOqzsqyjyWUjG6teHAwC1XD79R_6WGG0CH1qhAdy5oHXQhtnmDY3K59b3RK61w-13sGXD2mOmRrwXXAgNpndZ4rzgNf2HUpP9LDdMMLzX0uwZO56qmcn'];
        		 
        	let message = {
        	  notification: {
        	    title: 'White Poker',
        	    body: 'Welcome to White Poker.Play & Win..',

        	  },
        	  android: {
        	    ttl: 3600 * 1000,
        	    notification: {
        	      icon: 'stock_ticker_update',
        	      color: '#f45342',
        	    },
        	  },
        	  apns: {
        	    payload: {
        	      aps: {
        	        badge: 42,
        	      },
        	    },
        	  },
        	  
        	};

        	FCM.sendToMultipleToken(message, Tokens, function(err, response) {
        	    if(err){
        	        console.log('err--', err);
        	    }else {
        	        console.log('response-----', response);
        	    }
        	 
        	})
        	
        }catch(e){
        	Sys.Log.info('Error in Notification  : ' + e);
        }*/
    }

}