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

const mongoose = require("mongoose");
const vat = require("./vat");
const responseCodes = require("../response_codes");
const systemLogger = require("../logger.js").systemLogger;

let billingAddressSchema = new mongoose.Schema({
	//vat setter was async. setter cannot be async at the momnent. 
	// could happen in the future versions of mongoose
	// https://github.com/Automattic/mongoose/issues/4227 
	vat: { type: String },
	line1: { type: String },
	line2: { type: String },
	line3: { type: String },
	firstName: { type: String },
	lastName: { type: String },
	company: { type: String },
	city: { type: String },
	postalCode: { type: String },
	countryCode: { type: String },
	state: { type: String },
	jobTitle: {type: String },
	phoneNo: {type: String }
});


billingAddressSchema.methods.changeBillingAddress = function (billingAddress) {
	
	Object.keys(billingAddress).forEach(key => {

		if(key === '_id') {
			return;
		} 

		this.set(key, billingAddress[key]);
		
	});

	if(billingAddress.vat){
		return this.changeVATNumber(billingAddress.vat);
	} else {
		return Promise.resolve();
	}
};

billingAddressSchema.methods.changeVATNumber = function(vatCode){

	this.vat = vatCode;

	let cleanedVATNumber = this.vat.replace(/ /g,'');
	if (cleanedVATNumber.toUpperCase().startsWith(this.countryCode)) {
		cleanedVATNumber = cleanedVATNumber.substr(2); 
	}

	return vat.checkVAT(this.countryCode, cleanedVATNumber)
		.then(result => {
			if (!result.valid) {
				return Promise.reject(responseCodes.INVALID_VAT);
			} else {
				return Promise.resolve();
			}
		})
		.catch(err => {
			systemLogger.logError(`VAT Error - ${err}`);
			return Promise.reject(responseCodes.VAT_CODE_ERROR);
		});
};

module.exports = billingAddressSchema;
