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

	return Controller.extend("zmmatreq.controller.RequestList", {
		formatter: formatter,
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("requestList").attachMatched(
				this._onRouteMatched,
				this);
		},

		_onRouteMatched: function (oEvent) {
			this.getView().getModel().setSizeLimit(1000);
		},

		onBeforeRebindTable: function (oEvent) {

			var oBindingParams = oEvent.getParameter("bindingParams");
			var aFilter = this._setFilter("");

			for (var i = 0; aFilter.length > i; i++) {
				oBindingParams.filters.push(aFilter[i]);
			}

		},

		onAfterVariantLoad: function () {
			var filterData = this.byId("idSmartFilterBar").getFilterData();
			if (filterData._CUSTOM) {
				this.byId("inpReqnr").setValue(filterData._CUSTOM.Reqnr !== undefined ? filterData._CUSTOM.Reqnr : "");
				this.byId("cbReqtyp").setSelectedKey(filterData._CUSTOM.Reqtyp !== undefined ? filterData._CUSTOM.Reqtyp : "");
				this.byId("mcbReqstat").setSelectedKeys(filterData._CUSTOM.Reqstat !== undefined ? filterData._CUSTOM.Reqstat : []);
				this.byId("mcbMtart").setSelectedKeys(filterData._CUSTOM.Mtart !== undefined ? filterData._CUSTOM.Mtart : []);
				this.byId("inpMatnr").setValue(filterData._CUSTOM.Matnr !== undefined ? filterData._CUSTOM.Matnr : "");
				this.byId("mcbWerks").setSelectedKeys(filterData._CUSTOM.Werks !== undefined ? filterData._CUSTOM.Werks : []);
				//this.byId("cbGmpmat").setSelectedKey(filterData._CUSTOM.Gmpmat !== undefined ? filterData._CUSTOM.Gmpmat : "");
				//this.byId("chkAennr").setSelected(filterData._CUSTOM.Aennr !== undefined ? filterData._CUSTOM.Aennr : false);
				this.byId("inpCrtuser").setValue(filterData._CUSTOM.Crtuser !== undefined ? filterData._CUSTOM.Crtuser : "");
				this.byId("inpCrtuser").setValue(filterData._CUSTOM.Crtuser !== undefined ? filterData._CUSTOM.Crtuser : "");
			    this.byId("idSmartFilterBar").getControlByKey("Crtdate").setLastValue(filterData._CUSTOM.Crtdate !== undefined ? filterData._CUSTOM.Crtdate : "");
			}
		},

		onBeforeVariantFetch: function () {
			var aReqnr = this.byId("inpReqnr").getValue();
			var aReqtyp = this.byId("cbReqtyp").getSelectedKey();
			var aReqstat = this.byId("mcbReqstat").getSelectedKeys();
			var aMtart = this.byId("mcbMtart").getSelectedKeys();
			var aMatnr = this.byId("inpMatnr").getValue();
			var aWerks = this.byId("mcbWerks").getSelectedKeys();
			//var aGmpmat = this.byId("cbGmpmat").getSelectedKey();
			//var aAennr = this.byId("chkAennr").getSelected();
			var aCrtuser = this.byId("inpCrtuser").getValue();
			var aCrtdate = this.byId("idSmartFilterBar").getControlByKey("Crtdate").getLastValue()

			this.byId("idSmartFilterBar").setFilterData({
				_CUSTOM: {
					Reqnr: aReqnr,
					Reqtyp: aReqtyp,
					Reqstat: aReqstat,
					Mtart: aMtart,
					Matnr: aMatnr,
					Werks: aWerks,
					//Gmpmat: aGmpmat,
					//Aennr: aAennr,
					Crtuser: aCrtuser,
					Crtdate: aCrtdate
				}
			});
		},

		onPressDetail: function (oEvent) {

			var source = oEvent.getSource().getBindingContext().getProperty();
			var requestNumber = source.Reqnr;

			this.getRouter().navTo("requestDetail", {
				Reqnr: requestNumber,
				Type: "DISPLAY"
			});

		},

		onPressRequest: function (oEvent) {

			this.getRouter().navTo("requestDetail", {
				Reqnr: "000000000000",
				Type: "CREATE"
			});

		},

		_setFilter: function (kunnr) {

			var aFilters = [];

			var inpReqnr = this.getView().byId("inpReqnr").getValue();
			if (inpReqnr) {
				aFilters.push(new sap.ui.model.Filter(
					"Reqnr",
					sap.ui.model.FilterOperator.EQ,
					inpReqnr
				));
			}

			var cbReqtyp = this.getView().byId("cbReqtyp").getSelectedKey();
			if (cbReqtyp) {
				aFilters.push(new sap.ui.model.Filter(
					"Reqtyp",
					sap.ui.model.FilterOperator.EQ,
					cbReqtyp
				));
			}

			var mcbReqstat = this.getView().byId("mcbReqstat").getSelectedKeys();
			for (var i = 0; mcbReqstat.length > i; i++) {
				aFilters.push(new sap.ui.model.Filter(
					"Reqstat",
					sap.ui.model.FilterOperator.EQ,
					mcbReqstat[i]
				));
			}

			var mcbMtart = this.getView().byId("mcbMtart").getSelectedKeys();
			for (var i = 0; mcbMtart.length > i; i++) {
				aFilters.push(new sap.ui.model.Filter(
					"Mtart",
					sap.ui.model.FilterOperator.EQ,
					mcbMtart[i]
				));
			}

			var inpMatnr = this.getView().byId("inpMatnr").getValue();
			if (inpMatnr) {
				aFilters.push(new sap.ui.model.Filter(
					"Matnr",
					sap.ui.model.FilterOperator.EQ,
					inpMatnr
				));
			}

			// var cbGmpmat = this.getView().byId("cbGmpmat").getSelectedKey();
			// if (cbGmpmat) {
			// 	aFilters.push(new sap.ui.model.Filter(
			// 		"Gmpmat",
			// 		sap.ui.model.FilterOperator.EQ,
			// 		cbGmpmat
			// 	));
			// }

			var mcbWerks = this.getView().byId("mcbWerks").getSelectedKeys();
			for (var i = 0; mcbWerks.length > i; i++) {
				aFilters.push(new sap.ui.model.Filter(
					"Werks",
					sap.ui.model.FilterOperator.EQ,
					mcbWerks[i]
				));
			}

			// var chkAennr = this.getView().byId("chkAennr").getSelected();
			// if (chkAennr) {
			// 	aFilters.push(new sap.ui.model.Filter(
			// 		"Aennr",
			// 		sap.ui.model.FilterOperator.EQ,
			// 		"X"
			// 	));
			// }

			var inpCrtuser = this.getView().byId("inpCrtuser").getValue();
			if (inpCrtuser) {
				aFilters.push(new sap.ui.model.Filter(
					"Crtuser",
					sap.ui.model.FilterOperator.EQ,
					inpCrtuser
				));
			}

			return aFilters;

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

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}

	});
});