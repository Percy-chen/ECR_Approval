sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ECR/ECR_Approval/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/m/MessageToast"
], function (UIComponent, Device, models, JSONModel, MobileLibrary, MessageToast) {
	"use strict";

	return UIComponent.extend("ECR.ECR_Approval.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createLocalModel());
			this._JSONModel = this.getModel();
			this._JSONModel.setProperty("/FiledEdit", {
				edit1: true
			});
			this.setModel(new JSONModel({
				"maximumFilenameLength": 55,
				"maximumFileSize": 10,
				"mode": MobileLibrary.ListMode.SingleSelectMaster,
				"uploadEnabled": true,
				"uploadButtonVisible": true,
				"enableEdit": false,
				"enableDelete": true,
				"visibleEdit": false,
				"visibleDelete": true,
				"listSeparatorItems": [
					MobileLibrary.ListSeparators.All,
					MobileLibrary.ListSeparators.None
				],
				"showSeparators": MobileLibrary.ListSeparators.All,
				"listModeItems": [{
					"key": MobileLibrary.ListMode.SingleSelectMaster,
					"text": "Single"
				}, {
					"key": MobileLibrary.ListMode.MultiSelect,
					"text": "Multi"
				}],
				"busy": false,
				"submitEnabled": true
			}), "settings");

			var that = this;
			this.getModel("userAttributes").attachRequestCompleted(function (oEvent) {
				var userAttributes = this.getData();
				that._ODataModel = that.getModel("GetEMPLOYEES");
				var sPath = "/EMPLOYEES" + "('" + userAttributes.name + "')";
				var mParameters = {
					success: function (oData) {
						that._JSONModel.setProperty("/ECRData/ORGANIZATION", oData.DEPARTMENT); //发起单位
						that._JSONModel.setProperty("/ECRData/DEPARTMENT", oData.DEPARTMENT); //部门
						that._JSONModel.setProperty("/ECRData/WRITER", oData.ACCOUNT); //填表人
						that._JSONModel.setProperty("/ECRData/REQUESTER", oData.ACCOUNT); //申请人
						that._JSONModel.setProperty("/ECRData/STARTCOMPANY", oData.COMPANYCODE); //公司
					}.bind(that),
					error: function (oError) {
						if (oError.statusCode === "404") {
							MessageToast.show("请先维护用户信息！");
							return;
						} else {
							MessageToast.show(oError.statusText);
						}
					}.bind(that),
				};
				that._ODataModel.read(sPath, mParameters);
			});
		}
	});
});