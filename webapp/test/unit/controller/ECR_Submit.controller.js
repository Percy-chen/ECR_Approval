/*global QUnit*/

sap.ui.define([
	"ECR/ECR_Approval/controller/ECR_Submit.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ECR_Submit Controller");

	QUnit.test("I should test the ECR_Submit controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});