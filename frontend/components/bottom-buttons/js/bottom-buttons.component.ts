/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

declare var Viewer;

class BottomButtonsController implements ng.IController {

	public static $inject: string[] = [
		"ViewerService",
		"TreeService",
	];

	private showButtons: boolean;
	private showViewingOptionButtons: boolean;
	private viewingOptions: any;
	private selectedViewingOptionIndex: number;
	private leftButtons: any[];
	private selectedMode: string;
	private customIcons;
	private isFocusMode: boolean;
	private escapeFocusModeButton: HTMLElement;

	constructor(
		private ViewerService: any,
		private TreeService: any,
	) {}

	public $onInit() {

		this.showButtons = true;
		this.showViewingOptionButtons = false;

		this.viewingOptions = {
			Helicopter : {
				mode: Viewer.NAV_MODES.HELICOPTER,
			},
			Turntable : {
				mode: Viewer.NAV_MODES.TURNTABLE,
			},
		};

		document.addEventListener("click", (event: any) => {
			// If the click is on the scene somewhere, hide the buttons
			const valid = event && event.target && event.target.classList;
			if (valid && event.target.classList.contains("emscripten")) {
				this.showViewingOptionButtons = false;
			}
		}, false);

		this.selectedViewingOptionIndex = 1;

		this.leftButtons = [];
		this.leftButtons.push({
			label: "Extent",
			icon: "fa fa-home",
			month: (new Date()).getMonth(),
			click: () => { this.extent(); },
		});

		this.leftButtons.push({
			isViewingOptionButton: true,
			click: () => { this.setViewingOption(undefined); },
		});

		this.leftButtons.push({
			label: "Show All",
			icon: "fa fa-eye",
			click: () => { this.showAll(); },
		});

		this.leftButtons.push({
			label: "Isolate",
			icon: "fa fa-scissors",
			click: () => { this.isolate(); },
		});

		this.leftButtons.push({
			label: "Focus",
			icon: "fa fa-toggle-off",
			click: () => { this.focusMode(); },
		});

		this.selectedMode = "Turntable";
		this.setViewingOption(this.selectedMode);

		this.customIcons = this.getIcons();
		this.isFocusMode = false;

		this.escapeFocusModeButton = document.createElement("md-button");
		this.escapeFocusModeButton.className = "focus-button";
		const icon = document.createElement("md-icon");
		icon.innerHTML = "clear";
		icon.className = "angular-material-icons material-icons close-icon";

		this.escapeFocusModeButton.appendChild(icon);
		document.getElementsByTagName("home")[0].appendChild(this.escapeFocusModeButton);
	}

	public getIcons() {
		return {
			extent: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",
			extentXmas: "m 19.224054,19.95947 c -0.114879,-0.01126 -0.316814,-0.04457 -0.448745,-0.07404 -0.465092,-0.103856 -0.487968,-0.136915 -0.470463,-0.679883 0.01119,-0.347163 0.04747,-0.687795 0.122715,-1.152102 0.05176,-0.319406 0.08064,-0.639643 0.06533,-0.724516 -0.01516,-0.08406 -0.01669,-0.08485 -0.164244,-0.08463 -0.146707,2.35e-4 -0.613293,0.05154 -0.945258,0.103963 -0.255084,0.04028 -0.710316,0.104405 -1.018239,0.143427 -0.150778,0.01911 -0.362259,0.04865 -0.469957,0.06566 -0.107699,0.017 -0.234,0.03625 -0.280669,0.04276 l -0.08485,0.01185 v 0.899567 0.899568 H 13.258213 10.986755 V 16.682742 13.954381 H 9.1591446 7.3315347 v 2.728361 2.728361 H 5.0470222 2.7625098 v -3.655221 -3.65522 H 1.4176064 0.07270307 L 1.4502423,10.869654 C 2.2078889,10.1926 2.9217729,9.5506784 3.0366513,9.4431619 3.1515296,9.3356452 3.2983911,9.1980935 3.3630102,9.1374913 3.4276293,9.076889 4.0385732,8.5301838 4.7206633,7.9225906 5.4027535,7.3149975 6.0371952,6.7472757 6.1305338,6.6609867 6.2238725,6.5746976 6.3824829,6.4290141 6.4830015,6.3372456 6.58352,6.245477 6.7068837,6.1316694 6.757143,6.0843397 6.8074022,6.03701 7.370373,5.5320913 8.0081892,4.9622982 L 9.1678548,3.9263108 9.2875162,4.0384346 c 0.1956266,0.1833043 0.421232,0.3934438 0.6157268,0.5735174 0.100519,0.093065 0.799579,0.7197767 1.553468,1.3926919 0.75389,0.6729153 1.517569,1.3602191 1.697067,1.5273423 0.179497,0.1671232 0.937156,0.8492943 1.683687,1.515936 0.74653,0.6666417 1.463214,1.3098828 1.592631,1.4294248 0.129417,0.119543 0.302452,0.279304 0.384522,0.355027 l 0.149219,0.137676 0.315398,0.01783 c 0.622847,0.0352 1.955145,-0.03746 2.323395,-0.126707 0.402929,-0.09765 0.784828,-0.199447 0.888764,-0.236893 0.06403,-0.02307 0.228036,-0.07528 0.364454,-0.116016 0.136418,-0.04074 0.317792,-0.09946 0.403052,-0.13048 l 0.155019,-0.05641 0.08551,0.09986 c 0.04703,0.05492 0.08595,0.107614 0.08649,0.117094 5.4e-4,0.0095 0.04663,0.07498 0.102415,0.145562 0.05579,0.07058 0.15786,0.225435 0.226824,0.344126 0.09872,0.169907 0.119528,0.225014 0.09783,0.259123 -0.04063,0.06388 -0.191373,0.04869 -0.465253,-0.04687 -0.241967,-0.08443 -0.397517,-0.112235 -0.420428,-0.07517 -0.01989,0.03219 0.08145,0.244776 0.208367,0.437089 0.06248,0.09466 0.26804,0.394249 0.456811,0.665744 0.188771,0.271496 0.340165,0.496368 0.336431,0.499717 -0.04762,0.0427 -1.632051,0.58495 -1.716311,0.587379 -0.02187,6.29e-4 -0.08635,0.01774 -0.143282,0.03801 -0.07841,0.02793 -0.131628,0.03057 -0.219378,0.01091 -0.159758,-0.0358 -0.321617,-0.006 -0.457986,0.08433 -0.118614,0.07857 -0.193226,0.09549 -0.681204,0.154484 -0.320934,0.0388 -1.449072,0.09588 -1.449049,0.07331 8e-6,-0.009 0.0195,-0.03251 0.04332,-0.05222 0.0716,-0.05925 0.138277,-0.236769 0.138887,-0.369759 6.66e-4,-0.145129 -0.06407,-0.288036 -0.185462,-0.40943 -0.107097,-0.107097 -0.166316,-0.128441 -0.372066,-0.134101 -0.129887,-0.0036 -0.187563,0.0076 -0.255228,0.04949 -0.334552,0.207054 -0.399775,0.549573 -0.163611,0.8592 l 0.06579,0.08626 h -0.523503 c -0.287927,0 -0.523503,-0.0064 -0.523503,-0.01411 0,-0.0078 0.02227,-0.04595 0.04949,-0.08485 0.02722,-0.03891 0.15771,-0.246976 0.289986,-0.462373 0.132276,-0.215397 0.28145,-0.45625 0.331499,-0.535229 0.25526,-0.402805 0.320824,-0.510798 0.320985,-0.528701 9.7e-5,-0.01077 -0.2583,-0.01958 -0.574216,-0.01958 h -0.574391 v 1.070458 1.070457 h 0.15268 c 0.08397,0 0.515748,0.01279 0.959496,0.02843 0.989514,0.03486 1.966046,1.83e-4 2.64894,-0.09405 0.08548,-0.0118 0.09914,-0.0039 0.172275,0.09988 0.225949,0.320557 0.746796,0.284693 0.924512,-0.06366 0.02938,-0.05759 0.06011,-0.161166 0.06828,-0.23017 l 0.01486,-0.125462 0.277423,-0.09299 c 0.152582,-0.05114 0.394911,-0.134068 0.538509,-0.18428 0.143598,-0.05021 0.3962,-0.137985 0.561337,-0.19505 0.165138,-0.05706 0.357032,-0.128358 0.426432,-0.158429 0.0694,-0.03007 0.129007,-0.05467 0.132462,-0.05467 0.0035,0 0.05967,0.0793 0.124917,0.176233 0.383482,0.569662 0.558138,0.875415 0.596849,1.044843 0.01569,0.06865 0.01014,0.09036 -0.02836,0.110962 -0.08423,0.04508 -0.355605,0.02755 -0.618435,-0.03994 -0.303534,-0.07794 -0.58924,-0.122674 -0.645536,-0.101072 -0.05717,0.02194 -0.05034,0.105274 0.01655,0.201757 0.06961,0.100418 0.283381,0.355625 0.42554,0.50803 0.15098,0.16186 0.154003,0.155473 -0.130163,0.275 -0.267543,0.112534 -0.277426,0.111979 -0.356894,-0.02003 -0.191978,-0.318912 -0.593934,-0.364205 -0.860577,-0.09697 -0.09843,0.09865 -0.126365,0.148045 -0.149783,0.264862 -0.01897,0.09465 -0.02046,0.179189 -0.0043,0.24801 0.01344,0.05743 0.0162,0.111642 0.0061,0.120479 -0.03867,0.03395 -0.872555,0.289113 -1.258463,0.385075 -0.489629,0.121755 -0.503143,0.12391 -1.086304,0.173169 -0.775634,0.06552 -0.978776,0.05222 -0.869648,-0.0569 0.01557,-0.01557 0.0347,-0.09876 0.04251,-0.184861 0.02021,-0.22293 -0.06967,-0.416929 -0.245387,-0.529648 -0.116925,-0.075 -0.139615,-0.08003 -0.325709,-0.07219 -0.178101,0.0075 -0.211015,0.01728 -0.30025,0.08915 -0.153574,0.12369 -0.216773,0.254317 -0.217282,0.449102 -2.61e-4,0.09865 0.01585,0.195957 0.04025,0.243139 l 0.04068,0.07866 -0.45189,-0.01595 c -0.24854,-0.0088 -0.490075,-0.02179 -0.536744,-0.02893 l -0.08485,-0.01298 v 0.258898 0.258898 l 0.150125,0.01562 c 0.359425,0.0374 1.4617,0.04811 2.003844,0.01946 1.140009,-0.06025 1.444971,-0.123385 2.838869,-0.587748 0.452804,-0.150847 0.539088,-0.171631 0.712503,-0.171631 0.224905,0 0.35567,-0.05105 0.510295,-0.19923 0.09064,-0.08686 0.323601,-0.188472 0.80027,-0.349065 l 0.188477,-0.0635 0.09872,0.116104 c 0.05429,0.06386 0.193016,0.222071 0.308268,0.351587 0.494985,0.556242 0.787217,0.981746 0.801889,1.167587 0.0062,0.07827 -0.0038,0.0915 -0.109693,0.144881 -0.181659,0.09161 -0.806944,0.08526 -1.959149,-0.01989 -0.392918,-0.03586 -1.329736,-0.06296 -1.442821,-0.04175 -0.05275,0.0099 -0.113915,0.03599 -0.135917,0.058 -0.07184,0.07184 -0.05758,0.166937 0.21093,1.40698 0.07574,0.349768 0.08923,0.76187 0.02958,0.903397 -0.0218,0.05171 -0.07373,0.118307 -0.115406,0.147984 -0.177949,0.126711 -0.758454,0.205683 -1.196403,0.162759 z m -2.762836,-5.309553 c 0.06204,-0.08415 0.112801,-0.168071 0.112801,-0.186495 0,-0.09604 -0.171896,-0.06337 -0.415918,0.07906 -0.07998,0.04668 -0.198289,0.115814 -0.262908,0.153629 -0.06462,0.03781 -0.173128,0.100813 -0.24113,0.139998 l -0.12364,0.07124 7.42e-4,0.365522 7.41e-4,0.365522 0.408256,-0.417739 c 0.22454,-0.229757 0.459015,-0.486588 0.521056,-0.570737 z m 3.874074,-2.302059 c 0.123321,-0.06377 0.252014,-0.23261 0.281266,-0.369006 0.07267,-0.338841 -0.140398,-0.633301 -0.492409,-0.680515 -0.206864,-0.02775 -0.468475,0.1354 -0.563021,0.351111 -0.04718,0.107644 -0.04716,0.297618 5.2e-5,0.410601 0.05827,0.139459 0.229586,0.293947 0.359368,0.324067 0.130735,0.03034 0.317536,0.01401 0.414746,-0.03626 z m -3.075919,-1.937682 c -0.218987,-0.0044 -0.398158,-0.01861 -0.398158,-0.03166 0,-0.02233 0.305897,-0.4951279 0.338511,-0.5232052 0.0083,-0.00718 0.03716,-0.048301 0.06404,-0.09138 0.06554,-0.1050278 0.713064,-0.9795841 0.83329,-1.1254569 0.478061,-0.5800453 0.723353,-0.8319122 0.838292,-0.86076 0.201194,-0.050497 0.778425,0.5002281 1.877355,1.7911456 0.214562,0.252047 0.30423,0.361582 0.30423,0.3716336 0,0.03393 -0.952111,0.2951859 -1.266272,0.3474609 -0.206765,0.0344 -0.838375,0.113749 -0.916482,0.11513 -0.01862,3.29e-4 -0.02784,-0.06636 -0.02611,-0.188778 0.0033,-0.2328225 -0.06657,-0.3743341 -0.242234,-0.4906918 -0.101738,-0.067388 -0.140119,-0.077173 -0.302736,-0.077173 -0.159611,0 -0.202818,0.01055 -0.302302,0.073811 -0.193533,0.1230671 -0.295419,0.4212098 -0.222479,0.6510248 0.01717,0.0541 0.01117,0.058 -0.08112,0.05263 -0.05482,-0.0032 -0.278838,-0.0094 -0.497825,-0.01373 z",
			turntable1: "M7.66 13.84h6.41a19 19 0 0 0 6.11-1.2 4.78 4.78 0 0 0 1.26-.71 1.46 1.46 0 0 0 .32-.39.39.39 0 0 0 0-.25 2 2 0 0 0-.78-.88 8.17 8.17 0 0 0-1.54-.79 23.59 23.59 0 0 0-7.22-1.33 28.77 28.77 0 0 0-6.42.46 10.15 10.15 0 0 0-4.14 1.57 2 2 0 0 0-.67.81.83.83 0 0 0-.06.31H.01a1.63 1.63 0 0 1 .09-.69 2.9 2.9 0 0 1 .91-1.27 11.12 11.12 0 0 1 4.52-2 30.1 30.1 0 0 1 6.79-.73 25.19 25.19 0 0 1 7.84 1.09 10 10 0 0 1 2 .9 3.77 3.77 0 0 1 1.7 2 2.43 2.43 0 0 1-.08 1.62A3.45 3.45 0 0 1 23 13.5a6.86 6.86 0 0 1-1.86 1.25 21.16 21.16 0 0 1-6.86 1.72c-1 .11-2 .15-2.77.17H9.45l-1.79.11v-2.91z",
			turntable2: "M8.27 19.84v-9.12l-4.56 4.56 4.56 4.56",
			turntable3: "M10.63 6.52h3.05v2.17h-3.05z",
			helicopter: "M11.07 8.61h-.78A3.56 3.56 0 0 1 7.2 7.26a16.9 16.9 0 0 1-1.06-1.34 1.71 1.71 0 0 0-1.16-.77c-1-.17-2-.38-3-.57l-.39-.07a.9.9 0 0 1-.61-1.28.31.31 0 0 0 0-.34C.69 2.36.38 1.76.07 1.15-.06.9 0 .8.28.8a7.91 7.91 0 0 1 1 0 .89.89 0 0 1 .5.23c.51.55 1 1.12 1.5 1.62a.4.4 0 0 0 .22.1h4.41a.49.49 0 0 0 .25-.14.43.43 0 0 0 .14-.16.84.84 0 0 1 1-.59 1.53 1.53 0 0 0 .27 0v-.4H4A.56.56 0 1 1 4 .35h5.41a.28.28 0 0 0 .2-.06c.3-.41.56-.39.77.06h5.61a.56.56 0 1 1 0 1.11h-5.63v.42a4.87 4.87 0 0 0 .5 0 .62.62 0 0 1 .59.29.43.43 0 0 1 .08.11.85.85 0 0 0 .86.54A7 7 0 0 1 17.1 5.5a1.7 1.7 0 0 1 .4 1.23 1.46 1.46 0 0 1-.68 1.05 4.22 4.22 0 0 1-1.92.73.91.91 0 0 0-.74.48c-.06.1-.13.18-.21.3H16a1.57 1.57 0 0 0 .65-.2.62.62 0 0 0 .24-.36.58.58 0 0 1 .61-.43.55.55 0 0 1 .49.55 1.23 1.23 0 0 1-.35.86 2.12 2.12 0 0 1-1.6.71H7.13a.57.57 0 0 1-.63-.45.55.55 0 0 1 .6-.66h3.2a.42.42 0 0 0 .42-.21c.09-.16.21-.3.35-.49zm5.43-2.2a1.26 1.26 0 0 0-.35-.78 5.65 5.65 0 0 0-2.91-1.81c-.36-.1-.75-.13-1.15-.2v1.79a.29.29 0 0 0 .12.18c.31.24.62.49.94.71a.66.66 0 0 0 .35.12h3zm-3 2.19h-1.44a.14.14 0 0 0-.1 0l-.46.7h1.47a.2.2 0 0 0 .13-.08zm-11.18-5a.38.38 0 0 0-.39-.37.38.38 0 0 0 0 .76.38.38 0 0 0 .43-.35z",
			showAll: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
			isolate1: "M12,6.5A9.76,9.76,0,0,1,20.82,12,9.82,9.82,0,0,1,3.18,12,9.76,9.76,0,0,1,12,6.5m0-2A11.83,11.83,0,0,0,1,12a11.82,11.82,0,0,0,22,0A11.83,11.83,0,0,0,12,4.5Z",
			isolate2: "M12,7a5,5,0,1,0,5,5A5,5,0,0,0,12,7Zm0,8a3,3,0,1,1,3-3A3,3,0,0,1,12,15Z",
			focus1: "M118.9,663.3H10v217.8C10,941.3,58.7,990,118.9,990h217.8V881.1H118.9V663.3z M118.9,118.9h217.8V10H118.9C58.7,10,10,58.7,10,118.9v217.8h108.9V118.9z M881.1,10H663.3v108.9h217.8v217.8H990V118.9C990,58.7,941.3,10,881.1,10z M881.1,881.1H663.3V990h217.8c60.2,0,108.9-48.7,108.9-108.9V663.3H881.1V881.1z M500,336.7c-90.1,0-163.3,73.2-163.3,163.3S409.9,663.3,500,663.3S663.3,590.1,663.3,500S590.1,336.7,500,336.7z",
		};
	}

	public extent() {
		this.ViewerService.goToExtent();
	}

	public setViewingOption(type) {

		if (type !== undefined) {
			// Set the viewing mode
			this.selectedMode = type;
			this.ViewerService.setNavMode(this.viewingOptions[type].mode);
			this.showViewingOptionButtons = false;
		} else {
			this.showViewingOptionButtons = !this.showViewingOptionButtons;
		}

	}

	public showAll() {
		this.TreeService.showAllTreeNodesAndIFCs();
	}

	public isolate() {
		this.TreeService.isolateSelected();
	}

	public focusMode() {
		console.log("FOCUS MODE!");
		this.isFocusMode = !this.isFocusMode;
		if (this.isFocusMode) {
			this.escapeFocusModeButton.style.display = "initial";
		} else {
			this.escapeFocusModeButton.style.display = "none";
		}

		document.getElementsByClassName("homeHolder")[0].style.visibility = (this.isFocusMode) ? "hidden" : "visible";

		if (this.isFocusMode) {
			this.escapeFocusModeButton.addEventListener("click", this.focusMode.bind(this));
		}

	}

}

export const BottomButtonsComponent: ng.IComponentOptions = {
	bindings: {},
	controller: BottomButtonsController,
	controllerAs: "vm",
	templateUrl: "templates/bottom-buttons.html",
};

export const BottomButtonsComponentModule = angular
	.module("3drepo")
	.component("bottomButtons", BottomButtonsComponent);
