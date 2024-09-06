sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"zmmatreq/utils/formatter",
	"sap/ui/core/BusyIndicator",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/routing/History"
], function (Controller, MessageToast, JSONModel, MessageBox, formatter, BusyIndicator, Filter, FilterOperator, History) {
	"use strict";

	return Controller.extend("zmmatreq.controller.RequestDetail", {
		formatter: formatter,
		onInit: function () {

			this.getOwnerComponent().getModel().setSizeLimit(9999);
			this.currentUser = parent.sap.ushell.Container.getUser().getId();
			if (this.currentUser == "DEFAULT_USER")
				this.currentUser = "POENARU"; //KARAKASEX005";

			var oRouter = this.getRouter();
			oRouter.getRoute("requestDetail").attachMatched(
				this._onRouteMatched,
				this);
		},

		_onRouteMatched: function (oEvent) {

			this.oViewModel = new JSONModel({
				requestNumber: "",
				worklistTableTitle: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("title"),
				enabledMatnr: false,
				enabledMaktx: true,
				enabledWerks: true,
				enabledLgort: true,
				enabledMtart: true,
				enabledReqty: false,
				enabledWerksExt: false,
				enabledLgortExt: false,
				enabledVkorgExt: false,
				enabledVtwegExt: false,
				enabledWerksChn: false,
				enabledLgortChn: false,
				enabledVkorgChn: false,
				enabledVtwegChn: false,
				enabledHeaderData: false,
				enabledUpload: true,
				visibleReqstat: false,
				visibleStatusTab: false,
				visibleFooterButton: {
					Create: false,
					Cancel: false,
					Change: false,
					Submit: false,
					Save: false,
					CancelSave: false,
				},
				visibleReqType: {
					Werks: true,
					Lgort: true,
					MstaeWerks: false,
					Mtart: true,
					WerksExt: false,
					LgortExt: false,
					VkorgExt: false,
					VtwegExt: false,
					WerksChn: false,
					LgortChn: false,
					VkorgChn: false,
					VtwegChn: false,
					RequestNote: true,
					Meins: true,
					Matkl: true,
					Hazgd: true,
					Idnlf: true,
					Mfrnr: true,
					Lifnr: true,
					AltUom: true,
					BasicText: true,
					StreamText: false,
					//CertificatesTab: true,
				},

				HeaderData: {},
				AltUomData: [],
				BasicTextData: [],
				StreamChangeData: [],
				SupplierData: [],
				MaterailGMPData: [],
				DocListData: [],
				StatusData: [],
				HazgdAprv: ""
			});

			this.oViewModel.setSizeLimit(9999);

			this.getView().setModel(this.oViewModel, "viewModel");

			var oArgs = oEvent.getParameter("arguments");
			this.reqnr = oArgs.Reqnr;
			this.type = oArgs.Type;
			this.docGuid = "";
			this.createdUser = "";

			this._bindReqtyp();
			this._bindReqstat();
			this._bindMaterialType();
			this._bindPlant();
			this._bindPlantSpecificMat();

			this._bindMaterialGroup();
			this._bindUom();
			this._bindSupplier();

			this._loadData(this.reqnr, this.type);

		},

		_loadData: function (reqnr, type) {

			var oModel = this.oViewModel.getData();

			switch (type) {
			case "DISPLAY":
				oModel.enabledMatnr = false;
				oModel.enabledMaktx = false;
				oModel.enabledWerks = false;
				oModel.enabledLgort = false;
				oModel.enabledMtart = false;
				oModel.enabledReqty = false;
				oModel.enabledWerksExt = false;
				oModel.enabledLgortExt = false;
				oModel.enabledVkorgExt = false;
				oModel.enabledVtwegExt = false;
				oModel.enabledWerksChn = false;
				oModel.enabledLgortChn = false;
				oModel.enabledVkorgChn = false;
				oModel.enabledVtwegChn = false;
				oModel.enabledHeaderData = false;
				oModel.enabledUpload = false;

				oModel.visibleReqstat = true;
				oModel.visibleStatusTab = true;

				oModel.HeaderData = {};
				oModel.AltUomData = [];
				oModel.BasicTextData = [];
				oModel.StreamChangeData = [];

				this.oViewModel.refresh();

				this._loadRequestData(reqnr, "DISPLAY");

				break;
			case "CREATE":
				oModel.enabledMatnr = false;
				oModel.enabledMaktx = true;
				oModel.enabledWerks = true;
				oModel.enabledLgort = true;
				oModel.enabledMtart = true;
				oModel.enabledReqty = true;
				oModel.enabledWerksExt = false;
				oModel.enabledLgortExt = false;
				oModel.enabledVkorgExt = false;
				oModel.enabledVtwegExt = false;
				oModel.enabledWerksChn = false;
				oModel.enabledLgortChn = false;
				oModel.enabledVkorgChn = false;
				oModel.enabledVtwegChn = false;
				oModel.enabledHeaderData = true;
				oModel.enabledUpload = true;

				oModel.visibleReqstat = false;
				oModel.visibleStatusTab = false;

				oModel.HeaderData = {};
				oModel.HeaderData.Reqnr = reqnr;
				oModel.HeaderData.Reqstat = "";
				oModel.AltUomData = [];
				oModel.BasicTextData = [];
				oModel.StreamChangeData = [];

				this.oViewModel.refresh();

				this._setVisiblltyFooterButton();
				this._generateDocGuid();
				break;
			case "CHANGE":

				this._setEnablityRegardingReqType(oModel.HeaderData.Reqtyp, "");

				oModel.enabledReqty = false;
				oModel.enabledHeaderData = true;
				oModel.enabledUpload = true;

				oModel.visibleReqstat = true;
				oModel.visibleStatusTab = true;

				oModel.visibleFooterButton.Create = false;
				oModel.visibleFooterButton.Cancel = false;
				oModel.visibleFooterButton.Change = false;
				oModel.visibleFooterButton.Submit = false;
				oModel.visibleFooterButton.Save = true;
				oModel.visibleFooterButton.CancelSave = true;

				for (var i = 0; oModel.AltUomData.length > i; i++) {
					if (oModel.AltUomData[i].Meins !== oModel.AltUomData[i].Meinh)
						oModel.AltUomData[i].Deletable = true;
				}
				oModel.AltUomData.enabledAddBtn = true;

				for (var i = 0; oModel.BasicTextData.length > i; i++) {
					oModel.BasicTextData[i].Deletable = true;
				}
				oModel.BasicTextData.enabledAddBtn = true;

				for (var i = 0; oModel.StreamChangeData.length > i; i++) {
					oModel.StreamChangeData[i].Deletable = true;
				}
				oModel.StreamChangeData.enabledAddBtn = true;

				for (var i = 0; oModel.DocListData.length > i; i++) {
					oModel.DocListData[i].Deletable = true;
				}

				this.oViewModel.refresh();

				this._bindPlantExt(oModel.HeaderData.Matnr);
				this._bindSalesOrgExt(oModel.HeaderData.Matnr);
				this._bindDistributionChannelExt(oModel.HeaderData.Matnr, oModel.HeaderData.VkorgExt, oModel.HeaderData.VtwegExt);

				this._bindSalesOrgChn(oModel.HeaderData.Matnr);
				this._bindPlantChn(oModel.HeaderData.Matnr);
				this._bindDistributionChannelChn(oModel.HeaderData.Matnr, oModel.HeaderData.VkorgChn, oModel.HeaderData.VtwegChn);

			default:
			}

		},

		_setVisiblltyFooterButton: function () {

			var oModel = this.oViewModel.getData();

			switch (oModel.HeaderData.Reqstat) {
			case "": // null
				oModel.visibleFooterButton.Create = true;
				oModel.visibleFooterButton.Cancel = false;
				oModel.visibleFooterButton.Change = false;
				oModel.visibleFooterButton.Submit = false;
				oModel.visibleFooterButton.Save = false;
				oModel.visibleFooterButton.CancelSave = false;
				break;
			case "01": // New
				oModel.visibleFooterButton.Create = false;
				oModel.visibleFooterButton.Cancel = true;
				oModel.visibleFooterButton.Change = true;
				oModel.visibleFooterButton.Submit = true;
				oModel.visibleFooterButton.Save = false;
				oModel.visibleFooterButton.CancelSave = false;
				break;
				// case "02": // In progress, 03 Approved, 04 Rejected

			default:
				oModel.visibleFooterButton.Create = false;
				oModel.visibleFooterButton.Cancel = false;
				oModel.visibleFooterButton.Change = false;
				oModel.visibleFooterButton.Submit = false;
				oModel.visibleFooterButton.Save = false;
				oModel.visibleFooterButton.CancelSave = false;
				break;

			}

			this.oViewModel.refresh();

		},

		_loadRequestData: function (reqnr, type) {
			var headerSet = {};
			headerSet.Reqnr = reqnr;
			headerSet.Prctyp = type;

			headerSet.RequestMdfAlt = [];
			headerSet.RequestMdfTxt = [];
			headerSet.RequestMdfChn = [];
			headerSet.RequestMdfStrg = [];

			this._sendRequestData(headerSet);

		},

		_setRequestData: function (type) {

			var inpReqnr = this.getView().byId("inpReqnr").getValue();
			var cbReqtyp = this.getView().byId("cbReqtyp").getSelectedKey();
			// var cbReqstat = this.getView().byId("cbReqstat").getSelectedKey();
			var txtAreaRequestNote = this.getView().byId("txtAreaRequestNote").getValue();
			var inpMatnr = this.getView().byId("inpMatnr").getValue();
			var txtAreaMaktx = this.getView().byId("txtAreaMaktx").getValue();
			var cbWerks = this.getView().byId("cbWerks").getSelectedKey();
			var mcbLgort = this.getView().byId("mcbLgort").getSelectedKeys();
			var cbMtart = this.getView().byId("cbMtart").getSelectedKey();
			var cbMatkl = this.getView().byId("cbMatkl").getSelectedKey();
			var inpIdnlf = this.getView().byId("inpIdnlf").getValue();
			var inpMfrnr = this.getView().byId("inpMfrnr").getValue();
			var inpLifnr = this.getView().byId("inpLifnr").getValue();
			var cbMeins = this.getView().byId("cbMeins").getSelectedKey();
			var cbWerksExt = this.getView().byId("cbWerksExt").getSelectedKey();
			var mcbLgortExt = this.getView().byId("mcbLgortExt").getSelectedKeys();
			var cbVkorgExt = this.getView().byId("cbVkorgExt").getSelectedKey();
			var cbVtwegExt = this.getView().byId("cbVtwegExt").getSelectedKey();
			var cbWerksChn = this.getView().byId("cbWerksChn").getSelectedKey();
			var cbVkorgChn = this.getView().byId("cbVkorgChn").getSelectedKey();
			var cbVtwegChn = this.getView().byId("cbVtwegChn").getSelectedKey();
			var mcbLgortChn = this.getView().byId("mcbLgortChn").getSelectedKeys();

			//var swcScdsp = this.getView().byId("swcScdsp").getState();
		//	var swcHazgd = this.getView().byId("swcHazgd").getState();
		//	var swcCranl = this.getView().byId("swcCranl").getState();
		//	var swcBsecr = this.getView().byId("swcBsecr").getState();
		//	var swcUspcl = this.getView().byId("swcUspcl").getState();
		//	var swcPrfst = this.getView().byId("swcPrfst").getState();
		//	var swcBoros = this.getView().byId("swcBoros").getState();
		//	var swcFdadc = this.getView().byId("swcFdadc").getState();
		//	var swcMan21 = this.getView().byId("swcMan21").getState();
		//	var swcMan22 = this.getView().byId("swcMan22").getState();
		//	var swcMan31 = this.getView().byId("swcMan31").getState();
		//	var swcMan32 = this.getView().byId("swcMan32").getState();
		//	var swcManh1 = this.getView().byId("swcManh1").getState();
		//	var swcPcnrq = this.getView().byId("swcPcnrq").getState();
		//	var swcSmpcr = this.getView().byId("swcSmpcr").getState();
		//	var txtAreaAddcr = this.getView().byId("txtAreaAddcr").getValue();
			var cbMstaeWerks = this.getView().byId("cbMstaeWerks").getSelectedKey();

			var headerSet = {};
			headerSet.Reqnr = inpReqnr;
			headerSet.Reqtyp = cbReqtyp;
			headerSet.Reqstat = "";
			headerSet.Mtart = cbMtart;
			headerSet.Matnr = inpMatnr;
			headerSet.Reqnote = txtAreaRequestNote;
			headerSet.Maktx = txtAreaMaktx;
			headerSet.Werks = cbWerks;
			headerSet.Matkl = cbMatkl;
			headerSet.Idnlf = inpIdnlf;
			headerSet.Mfrnr = inpMfrnr;
			headerSet.Lifnr = inpLifnr;
			headerSet.Meins = cbMeins;
			headerSet.WerksExt = cbWerksExt;
			headerSet.VkorgExt = cbVkorgExt;
			headerSet.VtwegExt = cbVtwegExt;
			headerSet.WerksChn = cbWerksChn;
			headerSet.VkorgChn = cbVkorgChn;
			headerSet.VtwegChn = cbVtwegChn;

			//headerSet.Scdsp = swcScdsp == true ? "X" : "";
			//headerSet.Hazgd = swcHazgd == true ? "X" : "";
			// headerSet.HazgdAprv
			// headerSet.Cranl = swcCranl == true ? "X" : "";
			// headerSet.Bsecr = swcBsecr == true ? "X" : "";
			// headerSet.Uspcl = swcUspcl == true ? "X" : "";
			// headerSet.Prfst = swcPrfst == true ? "X" : "";
			// headerSet.Boros = swcBoros == true ? "X" : "";
			// headerSet.Fdadc = swcFdadc == true ? "X" : "";
			// headerSet.Man21 = swcMan21 == true ? "X" : "";
			// headerSet.Man22 = swcMan22 == true ? "X" : "";
			// headerSet.Man31 = swcMan31 == true ? "X" : "";
			// headerSet.Man32 = swcMan32 == true ? "X" : "";
			// headerSet.Manh1 = swcManh1 == true ? "X" : "";
			// headerSet.Pcnrq = swcPcnrq == true ? "X" : "";
			// headerSet.Smpcr = swcSmpcr == true ? "X" : "";
			//headerSet.Addcr = txtAreaAddcr;
			headerSet.MstaeWerks = cbMstaeWerks;
			headerSet.Docguid = this.docGuid;
			headerSet.Crtuser = "";
			headerSet.Prctyp = type;

			headerSet.RequestMdfAlt = [];
			headerSet.RequestMdfTxt = [];
			headerSet.RequestMdfChn = [];
			headerSet.RequestMdfStrg = [];

			var oData = this.oViewModel.getData();

			switch (cbReqtyp) {
			case "01": //Material creation

				for (var i = 0; oData.AltUomData.length > i; i++) {
					headerSet.RequestMdfAlt.push({
						Reqnr: inpReqnr,
						Meins: oData.AltUomData[i].Meins,
						Meinh: oData.AltUomData[i].Meinh,
						Umrez: oData.AltUomData[i].Umrez,
						Umren: oData.AltUomData[i].Umren
					});
				}

				for (var i = 0; oData.BasicTextData.length > i; i++) {
					headerSet.RequestMdfTxt.push({
						Reqnr: inpReqnr,
						Spras: oData.BasicTextData[i].Spras,
						Laiso: "",
						Desc: oData.BasicTextData[i].BasicText,
					});
				}

				for (var i = 0; mcbLgort.length > i; i++) {
					headerSet.RequestMdfStrg.push({
						Reqnr: inpReqnr,
						Lgort: mcbLgort[i],
					});
				}

				break;
			case "02": //Material extension

				for (var i = 0; mcbLgortExt.length > i; i++) {
					headerSet.RequestMdfStrg.push({
						Reqnr: inpReqnr,
						Lgort: mcbLgortExt[i],
					});
				}

				break;
			case "03": //Material change

				for (var i = 0; oData.StreamChangeData.length > i; i++) {
					headerSet.RequestMdfChn.push({
						Reqnr: inpReqnr,
						Stream: oData.StreamChangeData[i].Stream,
						ChangeText: oData.StreamChangeData[i].ChangeText,
					});
				}

				for (var i = 0; mcbLgortChn.length > i; i++) {
					headerSet.RequestMdfStrg.push({
						Reqnr: inpReqnr,
						Lgort: mcbLgortChn[i],
					});
				}
				break;
			default:
			}

			this._sendRequestData(headerSet);

		},

		_sendRequestData: function (headerSet) {

			var that = this;
			sap.ui.core.BusyIndicator.show(0);

			this.getView().getModel().create("/RequestMdfHeaderSet", headerSet, {
				async: true,
				success: function (oData) {
					sap.ui.core.BusyIndicator.hide(0);

					if (oData.Mtype == "E" && oData.Message) {

						sap.m.MessageBox.confirm(oData.Message, {
							actions: [MessageBox.Action.OK],
							emphasizedAction: MessageBox.Action.OK,
							onClose: function (sAction) {
								return;
							}
						});
					} else {

						that.reqnr = oData.Reqnr;

						switch (oData.Prctyp) {
						case "CREATE":
							that._showMessage("successRequestCreated", oData.Reqnr);
							break;
						case "DISPLAY":
							that._setDisplayData(oData);
							that._bindUploadCollection(false);
							that._bindRequestStatus(oData.Reqnr);
							that._setVisiblltyFooterButton();
							that._setEnablityRegardingReqType(oData.Reqtyp, oData.Prctyp);
							that._setVisiblityRegardingReqType(oData.Reqtyp);
							break;
						case "SUBMIT":
							that._showMessage("successRequestSubmitted", oData.Reqnr);
							break;
						case "CHANGE":
							that._showMessage("successRequestChanged", oData.Reqnr);
							break;
						case "CANCEL":
							that._showMessage("successRequestCanceled", oData.Reqnr);
							break;
						default:
						}

					}

				},
				error: function (oData) {
					sap.ui.core.BusyIndicator.hide(0);
					var sMessage = that._getMessageFromOdataResponse(oData);
					sap.m.MessageBox.error(sMessage);
				}
			});
		},

		_showMessage: function (message, reqnr) {
			if (reqnr) {

				var msg = this.getView().getModel("i18n").getResourceBundle().getText(message, reqnr);

				var that = this;
				sap.m.MessageBox.confirm(msg, {
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function (sAction) {

						if (sAction === "OK")
							that._loadData(reqnr, "DISPLAY");
					}
				});
			}
		},

		_setDisplayData: function (oData) {

			var oModel = this.oViewModel.getData();

			this._bindPlantExt("");
			this._bindPlantChn("");

			this._bindSalesOrgExt("");
			this._bindSalesOrgChn("");

			oModel.HeaderData.Reqnr = oData.Reqnr;
			oModel.HeaderData.Reqtyp = oData.Reqtyp;
			oModel.HeaderData.Reqstat = oData.Reqstat;
			oModel.HeaderData.Mtart = oData.Mtart;
			oModel.HeaderData.Matnr = oData.Matnr;
			oModel.HeaderData.Reqnote = oData.Reqnote;
			oModel.HeaderData.Maktx = oData.Maktx;
			oModel.HeaderData.Werks = oData.Werks;

			oModel.HeaderData.Matkl = oData.Matkl;
			oModel.HeaderData.Idnlf = oData.Idnlf;
			oModel.HeaderData.Mfrnr = oData.Mfrnr;
			oModel.HeaderData.Lifnr = oData.Lifnr;
			oModel.HeaderData.Meins = oData.Meins;

			oModel.HeaderData.WerksExt = oData.WerksExt;
			oModel.HeaderData.VkorgExt = oData.VkorgExt;
			this._bindDistributionChannelExt("", oData.VkorgExt, oData.VtwegExt);
			oModel.HeaderData.VtwegExt = oData.VtwegExt;

			oModel.HeaderData.WerksChn = oData.WerksChn;
			oModel.HeaderData.VkorgChn = oData.VkorgChn;
			this._bindDistributionChannelChn("", oData.VkorgChn, oData.VtwegChn);
			oModel.HeaderData.VtwegChn = oData.VtwegChn;

			// oModel.HeaderData.Scdsp = oData.Scdsp == "X" ? true : false;
			// oModel.HeaderData.Hazgd = oData.Hazgd == "X" ? true : false;
			// oModel.HeaderData.Cranl = oData.Cranl == "X" ? true : false;
			// oModel.HeaderData.Bsecr = oData.Bsecr == "X" ? true : false;
			// oModel.HeaderData.Uspcl = oData.Uspcl == "X" ? true : false;
			// oModel.HeaderData.Prfst = oData.Prfst == "X" ? true : false;
			// oModel.HeaderData.Boros = oData.Boros == "X" ? true : false;
			// oModel.HeaderData.Fdadc = oData.Fdadc == "X" ? true : false;
			// oModel.HeaderData.Man21 = oData.Man21 == "X" ? true : false;
			// oModel.HeaderData.Man22 = oData.Man22 == "X" ? true : false;
			// oModel.HeaderData.Man31 = oData.Man31 == "X" ? true : false;
			// oModel.HeaderData.Man32 = oData.Man32 == "X" ? true : false;
			// oModel.HeaderData.Manh1 = oData.Manh1 == "X" ? true : false;
			// oModel.HeaderData.Pcnrq = oData.Pcnrq == "X" ? true : false;
			// oModel.HeaderData.Smpcr = oData.Smpcr == "X" ? true : false;
			// oModel.HeaderData.Addcr = oData.Addcr;
			oModel.HeaderData.MstaeWerks = oData.MstaeWerks;
			oModel.HeaderData.Docguid = oData.Docguid;
			oModel.HeaderData.Crtuser = oData.Crtuser;

			this.createdUser = oData.Crtuser;
			this.docGuid = oData.Docguid;

			oModel.AltUomData = [];
			oModel.BasicTextData = [];
			oModel.StreamChangeData = [];

			for (var i = 0; oData.RequestMdfAlt.results.length > i; i++) {
				var item = oData.RequestMdfAlt.results[i];
				oModel.AltUomData.push({
					"Umren": item.Umren,
					"Meinh": item.Meinh,
					"Umrez": item.Umrez,
					"Meins": item.Meins,
					"Deletable": false
				});
			}
			oModel.AltUomData.enabledAddBtn = false;

			for (var i = 0; oData.RequestMdfTxt.results.length > i; i++) {
				var item = oData.RequestMdfTxt.results[i];
				oModel.BasicTextData.push({
					"Spras": item.Spras,
					"Sptxt": "",
					"BasicText": item.Desc,
					"Deletable": false
				});
			}
			oModel.BasicTextData.enabledAddBtn = false;

			for (var i = 0; oData.RequestMdfChn.results.length > i; i++) {
				var item = oData.RequestMdfChn.results[i];
				oModel.StreamChangeData.push({
					"Stream": item.Stream,
					"ChangeText": item.ChangeText,
					"Deletable": false
				});
			}
			oModel.StreamChangeData.enabledAddBtn = false;

			var selStrgLocs = [];
			for (var i = 0; oData.RequestMdfStrg.results.length > i; i++) {
				var item = oData.RequestMdfStrg.results[i];
				selStrgLocs.push(item.Lgort);
			}
			this._bindStorageLoc(oData.Werks, selStrgLocs);

			this._bindStorageLocExt("", oData.WerksExt, selStrgLocs);

			this._bindStorageLocChn("", oData.WerksChn, selStrgLocs);

			this.oViewModel.refresh();

		},

		_setEnablityRegardingReqType: function (reqtype, prctyp) {

			var oModel = this.oViewModel.getData();

			if (prctyp == "DISPLAY") {
				oModel.enabledMatnr = false;
				oModel.enabledMaktx = false;
				oModel.enabledWerks = false;
				oModel.enabledLgort = false;
				oModel.enabledMtart = false;
				oModel.enabledWerksExt = false;
				oModel.enabledLgortExt = false;
				oModel.enabledVkorgExt = false;
				oModel.enabledVtwegExt = false;
				oModel.enabledWerksChn = false;
				oModel.enabledLgortChn = false;
				oModel.enabledVkorgChn = false;
				oModel.enabledVtwegChn = false;
				return;
			}

			switch (reqtype) {
			case "01": //Material creation
				oModel.enabledMatnr = false;
				oModel.enabledMaktx = true;
				oModel.enabledWerks = true;
				oModel.enabledLgort = true;
				oModel.enabledMtart = true;
				oModel.enabledWerksExt = false;
				oModel.enabledLgortExt = false;
				oModel.enabledVkorgExt = false;
				oModel.enabledVtwegExt = false;
				oModel.enabledWerksChn = false;
				oModel.enabledLgortChn = false;
				oModel.enabledVkorgChn = false;
				oModel.enabledVtwegChn = false;
				break;
			case "02": //Material extension
				oModel.enabledMatnr = true;
				oModel.enabledMaktx = false;
				oModel.enabledWerks = true;
				oModel.enabledLgort = false;
				oModel.enabledMtart = false;
				oModel.enabledWerksExt = true;
				oModel.enabledLgortExt = true;
				oModel.enabledVkorgExt = true;
				oModel.enabledVtwegExt = true;
				oModel.enabledWerksChn = false;
				oModel.enabledLgortChn = false;
				oModel.enabledVkorgChn = false;
				oModel.enabledVtwegChn = false;
				break;
			case "03": //Material change
				oModel.enabledMatnr = true;
				oModel.enabledMaktx = false;
				oModel.enabledWerks = true;
				oModel.enabledLgort = false;
				oModel.enabledMtart = false;
				oModel.enabledWerksExt = false;
				oModel.enabledLgortExt = false;
				oModel.enabledVkorgExt = false;
				oModel.enabledVtwegExt = false;
				oModel.enabledWerksChn = true;
				oModel.enabledLgortChn = true;
				oModel.enabledVkorgChn = true;
				oModel.enabledVtwegChn = true;
				break;
			case "04": //Material block
				oModel.enabledMatnr = true;
				oModel.enabledMaktx = false;
				oModel.enabledWerks = true;
				oModel.enabledMtart = false;
				oModel.enabledWerksExt = false;
				oModel.enabledLgortExt = false;
				oModel.enabledVkorgExt = false;
				oModel.enabledVtwegExt = false;
				oModel.enabledWerksChn = false;
				oModel.enabledLgortChn = false;
				oModel.enabledVkorgChn = false;
				oModel.enabledVtwegChn = false;
			case "05": //Material passivation
				oModel.enabledMatnr = true;
				oModel.enabledMaktx = false;
				oModel.enabledWerks = true;
				oModel.enabledLgort = false;
				oModel.enabledMtart = false;
				oModel.enabledWerksExt = false;
				oModel.enabledLgortExt = false;
				oModel.enabledVkorgExt = false;
				oModel.enabledVtwegExt = false;
				oModel.enabledWerksChn = false;
				oModel.enabledLgortChn = false;
				oModel.enabledVkorgChn = false;
				oModel.enabledVtwegChn = false;
			case "06": //Material activation
				oModel.enabledMatnr = true;
				oModel.enabledMaktx = false;
				oModel.enabledWerks = true;
				oModel.enabledLgort = false;
				oModel.enabledMtart = false;
				oModel.enabledWerksExt = false;
				oModel.enabledLgortExt = false;
				oModel.enabledVkorgExt = false;
				oModel.enabledVtwegExt = false;
				oModel.enabledWerksChn = false;
				oModel.enabledLgortChn = false;
				oModel.enabledVkorgChn = false;
				oModel.enabledVtwegChn = false;
				break;
			default:
			}
			this.oViewModel.refresh();

		},

		_setVisiblityRegardingReqType: function (reqtype) {

			var oModel = this.oViewModel.getData();

			switch (reqtype) {
			case "01": //Material creation

				oModel.visibleReqType = {
					Werks: true,
					Lgort: true,
					MstaeWerks: false,
					Mtart: true,
					WerksExt: false,
					LgortExt: false,
					VkorgExt: false,
					VtwegExt: false,
					WerksChn: false,
					LgortChn: false,
					VkorgChn: false,
					VtwegChn: false,
					RequestNote: true,
					Meins: true,
					Matkl: true,
					Hazgd: true,
					Idnlf: true,
					Mfrnr: true,
					Lifnr: true,
					AltUom: true,
					BasicText: true,
					StreamText: false,
					CertificatesTab: true,
				};
				break;
			case "02": //Material extension
				oModel.visibleReqType = {
					Werks: true,
					Lgort: false,
					MstaeWerks: false,
					Mtart: true,
					WerksExt: true,
					LgortExt: true,
					VkorgExt: true,
					VtwegExt: true,
					WerksChn: false,
					LgortChn: false,
					VkorgChn: false,
					VtwegChn: false,
					RequestNote: true,
					Meins: false,
					Matkl: false,
					Hazgd: false,
					Idnlf: false,
					Mfrnr: false,
					Lifnr: false,
					AltUom: false,
					BasicText: false,
					StreamText: false,
					CertificatesTab: false,
				};

				break;
			case "03": //Material change
				oModel.visibleReqType = {
					Werks: true,
					Lgort: false,
					MstaeWerks: false,
					Mtart: true,
					WerksExt: false,
					LgortExt: false,
					VkorgExt: false,
					VtwegExt: false,
					WerksChn: true,
					LgortChn: true,
					VkorgChn: true,
					VtwegChn: true,
					RequestNote: false,
					Meins: false,
					Matkl: false,
					Hazgd: false,
					Idnlf: false,
					Mfrnr: false,
					Lifnr: false,
					AltUom: false,
					BasicText: false,
					StreamText: true,
					CertificatesTab: false,
				};
				break;
			case "04": //Material block

				oModel.visibleReqType = {
					Werks: true,
					Lgort: false,
					MstaeWerks: true,
					Mtart: true,
					WerksExt: false,
					LgortExt: false,
					VkorgExt: false,
					VtwegExt: false,
					WerksChn: false,
					LgortChn: false,
					VkorgChn: false,
					VtwegChn: false,
					RequestNote: true,
					Meins: false,
					Matkl: false,
					Hazgd: false,
					Idnlf: false,
					Mfrnr: false,
					Lifnr: false,
					AltUom: false,
					BasicText: false,
					StreamText: false,
					CertificatesTab: false,
				};
				break;
			case "05": //Material passivation

				oModel.visibleReqType = {
					Werks: true,
					Lgort: false,
					MstaeWerks: true,
					Mtart: true,
					WerksExt: false,
					LgortExt: false,
					VkorgExt: false,
					VtwegExt: false,
					WerksChn: false,
					LgortChn: false,
					VkorgChn: false,
					VtwegChn: false,
					RequestNote: true,
					Meins: false,
					Matkl: false,
					Hazgd: false,
					Idnlf: false,
					Mfrnr: false,
					Lifnr: false,
					AltUom: false,
					BasicText: false,
					StreamText: false,
					CertificatesTab: false,
				};
				break;
			case "06": //Material activation

				oModel.visibleReqType = {
					Werks: true,
					Lgort: false,
					MstaeWerks: true,
					Mtart: true,
					WerksExt: false,
					LgortExt: false,
					VkorgExt: false,
					VtwegExt: false,
					WerksChn: false,
					LgortChn: false,
					VkorgChn: false,
					VtwegChn: false,
					RequestNote: true,
					Meins: false,
					Matkl: false,
					Hazgd: false,
					Idnlf: false,
					Mfrnr: false,
					Lifnr: false,
					AltUom: false,
					BasicText: false,
					StreamText: false,
					CertificatesTab: false,
				};
				break;
			default:
			}

			this.oViewModel.refresh();
		},
		_setVisibleButtons: function (reqstat) {
			var cbReqstat = this.getView().byId("cbReqstat").getSelectedKey();
		},

		onSelectionChangeUom: function (oEvent) {
			var cbMeins = oEvent.getSource();

			var oModel = this.oViewModel.getData();
			oModel.AltUomData = [];
			this.oViewModel.refresh();
		},

		onPressAddNewAltUom: function (oEvent) {

			var uom = this.getView().byId("cbMeins").getSelectedKey();
			if (!uom) {
				this.getMessage("selectUom");
				return;
			}

			this._getAddAltUomDialog().open();

			var cbMeinh = sap.ui.getCore().byId("cbMeinh");
			this._bindComboBox(cbMeinh, [], "{Msehi}", "{Msehi} - {Msehl}", "/GetUomSet");
			cbMeinh.setSelectedKey("");

			sap.ui.getCore().byId("inpUmren").setValue("");

			var cbMeinsBase = sap.ui.getCore().byId("cbMeinsBase");
			this._bindComboBox(cbMeinsBase, [], "{Msehi}", "{Msehi} - {Msehl}", "/GetUomSet");
			cbMeinsBase.setSelectedKey(uom);

			sap.ui.getCore().byId("inpUmrez").setValue("");
		},

		onPressAltUomOK: function (oEvent) {

			var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

			var cbMeinh = sap.ui.getCore().byId("cbMeinh").getSelectedKey();
			if (!cbMeinh) {
				this.getMessage("selectAltUnitOfMeasure");
				return;
			}

			var inpUmren = sap.ui.getCore().byId("inpUmren").getValue();
			if (!inpUmren) {
				this.getMessage("enterDenominator");
				return;
			} else {
				//special character
				if (format.test(inpUmren)) {
					this.getMessage("errorDenominator");
					return;
				}
				if (parseInt(inpUmren) < 1 || parseInt(inpUmren) > 99999) {
					this.getMessage("errorDenominatorValue");
					return;
				}
			}

			var cbMeinsBase = sap.ui.getCore().byId("cbMeinsBase").getSelectedKey();

			var inpUmrez = sap.ui.getCore().byId("inpUmrez").getValue();
			if (!inpUmrez) {
				this.getMessage("enterNumerator");
				return;
			} else {
				if (format.test(inpUmrez)) {
					this.getMessage("errorDenominator");
					return;
				}
				if (parseInt(inpUmrez) < 1 || parseInt(inpUmrez) > 99999) {
					this.getMessage("errorDenominatorValue");
					return;
				}
			}

			var oData = this.oViewModel.getData();
			oData.AltUomData.push({
				"Umren": inpUmren,
				"Meinh": cbMeinh,
				"Umrez": inpUmrez,
				"Meins": cbMeinsBase,
				"Deletable": true,
			});
			this.oViewModel.refresh();

			this._getAddAltUomDialog().close();
		},

		onPressAltUomCancel: function (oEvent) {
			this._getAddAltUomDialog().close();
		},

		onPressDeleteAltUom: function (oEvent) {

			var oDelItem = oEvent.getSource().getParent().getBindingContext("viewModel").getProperty();

			var oData = this.oViewModel.getData();
			for (var i = 0; i < oData.AltUomData.length; i++) {
				if (oData.AltUomData[i] === oDelItem) {
					oData.AltUomData.splice(i, 1);
					break;
				}
			}
			this.oViewModel.refresh();
		},

		_getAddAltUomDialog: function () {
			if (!this._oAddAltUomDialog) {
				this._oAddAltUomDialog = sap.ui.xmlfragment("zmmatreq.view.fragment.AddAltUom", this);
				this.getView().addDependent(this._oAddAltUomDialog);
			}
			return this._oAddAltUomDialog;
		},

		onPressAddNewBasicText: function () {
			this._getAddBasicTextDialog().open();

			var cbSpras = sap.ui.getCore().byId("cbSpras");
			this._bindComboBox(cbSpras, [], "{Spras}", "{Sptxt}", "/GetLanguageSet");
			cbSpras.setSelectedKey("");

			sap.ui.getCore().byId("txtAreaBasicText").setValue("");
		},

		_getAddBasicTextDialog: function () {
			if (!this._oAddBasicTextDialog) {
				this._oAddBasicTextDialog = sap.ui.xmlfragment("zmmatreq.view.fragment.AddBasicDataText", this);
				this.getView().addDependent(this._oAddBasicTextDialog);
			}
			return this._oAddBasicTextDialog;
		},

		onPressBasicTextOK: function (oEvent) {

			var cbSpras = sap.ui.getCore().byId("cbSpras");
			if (!cbSpras.getSelectedKey()) {
				this.getMessage("selectLanguage");
				return;
			}

			var txtAreaBasicText = sap.ui.getCore().byId("txtAreaBasicText").getValue();
			if (!txtAreaBasicText) {
				this.getMessage("enterBasicText");
				return;
			}

			var oData = this.oViewModel.getData();
			oData.BasicTextData.push({
				"Spras": cbSpras.getSelectedKey(),
				"Sptxt": cbSpras.getSelectedItem().getText(),
				"BasicText": txtAreaBasicText,
				"Deletable": true
			});
			this.oViewModel.refresh();

			this._getAddBasicTextDialog().close();
		},

		onPressBasicTextCancel: function (oEvent) {
			this._getAddBasicTextDialog().close();
		},

		onPressDeleteBasicText: function (oEvent) {

			var oDelItem = oEvent.getSource().getParent().getBindingContext("viewModel").getProperty();

			var oData = this.oViewModel.getData();
			for (var i = 0; i < oData.BasicTextData.length; i++) {
				if (oData.BasicTextData[i] === oDelItem) {
					oData.BasicTextData.splice(i, 1);
					break;
				}
			}
			this.oViewModel.refresh();
		},

		onPressAddNewStreamText: function () {
			var inpMatnr = this.getView().byId("inpMatnr").getValue();
			if (!inpMatnr) {
				this.getMessage("selectMaterial");
				return;
			}

			var cbMtart = this.getView().byId("cbMtart").getSelectedKey();
			if (!cbMtart) {
				this.getMessage("selectMaterialType");
				return;
			}

			this._getAddStreamTextDialog().open();

			var oFilter = new sap.ui.model.Filter(
				"Mtart",
				sap.ui.model.FilterOperator.EQ,
				cbMtart);

			var cbStream = sap.ui.getCore().byId("cbStream");
			this._bindComboBox(cbStream, oFilter, "{Stream}", "{Stream} - {Section}", "/GetStreamListMatGrpSet");
			cbStream.setSelectedKey("");
			sap.ui.getCore().byId("txtAreaStreamText").setValue("");
		},

		_getAddStreamTextDialog: function () {
			if (!this._oAddStreamTextDialog) {
				this._oAddStreamTextDialog = sap.ui.xmlfragment("zmmatreq.view.fragment.AddStreamText", this);
				this.getView().addDependent(this._oAddStreamTextDialog);
			}
			return this._oAddStreamTextDialog;
		},

		onPressStreamTextOK: function (oEvent) {

			var cbStream = sap.ui.getCore().byId("cbStream");
			if (!cbStream.getSelectedKey()) {
				this.getMessage("selectStream");
				return;
			}

			var txtAreaStreamText = sap.ui.getCore().byId("txtAreaStreamText").getValue();
			if (!txtAreaStreamText) {
				this.getMessage("enterChangeText");
				return;
			}

			var oData = this.oViewModel.getData();
			oData.StreamChangeData.push({
				"Stream": cbStream.getSelectedKey(),
				"ChangeText": txtAreaStreamText,
				"Deletable": true
			});
			this.oViewModel.refresh();

			this._getAddStreamTextDialog().close();
		},

		onPressStreamTextCancel: function (oEvent) {
			this._getAddStreamTextDialog().close();
		},

		onPressDeleteStreamText: function (oEvent) {

			var oDelItem = oEvent.getSource().getParent().getBindingContext("viewModel").getProperty();

			var oData = this.oViewModel.getData();
			for (var i = 0; i < oData.StreamChangeData.length; i++) {
				if (oData.StreamChangeData[i] === oDelItem) {
					oData.StreamChangeData.splice(i, 1);
					break;
				}
			}
			this.oViewModel.refresh();
		},

		onPressMatnrF4: function () {

			this._getMaterialListDialog().open();

			var cbReqtyp = this.getView().byId("cbReqtyp").getSelectedKey();

			if (cbReqtyp == "02" || cbReqtyp == "03") {
				sap.ui.getCore().byId("clmnPSmatlStatus").setVisible(false);
				sap.ui.getCore().byId("clmnPlant").setVisible(false);
			} else {
				sap.ui.getCore().byId("clmnPSmatlStatus").setVisible(true);
				sap.ui.getCore().byId("clmnPlant").setVisible(true);
			}

			sap.ui.getCore().byId("srcMatnr").setValue("");

			this._bindMaterialList("");

			var oTable = sap.ui.getCore().byId("tblMatnrF4");
			oTable.getBinding("items").filter();
			oTable.removeSelections(true);

		},

		onPressMaterialListOK: function () {

			var oTable = sap.ui.getCore().byId("tblMatnrF4");

			if (oTable.getSelectedItems().length > 0) {

				var line = oTable.getSelectedItems()[0].getBindingContext("viewModel").getProperty();

				this.getView().byId("inpMatnr").setValue(line.Matnr);
				this.getView().byId("txtAreaMaktx").setValue(line.Maktx);
				this.getView().byId("cbMstaeWerks").setSelectedKey(line.Werks);
				this.getView().byId("cbMtart").setSelectedKey(line.Mtart);

				this._bindPlantExt(line.Matnr);
				this._bindPlantChn(line.Matnr);

				this._bindSalesOrgExt(line.Matnr);
				this._bindSalesOrgChn(line.Matnr);
			}

			var oModel = this.oViewModel.getData();
			oModel.MaterailGMPData = [];
			this.oViewModel.refresh();

			this._getMaterialListDialog().close();
		},

		onPressMaterialListCancel: function () {

			var oModel = this.oViewModel.getData();
			oModel.MaterailGMPData = [];
			this.oViewModel.refresh();

			this._getMaterialListDialog().close();
		},

		_getMaterialListDialog: function () {
			if (!this._oMaterialListDialog) {
				this._oMaterialListDialog = sap.ui.xmlfragment("zmmatreq.view.fragment.MaterialList", this);
				this.getView().addDependent(this._oMaterialListDialog);
			}
			return this._oMaterialListDialog;
		},

		_getHazgdUserListDialog: function () {
			if (!this._oHazgdUserListDialog) {
				this._oHazgdUserListDialog = sap.ui.xmlfragment("zmmatreq.view.fragment.HazgdUserList", this);
				this.getView().addDependent(this._oHazgdUserListDialog);
			}
			return this._oHazgdUserListDialog;
		},

		onPressHazgdAprvOK: function (oEvent) {

			var cbHazgdAprv = sap.ui.getCore().byId("cbHazgdAprv");
			if (!cbHazgdAprv.getSelectedKey()) {
				this.getMessage("selectUsername");
				return;
			}

			this._getHazgdUserListDialog().close();
		},

		onPressHazgdAprvCancel: function (oEvent) {
			this._getHazgdUserListDialog().close();
		},

		onSearchMatnrF4: function (oEvent) {
			var sValue = oEvent.getSource().getValue();
			this._bindMaterialList(sValue);
		},

		onPressCreateRequest: function (oEvent) {
			if (this._checkRequest())
				this._setRequestData("CREATE");
		},

		onPressSubmitRequest: function (oEvent) {
			if (this.createdUser == this.currentUser) {

				var headerSet = {};
				headerSet.Reqnr = this.reqnr;
				headerSet.Prctyp = "SUBMIT";

				headerSet.RequestMdfAlt = [];
				headerSet.RequestMdfTxt = [];
				headerSet.RequestMdfChn = [];
				headerSet.RequestMdfStrg = [];

				this._sendRequestData(headerSet);
			} else
				sap.m.MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("errorSubmitRequest", this.createdUser));

		},

		onPressCancelRequest: function (oEvent) {

			var headerSet = {};
			headerSet.Reqnr = this.reqnr;
			headerSet.Prctyp = "CANCEL";

			headerSet.RequestMdfAlt = [];
			headerSet.RequestMdfTxt = [];
			headerSet.RequestMdfChn = [];
			headerSet.RequestMdfStrg = [];

			this._sendRequestData(headerSet);
		},

		onPressChangeRequest: function (oEvent) {
			if (this.createdUser == this.currentUser)
				this._loadData(this.reqnr, "CHANGE");
			else
				sap.m.MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("errorChangeRequest", this.createdUser));

		},
		onPressSaveRequest: function (oEvent) {
			if (this._checkRequest())
				this._setRequestData("CHANGE");
		},

		onPressCancelChanges: function (oEvent) {
			this._loadData(this.reqnr, "DISPLAY");
		},

		onChangeRequestType: function (oEvent) {
			var cbReqtyp = oEvent.getSource().getSelectedKey();

			var oModel = this.oViewModel.getData();
			oModel.HeaderData = {};
			oModel.HeaderData.Reqnr = this.reqnr;
			oModel.HeaderData.Reqtyp = cbReqtyp;
			oModel.HeaderData.Reqstat = "";
			oModel.AltUomData = [];
			oModel.BasicTextData = [];
			oModel.StreamChangeData = [];
			this.oViewModel.refresh();

			this._setVisiblityRegardingReqType(cbReqtyp);
			this._setEnablityRegardingReqType(cbReqtyp, "");

		},

		onChangeWerks: function (oEvent) {
			var mcbLgort = this.getView().byId("mcbLgort");
			mcbLgort.unbindItems();
			mcbLgort.setSelectedKeys([]);

			var werks = oEvent.getSource().getSelectedKey();
			if (werks) {
				this._bindStorageLoc(werks);
			}
		},

		onChangeWerksExt: function (oEvent) {

			var mcbLgortExt = this.getView().byId("mcbLgortExt");
			mcbLgortExt.unbindItems();
			mcbLgortExt.setSelectedKeys([]);

			var matnr = this.getView().byId("inpMatnr").getValue();
			var werks = oEvent.getSource().getSelectedKey();
			if (werks) {
				this._bindStorageLocExt(matnr, werks, []);
			}
		},
		onChangeVkorgExt: function (oEvent) {
			var cbVtwegExt = this.getView().byId("cbVtwegExt");
			cbVtwegExt.unbindItems();
			cbVtwegExt.setSelectedKey("");

			var vkorg = oEvent.getSource().getSelectedKey();
			if (vkorg) {
				this._bindDistributionChannelExt(this.getView().byId("inpMatnr").getValue(), vkorg, "");
			}
		},

		onChangeWerksChn: function (oEvent) {

			var mcbLgortChn = this.getView().byId("mcbLgortChn");
			mcbLgortChn.unbindItems();
			mcbLgortChn.setSelectedKeys([]);

			var matnr = this.getView().byId("inpMatnr").getValue();
			var werks = oEvent.getSource().getSelectedKey();
			if (werks) {
				this._bindStorageLocChn(matnr, werks, []);
			}
		},
		onChangeVkorgChn: function (oEvent) {
			var cbVtwegChn = this.getView().byId("cbVtwegChn");
			cbVtwegChn.unbindItems();
			cbVtwegChn.setSelectedKey("");

			var vkorg = oEvent.getSource().getSelectedKey();
			if (vkorg) {
				this._bindDistributionChannelChn(this.getView().byId("inpMatnr").getValue(), vkorg, "");
			}
		},

		_generateDocGuid: function () {
			var that = this;
			this.getView().getModel().read("/GetNewDocGuidSet('X')", {
				async: true,
				success: function (oData) {
					that.docGuid = oData.Docguid;
				},
				error: function (oData) {
					var sMessage = that._getMessageFromOdataResponse(oData);
					sap.m.MessageBox.error(sMessage);
				}
			});
		},

		onChangeFile: function (oEvent) {

			var oModel = this.getView().getModel();

			oModel.refreshSecurityToken();
			var oHeaders = oModel.oHeaders;
			var sToken = oHeaders['x-csrf-token'];

			var oUploadCollection = oEvent.getSource();
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: sToken
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

			var sUploadedFile = oEvent.getParameters().files[0].name;

			var fileList = oUploadCollection.getItems();
			var filename = oEvent.getParameters().files[0].name;
			var length = parseInt(oEvent.getParameters().files[0].size);

			var url = encodeURI("/sap/opu/odata/sap/ZMM_MAT_MASTER_REQUEST_SRV/DocumentSet(Docguid=guid\'" + this.docGuid + "\',Filename='" +
				filename +
				"',Length=" + length + ")/DocumentRowSet");

			oUploadCollection.setUploadUrl(url);

		},

		onBeforeUploadStartsFile: function (oEvent) {

			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

		},

		onUploadCompleteFile: function (oEvent) {
			this._bindUploadCollection(true);
		},

		_bindUploadCollection: function (deletable) {

			var uploadCollection = this.getView().byId("uploadCollection");
			uploadCollection.destroyItems();

			var aFilter = [];

			aFilter.push(new Filter(
				"Docguid",
				FilterOperator.EQ,
				this.docGuid));

			var oModel = this.oViewModel.getData();
			oModel.DocListData = [];

			var that = this;
			this.getView().getModel().read("/GetDocumentListSet", {
				async: true,
				filters: aFilter,
				success: function (oData) {

					for (var i = 0; oData.results.length > i; i++) {
						oData.results[i].Deletable = deletable;
						oModel.DocListData.push(oData.results[i]);
					}

					that.oViewModel.refresh();
				},
				error: function (oData) {
					var sMessage = that._getMessageFromOdataResponse(oData);
					sap.m.MessageBox.error(sMessage);
				}
			});

		},

		onFileDeleted: function (oEvent) {

			var uploadCollection = oEvent.getSource();

			var bindItem = sap.ui.getCore().byId(uploadCollection.sDeletedItemId).getBindingContext("viewModel").getProperty();

			var oJsonData = {
				Docguid: bindItem.Docguid,
				Line: bindItem.Line
			};

			var that = this;
			this.getView().getModel().create("/DeleteDocumentSet", oJsonData, {
				async: false,
				success: function (oData) {
					that._bindUploadCollection(true);
				},
				error: function (oData) {
					var sMessage = this._getMessageFromOdataResponse(oData);
					sap.m.MessageBox.error(sMessage);
				}
			});

		},

		onPressStatusRefresh: function (reqnr) {
			this._bindRequestStatus(this.reqnr);
		},

		_bindRequestStatus: function (reqnr) {

			var aFilter = [];

			aFilter.push(new Filter(
				"Reqnr",
				FilterOperator.EQ,
				reqnr));

			var oModel = this.oViewModel.getData();
			oModel.StatusData = [];

			var that = this;
			this.getView().getModel().read("/GetRequestStatusListSet", {
				async: true,
				filters: aFilter,
				success: function (oData) {

					for (var i = 0; oData.results.length > i; i++) {
						oModel.StatusData.push(oData.results[i]);
					}

					that.oViewModel.refresh();
				},
				error: function (oData) {
					var sMessage = that._getMessageFromOdataResponse(oData);
					sap.m.MessageBox.error(sMessage);
				}
			});

		},
		_bindReqtyp: function () {
			var cbReqtyp = this.getView().byId("cbReqtyp");
			this._bindComboBox(cbReqtyp, [], "{Reqtyp}", "{ReqtypTxt}", "/GetReqtypSet");
		},
		_bindReqstat: function () {
			var cbReqstat = this.getView().byId("cbReqstat");
			this._bindComboBox(cbReqstat, [], "{Reqstat}", "{ReqstatTxt}", "/GetReqstatSet");
		},
		_bindMaterialType: function () {
			var cbMtart = this.getView().byId("cbMtart");
			this._bindComboBox(cbMtart, [], "{Mtart}", "{Mtart} - {Mtbez}", "/GetMaterialTypeSet");
		},
		_bindPlant: function () {
			var cbWerks = this.getView().byId("cbWerks");
			this._bindComboBox(cbWerks, [], "{Werks}", "{Werks} - {Name1}", "/GetPlantSet");
		},
		_bindStorageLoc: function (werks, selKeys) {
			var oFilter = new sap.ui.model.Filter(
				"Werks",
				sap.ui.model.FilterOperator.EQ,
				werks);

			var mcbLgort = this.getView().byId("mcbLgort");
			this._bindComboBox(mcbLgort, oFilter, "{Lgort}", "{Lgort} - {Lgobe}", "/GetStorageLocSet");
			if (selKeys)
				mcbLgort.setSelectedKeys(selKeys);
		},
		_bindPlantSpecificMat: function () {
			var cbMstaeWerks = this.getView().byId("cbMstaeWerks");
			this._bindComboBox(cbMstaeWerks, [], "{Werks}", "{Werks} - {Name1}", "/GetPlantSet");
		},
		_bindPlantExt: function (matnr) {
			var aFilter = [];
			if (matnr)
				aFilter.push(new sap.ui.model.Filter(
					"Matnr",
					sap.ui.model.FilterOperator.EQ,
					matnr));

			var cbWerksExt = this.getView().byId("cbWerksExt");
			this._bindComboBox(cbWerksExt, aFilter, "{Werks}", "{Werks} - {Name1}", "/GetPlantExtSet");
		},
		_bindStorageLocExt: function (matnr, werks, selKeys) {
			var aFilter = [];
			if (matnr)
				aFilter.push(new sap.ui.model.Filter(
					"Matnr",
					sap.ui.model.FilterOperator.EQ,
					matnr));

			aFilter.push(new sap.ui.model.Filter(
				"Werks",
				sap.ui.model.FilterOperator.EQ,
				werks));

			var mcbLgortExt = this.getView().byId("mcbLgortExt");
			this._bindComboBox(mcbLgortExt, aFilter, "{Lgort}", "{Lgort} - {Lgobe}", "/GetStorageLocExtSet");
			mcbLgortExt.setSelectedKeys(selKeys);
		},
		_bindPlantChn: function (matnr) {
			var oFilter = new sap.ui.model.Filter(
				"Matnr",
				sap.ui.model.FilterOperator.EQ,
				matnr);

			var cbWerksChn = this.getView().byId("cbWerksChn");
			this._bindComboBox(cbWerksChn, oFilter, "{Werks}", "{Werks} - {Name1}", "/GetPlantChnSet");
		},
		_bindStorageLocChn: function (matnr, werks, selKeys) {
			var aFilter = [];
			if (matnr)
				aFilter.push(new sap.ui.model.Filter(
					"Matnr",
					sap.ui.model.FilterOperator.EQ,
					matnr));

			aFilter.push(new sap.ui.model.Filter(
				"Werks",
				sap.ui.model.FilterOperator.EQ,
				werks));

			var mcbLgortChn = this.getView().byId("mcbLgortChn");
			this._bindComboBox(mcbLgortChn, aFilter, "{Lgort}", "{Lgort} - {Lgobe}", "/GetStorageLocChnSet");
			mcbLgortChn.setSelectedKeys(selKeys);
		},
		_bindSalesOrgExt: function (matnr) {

			var oFilter = new sap.ui.model.Filter(
				"Matnr",
				sap.ui.model.FilterOperator.EQ,
				matnr);

			var cbVkorgExt = this.getView().byId("cbVkorgExt");
			this._bindComboBox(cbVkorgExt, oFilter, "{Vkorg}", "{Vkorg} - {Vtext}", "/GetSalesOrgExtSet");
		},
		_bindDistributionChannelExt: function (matnr, vkorg, selKey) {
			var aFilter = [];

			aFilter.push(new sap.ui.model.Filter(
				"Matnr",
				sap.ui.model.FilterOperator.EQ,
				matnr));

			aFilter.push(new sap.ui.model.Filter(
				"Vkorg",
				sap.ui.model.FilterOperator.EQ,
				vkorg));

			var cbVtwegExt = this.getView().byId("cbVtwegExt");
			this._bindComboBox(cbVtwegExt, aFilter, "{Vtweg}", "{Vtweg} - {Vtext}", "/GetDistChnlExtSet");
			cbVtwegExt.setSelectedKey(selKey);
		},
		_bindSalesOrgChn: function (matnr) {

			var oFilter = new sap.ui.model.Filter(
				"Matnr",
				sap.ui.model.FilterOperator.EQ,
				matnr);

			var cbVkorgChn = this.getView().byId("cbVkorgChn");
			this._bindComboBox(cbVkorgChn, oFilter, "{Vkorg}", "{Vkorg} - {Vtext}", "/GetSalesOrgChnSet");
		},
		_bindDistributionChannelChn: function (matnr, vkorg, selKey) {
			var aFilter = [];

			aFilter.push(new sap.ui.model.Filter(
				"Matnr",
				sap.ui.model.FilterOperator.EQ,
				matnr));

			aFilter.push(new sap.ui.model.Filter(
				"Vkorg",
				sap.ui.model.FilterOperator.EQ,
				vkorg));

			var cbVtwegChn = this.getView().byId("cbVtwegChn");
			this._bindComboBox(cbVtwegChn, aFilter, "{Vtweg}", "{Vtweg} - {Vtext}", "/GetDistChnlChnSet");
			cbVtwegChn.setSelectedKey(selKey);
		},
		_bindMaterialGroup: function () {
			var cbMatkl = this.getView().byId("cbMatkl");
			this._bindComboBox(cbMatkl, [], "{Matkl}", "{Matkl} - {Wgbez}", "/GetMaterialGroupSet");
		},
		_bindUom: function () {
			var cbMeins = this.getView().byId("cbMeins");
			this._bindComboBox(cbMeins, [], "{Msehi}", "{Msehi} - {Msehl}", "/GetUomSet");
		},
		_bindSupplier: function () {
			var oModel = this.oViewModel.getData();
			var that = this;
			this.getView().getModel().read("/GetSupplierSet", {
				async: true,
				success: function (oData) {

					for (var i = 0; i < oData.results.length; i++) {
						oModel.SupplierData.push(oData.results[i]);
					}
					that.oViewModel.refresh();
				},
				error: function (oData) {
					var sMessage = that._getMessageFromOdataResponse(oData);
					sap.m.MessageBox.error(sMessage);
				}
			});
		},
		_bindMaterialList: function (search) {

			var aFilter = [];
			if (search)
				aFilter.push(new sap.ui.model.Filter(
					"Search",
					sap.ui.model.FilterOperator.EQ,
					search));

			aFilter.push(new sap.ui.model.Filter(
				"Reqtyp",
				sap.ui.model.FilterOperator.EQ,
				this.getView().byId("cbReqtyp").getSelectedKey()));

			var oModel = this.oViewModel.getData();
			oModel.MaterailGMPData = [];

			var that = this;
			//this.getView().getModel().read("/GetGMPMaterailListSet", {
			this.getView().getModel().read("/GetGMPMaterialListSet", {	
				async: true,
				filters: aFilter,
				success: function (oData) {

					for (var i = 0; i < oData.results.length; i++) {
						oModel.MaterailGMPData.push(oData.results[i]);
					}
					that.oViewModel.refresh();
				},
				error: function (oData) {
					var sMessage = that._getMessageFromOdataResponse(oData);
					sap.m.MessageBox.error(sMessage);
				}
			});
		},
		_bindComboBox: function (slct, oFilter, key, tanim, service) {
			slct.unbindItems();

			var oSelectTemp = new sap.ui.core.ListItem({
				key: key,
				text: tanim,
				additionalText: key
			});

			slct.bindItems({
				path: service,
				async: true,
				template: oSelectTemp,
				filters: oFilter
			});
		},

		_checkRequest: function () {

			var cbReqtyp = this.getView().byId("cbReqtyp").getSelectedKey();
			var txtAreaRequestNote = this.getView().byId("txtAreaRequestNote").getValue();
			var inpMatnr = this.getView().byId("inpMatnr").getValue();
			var txtAreaMaktx = this.getView().byId("txtAreaMaktx").getValue();
			var cbWerks = this.getView().byId("cbWerks").getSelectedKey();
			var mcbLgort = this.getView().byId("mcbLgort").getSelectedKeys();
			var cbMtart = this.getView().byId("cbMtart").getSelectedKey();
			var cbMatkl = this.getView().byId("cbMatkl").getSelectedKey();
			var cbMeins = this.getView().byId("cbMeins").getSelectedKey();
			var cbWerksExt = this.getView().byId("cbWerksExt").getSelectedKey();
			var mcbLgortExt = this.getView().byId("mcbLgortExt").getSelectedKeys();
			var cbVkorgExt = this.getView().byId("cbVkorgExt").getSelectedKey();
			var cbVtwegExt = this.getView().byId("cbVtwegExt").getSelectedKey();
			var mcbLgortChn = this.getView().byId("mcbLgortChn").getSelectedKeys();

			var oData = this.oViewModel.getData();

			switch (cbReqtyp) {
			case "01": //Material creation
				if (!cbWerks) {
					this.getMessage("selectPlant");
					return false;
				}

				if (!txtAreaMaktx) {
					this.getMessage("enterMaterialDesc");
					return false;
				}

				if (!cbMtart) {
					this.getMessage("selectMaterialType");
					return false;
				}

				if (!cbMeins) {
					this.getMessage("selectUom");
					return false;
				}

				if (!cbMatkl) {
					this.getMessage("selectMaterialGroup");
					return false;
				}

				if (!txtAreaRequestNote) {
					this.getMessage("enterRequestNote");
					return false;
				}

				break;
			case "02": //Material extension
				if (!cbWerks) {
					this.getMessage("selectPlant");
					return false;
				}

				if (!inpMatnr) {
					this.getMessage("selectMaterial");
					return false;
				}

				if (!txtAreaRequestNote) {
					this.getMessage("enterRequestNote");
					return false;
				}

				if (!cbWerksExt && !cbVkorgExt) {
					this.getMessage("selectPlantExtOrSalesOrgExt");
					return false;
				}

				if (cbVkorgExt && !cbVtwegExt) {
					this.getMessage("selectDistChanExt");
					return false;
				}

				break;
			case "03": //Material change

				if (!cbWerks) {
					this.getMessage("selectPlant");
					return false;
				}

				if (!inpMatnr) {
					this.getMessage("selectMaterial");
					return false;
				}

				if (oData.StreamChangeData.length == 0) {
					this.getMessage("enterChangeText");
					return false;
				}

				break;
			case "04": //Material block
				if (!cbWerks) {
					this.getMessage("selectPlant");
					return false;
				}

				if (!inpMatnr) {
					this.getMessage("selectMaterial");
					return false;
				}

				if (!txtAreaRequestNote) {
					this.getMessage("enterRequestNote");
					return false;
				}

				break;
			case "05": //Material passivation
				if (!cbWerks) {
					this.getMessage("selectPlant");
					return false;
				}

				if (!inpMatnr) {
					this.getMessage("selectMaterial");
					return false;
				}

				if (!txtAreaRequestNote) {
					this.getMessage("enterRequestNote");
					return false;
				}
				break;
			case "06": //Material activation
				if (!cbWerks) {
					this.getMessage("selectPlant");
					return false;
				}

				if (!inpMatnr) {
					this.getMessage("selectMaterial");
					return false;
				}

				if (!txtAreaRequestNote) {
					this.getMessage("enterRequestNote");
					return false;
				}
				break;
			default:
			}

			return true;

		},

		onLiveChangeNumarator: function (oEvent) {
			var regex = /^[0-9]*$/;

			if (oEvent.getParameter("liveValue") === "" || !oEvent.getParameter("liveValue").match(regex)) {
				this.setValueState(sap.ui.core.ValueState.Error);
			} else {
				this.setValueState(sap.ui.core.ValueState.Success);
			}
		},

		getMessage: function (msgName) {
			var message = this.getView().getModel("i18n").getResourceBundle().getText(msgName);
			MessageToast.show(message, {
				width: "25em"
			});
		},

		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("requestList", {}, true /*no history*/ );
			}
		},

		_getMessageFromOdataResponse: function (oData) {
			var sMessage;

			if (oData.responseText.indexOf("<html>") >= 0) { //message is either in HTML or in JSON
				sMessage = new DOMParser().parseFromString(oData.responseText, "text/html").getElementsByTagName("h1")[0].innerText;
			} else {
				sMessage = JSON.parse(oData.responseText).error.message.value;
			}

			return sMessage;
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}

	});
});