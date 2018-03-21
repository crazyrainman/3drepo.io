/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const express = require("express");
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");
const C = require("../constants");
const responseCodes = require("../response_codes.js");
const Group = require("../models/group");
const utils = require("../utils");
const systemLogger = require("../logger.js").systemLogger;

router.get("/", middlewares.issue.canView, listGroups);
router.get("/:uid", middlewares.issue.canView, findGroup);
router.put("/:uid", middlewares.issue.canCreate, updateGroup);
router.post("/", middlewares.issue.canCreate, createGroup);
router.delete("/:id", middlewares.issue.canCreate, deleteGroup);

let getDbColOptions = function(req){
	return {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};
};

function listGroups(req, res, next){

	let place = utils.APIInfo(req);
	let query = {};

	// If we want groups that aren't from issues
	if (req.query.noIssues) {
		query = { issue_id: { $exists: false } };
	}

	Group.listGroups(getDbColOptions(req), query).then(groups => {

		groups.forEach((group, i) => {
			groups[i] = group.clean();
		});

		responseCodes.respond(place, req, res, next, responseCodes.OK, groups);

	}).catch(err => {

		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);

	});
}

function findGroup(req, res, next){

	let place = utils.APIInfo(req);

	Group.findByUIDSerialised(getDbColOptions(req), req.params.uid).then( group => {
		if(!group){
			return Promise.reject({resCode: responseCodes.GROUP_NOT_FOUND});
		} else {
			return Promise.resolve(group);
		}
	}).then(group => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, group);
	}).catch(err => {
		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function createGroup(req, res, next){

	let place = utils.APIInfo(req);

	let create = Group.createGroup(getDbColOptions(req), req.body);

	create.then(group => {

		responseCodes.respond(place, req, res, next, responseCodes.OK, group.clean());

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function deleteGroup(req, res, next){

	let place = utils.APIInfo(req);

	Group.deleteGroup(getDbColOptions(req), req.params.id).then(() => {

		responseCodes.respond(place, req, res, next, responseCodes.OK, { "status": "success"});
		//next();	

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		//next();	
	});
}

function updateGroup(req, res, next){

	let place = utils.APIInfo(req);

	Group.findByUID(getDbColOptions(req), req.params.uid).then( group => {

		if(!group){
			return Promise.reject({resCode: responseCodes.GROUP_NOT_FOUND});
		} else {
			return group.updateAttrs(req.body);
		}

	}).then(group => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, group.clean());
	}).catch(err => {
		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;
