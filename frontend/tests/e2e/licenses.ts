import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Licenses page ", function() {

	this.timeout(6000);

	before(() => {
		login();
	});

	after(() => {
		logout();
	});

	describe("should load the licenses page content ", () => {

		it(" when we click on the licenses page", () => {

			const licenses = element.all(by.repeater("(key, value) in vm.accountOptions")).filter(function(elem, index) {
				return elem.getText().then(function(text) {
					return text === 'Licenses';
				});
			});

			licenses.click();
			expect(element(by.tagName("account-licenses")).isPresent()).to.eventually.equal(true);
			expect(element(by.tagName("account-licenses")).isDisplayed()).to.eventually.equal(true);
		});

	});

	describe(" it should have no current licenses", () => {
		
		it(" with text for the user to notify them", () => {
			const licenceText = element(by.css(".cardInfo"));
			expect(licenceText.isDisplayed()).to.eventually.equal(true);
			expect(licenceText.getText()).to.eventually.contain("You do not currently have any licenses.");
		});	

	});
	

});