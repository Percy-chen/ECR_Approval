sap.ui.define(["sap/ui/base/Object", "sap/ui/Device", "./designMode", "./messages"], function (Object, Device,
	designMode, messages) {
	"use strict";

	return Object.extend("ECR.ECR_Approval.controller.searchHelp", {
		constructor: function (oParentView) {
			this._oParentView = oParentView;
			this._oViewModel = this._oParentView.getModel();
			this._Controller = oParentView.getController();
			this._ResourceBundle = this._oParentView.getModel("i18n").getResourceBundle();
			this._ODataModel = this._oParentView.getModel("OData");
		},

		openDialog: function () {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(this._oParentView.getId(), "ECR.ECR_Approval.view.searchHelp", this);
				designMode.syncStyleClass(this._oParentView, this._oDialog);
				this._oParentView.addDependent(this._oDialog);
			}
			this._oViewModel.setProperty("/appProperties/f4panel", false);
			this._oDialog.open();
		},
		handleConfirm: function (evt) {
			// this._oDialog.close();
			var searchHelpData = this._oViewModel.getProperty("/searchHelpData");
			var context = evt.getParameter("selectedContexts");
			var Ocontext = context[0].sPath.split("/");
			var n = Ocontext[2];
			var item = searchHelpData[n];
			var fcode = this._oViewModel.getProperty("/appProperties/fcode");
			switch (fcode) {
			case "WRITER": //填单人
				this._oViewModel.setProperty("/ECRData/WRITER", item.ACCOUNT);
				break;
			case "REQUESTER": //申请人
				this._oViewModel.setProperty("/ECRData/REQUESTER", item.ACCOUNT);
				this._oViewModel.setProperty("/ECRData/DEPARTMENT", item.DEPARTMENT);
				this._oViewModel.setProperty("/ECRData/ORGANIZATION", item.DEPARTMENT);
				break;
			case "MAINENGINEER": //主办工程师
				this._oViewModel.setProperty("/ECRData/MAINENGINEER", item.ACCOUNT);// + "-" + item.FULLNAME
				this._oViewModel.setProperty("/AccountEmail/Mail", item.EMAIL);// + "-" + item.FULLNAME
				break;
			}
			this._oViewModel.setProperty("/searchHelpData", []);
			this._oViewModel.setProperty("/appProperties/f4title", "");
		},

		handleClose: function () {
			// this._oDialog.close();
			this._oViewModel.setProperty("/searchHelpData", []);
			this._oViewModel.setProperty("/appProperties/f4title", "");
		},

		onPostSuccess: function (oController) {
			oController.getEventBus().publish("ECR.ECR_Approval", "postExecuted", oController);
		}
	});
});