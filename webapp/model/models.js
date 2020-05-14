// sap.ui.define([
// 	"sap/ui/model/json/JSONModel",
// 	"sap/ui/Device"
// ], function (JSONModel, Device) {
// 	"use strict";

// 	return {

// 		createDeviceModel: function () {
// 			var oModel = new JSONModel(Device);
// 			oModel.setDefaultBindingMode("OneWay");
// 			return oModel;
// 		}

// 	};
// });
/* =========================================================== */
/* App MVC中 model 实现（App 模型）                            */
/* =========================================================== */
sap.ui.define(["sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/resource/ResourceModel"
], function (JSONModel, Device, ODataModel, ResourceModel) {
	"use strict";

	function extendMetadataUrlParameters(aUrlParametersToAdd, oMetadataUrlParams, sServiceUrl) {
		var oExtensionObject = {},
			oServiceUri = new URI(sServiceUrl);

		aUrlParametersToAdd.forEach(function (sUrlParam) {
			var sLanguage, oUrlParameters, sParameterValue;

			// for sap-language we check if the launchpad can provide it.
			if (sUrlParam === "sap-language") {

				var fnGetuser = jQuery.sap.getObject("sap.ushell.Container.getUser");
				if (fnGetuser) {
					// for sap-language we check if the launchpad can provide it.
					sLanguage = fnGetuser().getLanguage();
				}

				if (sLanguage) {
					oMetadataUrlParams["sap-language"] = sLanguage;
					return;
				}
				// Continue searching in the url
			}

			oUrlParameters = jQuery.sap.getUriParameters();
			sParameterValue = oUrlParameters.get(sUrlParam);
			if (sParameterValue) {
				oMetadataUrlParams[sUrlParam] = sParameterValue;
				oServiceUri.addSearch(sUrlParam, sParameterValue);
			}
		});

		jQuery.extend(oMetadataUrlParams, oExtensionObject);
		return oServiceUri.toString();
	}

	return {

		// 创建OData模型
		createODataModel: function (oOptions) {
			var aUrlParametersForEveryRequest, oConfig, sUrl;

			oOptions = oOptions || {};

			if (!oOptions.url) {
				jQuery.sap.log.error("Please provide a url when you want to create an ODataModel",
					"ZHAND_201803_TR_1001.model.models.createODataModel");
				return null;
			}

			// create a copied instance since we modify the
			// config
			oConfig = jQuery.extend(true, {}, oOptions.config);

			aUrlParametersForEveryRequest = oOptions.urlParametersForEveryRequest || [];
			oConfig.metadataUrlParams = oConfig.metadataUrlParams || {};

			sUrl = extendMetadataUrlParameters(aUrlParametersForEveryRequest, oConfig.metadataUrlParams, oOptions.url);

			return this._createODataModel(sUrl, oConfig);

		},

		// 创建OData模型
		_createODataModel: function (sUrl, oConfig) {
			return new ODataModel(sUrl, oConfig);
		},

		// 初始化本地数据集
		_initialLocalData: function () {

			var localData = {
				appProperties: {
					busy: false,
					shcode: ""
				},
				AccountEmail:{
					Mail:""
				},
				ECRData: {
					ECRNO: "", //ECR编号
					ECRSUBJECT: "", //主旨
					ORGANIZATION: "", //发起单位
					FORMDATE: new Date(), //填单日期
					DEPARTMENT: "", //部门
					MODELNO: "", //Model NO
					REQUESTER: "", //申请人
					LISER: "", //制表人
					CHANGEREASON: "", //变更原因
					ADVISE: "", //建议
					NOCHANGEIMPACT: "", //未变更导致影响
					MAINENGINEER: "", //主要工程师
					SECONDENGINEER: "" //次要工程师
				},
				ECNData: {
					COMPONENT: "", //組件料號
					PARTLOCATION: "", //零件位置
					ECNMATERIAL1: "", //ECN前料號
					ECNMATERIAL2: "", //ECN後料號
					QUANTITY1: "", //數量
					PROCESSINGWAY1: "", //處理方式
					MATERIAL: "", //料號
					WAREHOUSE: "", //倉別
					QUANTITY2: "", //數量
					PROCESSINGWAY2: "", //處理方式
					OINSTRUCTIONS: "" //其他說明
				},
				
				ECRLIST: []
			};
			return localData;
		},

		// 创建设备模型
		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		// 创建FLP模型
		createFLPModel: function () {
			var fnGetuser = jQuery.sap.getObject("sap.ushell.Container.getUser");
			var bIsShareInJamActive = fnGetuser ? fnGetuser().isJamActive() : false;
			var oModel = new JSONModel({
				isShareInJamActive: bIsShareInJamActive
			});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		// 创建本地模型
		createLocalModel: function () {
			var oModel = new JSONModel(this._initialLocalData());
			//oModel.setSizeLimit(9999);
			return oModel;
		},

		// 	创建资源模型
		createResourceModel: function (sRootPath, resourceBundle) {
			this._resourceModel = new ResourceModel({
				bundleUrl: [
					sRootPath,
					resourceBundle
				].join("/")
			});
			return this._resourceModel;
		}
	};

});