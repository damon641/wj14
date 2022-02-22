var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');
var moment = require('moment');

module.exports = {

    inAppPurchase: async function(req, res) {
        try {
            var permission = false;
            if (req.session.details.admin_type == 'admin') {
                permission = true;
            } else if (req.session.details.admin_type == 'senioradmin') {
                permission = true;
            }
            if (permission == false) {
                return res.render('403');
            }
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                inAppPurchaseActive: 'active'
            };
            return res.render('inAppPurchase/inAppPurchase', data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    addInAppPurchase: async function(req, res) {
        try {
            var permission = false;
            if (req.session.details.admin_type == 'admin') {
                permission = true;
            } else if (req.session.details.admin_type == 'senioradmin') {
                permission = true;
            }
            if (permission == false) {
                return res.render('403');
            }

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
            };
            return res.render('inAppPurchase/addInAppPurchase', data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    addInAppPurchasePostData: async function(req, res) {
        try {
            var permission = false;
            if (req.session.details.admin_type == 'admin') {
                permission = true;
            } else if (req.session.details.admin_type == 'senioradmin') {
                permission = true;
            }
            if (permission == false) {
                return res.render('403');
            }
            let fileName;
            if (req.files) {
                let image = req.files.image;
                var re = /(?:\.([^.]+))?$/;
                var ext = re.exec(image.name)[1];
                fileName = Date.now() + '.' + ext;

                image.mv('./public/inApp/' + fileName, function(err) {
                    if (err) {
                        req.flash('error', 'Error Uploading In-app Purchase Image');
                        console.log("error");
                        return res.redirect('/inAppPurchase');
                    }
                });
            }
            await Sys.App.Services.InAppPurchaseServices.insertData({
                in_app_purchase_id: req.body.in_app_purchase_id,
                title: req.body.title,
                description: req.body.description.trim(),
                price: req.body.price,
                chips: req.body.chips,
                purchase_type: req.body.purchase_type,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                image: 'inApp/' + fileName,
                status: req.body.status,
            })
            req.flash('success', 'In-app Purchase Added.');
            res.redirect("/inAppPurchase");

        } catch (e) {
            console.log("Error", e);

        }
    },

    getInAppPurchase: async function(req, res) {
        try {
            var permission = false;
            if (req.session.details.admin_type == 'admin') {
                permission = true;
            } else if (req.session.details.admin_type == 'senioradmin') {
                permission = true;
            }
            if (permission == false) {
                return res.render('403');
            }
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;

            let query = {};
            if (search != '') {
                query = {
                    title: {
                        $regex: '.*' + search + '.*'
                    }
                };
            } else {
                query = {};
            }

            let inPurchaseCodeCount = await Sys.App.Services.InAppPurchaseServices.getCount(query);
            //let stacksCount = stacksC.length;
            let data = await Sys.App.Services.InAppPurchaseServices.getByData(query, null, {
                skip: start,
                limit: length,
                sort: {
                    createdAt: -1
                }
            });
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': inPurchaseCodeCount,
                'recordsFiltered': inPurchaseCodeCount,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
        }
    },

    editInAppPurchase: async function(req, res) {
        try {
            var permission = false;
            if (req.session.details.admin_type == 'admin') {
                permission = true;
            } else if (req.session.details.admin_type == 'senioradmin') {
                permission = true;
            }
            if (permission == false) {
                return res.render('403');
            }
            let inAppPurchase = await Sys.App.Services.InAppPurchaseServices.getSingleData({
                _id: req.params.id
            });
            let start_date = moment(inAppPurchase.start_date).format('YYYY-MM-DD HH:mm');
            let end_date = moment(inAppPurchase.end_date).format('YYYY-MM-DD HH:mm');
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                agentActive: 'active',
                inAppPurchase: inAppPurchase,
                start_date: start_date,
                end_date,
                end_date
            };
            return res.render('inAppPurchase/addInAppPurchase', data);
        } catch (e) {
            console.log("Error", e);
            return new Error("Error", e);
        }
    },

    editInAppPurchasePostData: async function(req, res) {
        try {
            var permission = false;
            if (req.session.details.admin_type == 'admin') {
                permission = true;
            } else if (req.session.details.admin_type == 'senioradmin') {
                permission = true;
            }
            if (permission == false) {
                return res.render('403');
            }
            let inAppPurchase = await Sys.App.Services.InAppPurchaseServices.getSingleData({
                _id: req.params.id
            });
            let fileName;
            if (inAppPurchase) {
                if (req.files.image) {
                    let image = req.files.image;
                    var re = /(?:\.([^.]+))?$/;
                    var ext = re.exec(image.name)[1];
                    fileName = 'inApp/' + Date.now() + '.' + ext;

                    image.mv('./public/' + fileName, function(err) {
                        if (err) {
                            req.flash('error', 'Error Uploading In-app Purchase Image');
                            console.log("error");
                            return res.redirect('/inAppPurchase');
                        }
                    });
                } else {
                    fileName = inAppPurchase.image;
                }
                await Sys.App.Services.InAppPurchaseServices.updateData({
                    _id: req.params.id
                }, {
                    in_app_purchase_id: req.body.in_app_purchase_id,
                    title: req.body.title,
                    description: req.body.description.trim(),
                    price: req.body.price,
                    chips: req.body.chips,
                    purchase_type: req.body.purchase_type,
                    start_date: req.body.start_date,
                    end_date: req.body.end_date,
                    image: fileName,
                    status: req.body.status,
                })
                req.flash('success', 'In-app Purchase updated successfully');
                res.redirect('/inAppPurchase');

            } else {
                req.flash('error', 'In-app Purchase not updated successfully');
                res.redirect('/inAppPurchase/add');
                return;
            }
            // req.flash('success', 'Player Registered successfully');
            // res.redirect('/');
        } catch (e) {
            console.log("Error", e);
        }
    },

    deleteInAppPurchase: async function(req, res) {
        try {
            var permission = false;
            if (req.session.details.admin_type == 'admin') {
                permission = true;
            } else if (req.session.details.admin_type == 'senioradmin') {
                permission = true;
            }
            if (permission == false) {
                return res.render('403');
            }
            let inAppPurchase = await Sys.App.Services.InAppPurchaseServices.getSingleData({
                _id: req.body.id
            });
            if (inAppPurchase || inAppPurchase.length > 0) {
                await Sys.App.Services.InAppPurchaseServices.deleteData(req.body.id)
                return res.send("success");
            } else {
                return res.send("error");
            }
        } catch (e) {
            console.log("Error", e);
        }
    }

}