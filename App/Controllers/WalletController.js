var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');

module.exports = {
	wallet: async function(req,res){
		try {

			var data = {
				App : Sys.Config.App.details,
				error: req.flash("error"),
				success: req.flash("success"),
                wallet : 'active'
			};
			return res.render('wallet/wallet',data);
		} catch (e) {
			console.log("Error",e);
		}
	},

	getWallet : async function(req,res){
		try{
			let start = parseInt(req.query.start);
			let length = parseInt(req.query.length);
			let search = req.query.search.value;

			let query = {};
			if (search != '') {
				let capital = search;
                query = { email: { $regex: '.*' + search + '.*' } };
            } else {
            	query = { };
            }

            let stacksC = await Sys.App.Services.WalletService.getByData(query);
            let stacksCount = stacksC.length;
            let data = await Sys.App.Services.WalletService.getWalletDatatable(query, length, start);
            var obj = {
            	'draw': req.query.draw,
            	'recordsTotal': stacksCount,
            	'recordsFiltered': stacksCount,
            	'data': data
            };
            res.send(obj);

		}catch (e){
			console.log("Error",e);
		}
	},

	addWallet : async function(req,res){
		try {

			var data = {
				App : Sys.Config.App.details,
				error: req.flash("error"),
				success: req.flash("success"),
                wallet : 'active'
			};
			return res.render('wallet/addWallet',data);
		} catch (e) {
			console.log("Error",e);
		}
	}
}