const _ = require('lodash');
const router = require('express').Router();
const vitreumRender = require('vitreum/steps/render');
const templateFn = require('../client/template.js');
const config = require('nconf');

const mw = require('./middleware.js');
const BrewData = require('./brew.data.js');

router.get('/admin', mw.adminLogin, (req, res, next) => {
	return vitreumRender('admin', templateFn, {
			url       : req.originalUrl,
			admin_key : config.get('admin:key')
		})
		.then((page) => {
			return res.send(page)
		})
		.catch(next);
});

//Removes all empty brews that are older than 3 days and that are shorter than a tweet
router.delete('/admin/invalid', mw.adminOnly, (req, res, next)=>{
	BrewData.removeInvalid(!!req.query.do_it)
		.then((removedCount) => {
			return res.join({
				count : removedCount
			});
		})
		.catch(next);
});

router.get('/admin/lookup/:search', mw.adminOnly, (req, res, next) => {
	//search for mathcing edit id
	//search for matching share id
	// search for partial match

	BrewData.get({ $or:[
			{editId : { "$regex": req.params.search, "$options": "i" }},
			{shareId : { "$regex": req.params.search, "$options": "i" }},
		]})
		.then((brews) => {
			return res.json(brews);
		})
		.catch(next);
});

module.exports = router;