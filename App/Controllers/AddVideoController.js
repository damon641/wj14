var Sys = require('../../Boot/Sys');

module.exports = {

    addVideo: async function (req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
            };
            return res.render('ad-banner/banner-list', data);
        } catch (e) {
            console.log(e);
        }
    },

    getAddVideo: async function (req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;

            let query = {};
            if (search != '') {
                let capital = search;

                query = {
                    email: {
                        $regex: '.*' + search + '.*'
                    }
                };
            } else {
                query = {};
            }
            let videoCount = await Sys.App.Services.AddVideoServices.getVideoCount(query);
            let data = await Sys.App.Services.AddVideoServices.getVideoDatatable(query, length, start);
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': videoCount,
                'recordsFiltered': videoCount,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
        }
    },

    addNewVideo: async function (req, res) {
        try {
            let video = await Sys.Game.Common.Services.PlayerServices.getVideoOneByData({ status: 1 });

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                userActive: 'active'
            };
            return res.render('ad-banner/add', data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    addNewVideoPostData: async function (req, res) {
        try {
            if (req.files) {
                let video = req.files.video;
                var re = /(?:\.([^.]+))?$/;
                var ext = re.exec(video.name)[1];
                let activepath = './public/video/'
                let fileName = Date.now() + '.mp4';
                video.mv(activepath + fileName, async function (err) {
                    if (err) {
                        req.flash('error', 'Error Uploading Video');
                        return res.redirect('/addNewVideo');
                    }
                    if (req.body.status == 'primary') {
                        await Sys.App.Services.AddVideoServices.updateVideoStatusprimary();
                    }
                    if (req.body.status == 'secondary') {
                        await Sys.App.Services.AddVideoServices.updateVideoStatussecondary();
                    }

                    await Sys.App.Services.AddVideoServices.insertVideoData({
                        name: req.body.name,
                        chips: req.body.chips,
                        video_name: fileName,
                        status: req.body.status
                    })
                    req.flash('success', 'Video Added successfully');
                    res.redirect('/ad-banner');
                });
            } else {
                console.log("error");
                req.flash('error', 'Error Add New Video');
                res.redirect('/addNewAd');
            }

        } catch (e) {
            console.log("Error", e);
        }
    },


    editVideo: async function (req, res) {
        try {
            let video = await Sys.App.Services.AddVideoServices.getSingleVideoData({
                _id: req.params.id
            });
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                ad: video,
                userActive: 'active'
            };
            return res.render('ad-banner/add', data);
            // res.send(player);
        } catch (e) {
            console.log("Error", e);
        }
    },

    editVideoPostData: async function (req, res) {
        try {
            let video = await Sys.App.Services.AddVideoServices.getVideoData({
                _id: req.params.id
            });
            if (video && video.length > 0) {

                if (req.body.status == 'primary') {
                    await Sys.App.Services.AddVideoServices.updateVideoStatusprimary();
                }
                if (req.body.status == 'secondary') {
                    await Sys.App.Services.AddVideoServices.updateVideoStatussecondary();
                }

                await Sys.App.Services.AddVideoServices.updateVideoData({
                    _id: req.params.id
                    // image: req.files.image.name
                }, {
                    name: req.body.name,
                    chips: req.body.chips,
                    status: req.body.status
                });
                req.flash('success', 'Ad update successfully');
                res.redirect('/ad-banner');

            } else {
                req.flash('error', 'No User found');
                res.redirect('/');
                return;
            }
            // req.flash('success', 'Player Registered successfully');
            // res.redirect('/');
        } catch (e) {
            console.log("Error", e);
        }
    },

    getVideoDelete: async function (req, res) {
        try {
            let video = await Sys.App.Services.AddVideoServices.getSingleVideoData({
                _id: req.body.id
            });
            if (video || video.length > 0) {
                console.log(video);
                if (video.status != 'primary' && video.status != 'secondary') {
                    await Sys.App.Services.AddVideoServices.deleteVideo(req.body.id)
                    return res.send("success");

                } else {
                    res.send("isActive");
                }

            } else {
                return res.send("error");
            }
        } catch (e) {
            console.log("Error", e);
        }
    },
}