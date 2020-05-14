sap.ui.define(["./BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"./messages"
	],

	function (BaseController, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, messages) {
		"use strict";
		return BaseController.extend("ECR.ECR_Approval.controller.ECRLIST", {
			onInit: function () {
				var oModel = new JSONModel();
				this.setModel(oModel);
				this._JSONModel = this.getModel();
			},
			goback: function () {
				this._JSONModel.setProperty("/FiledEdit", {
					edit1: false
				});
				this.navTo("ECR_Submit");
			},
			handleSearch: function () {

			}

		});

	});