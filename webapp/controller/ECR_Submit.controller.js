sap.ui.define(["./BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/UploadCollectionParameter",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"./messages",
		"./searchHelp",
		"sap/m/library",
		"sap/ui/comp/filterbar/FilterBar",
		"sap/ui/comp/filterbar/FilterGroupItem",
		"sap/m/Table",
		'sap/m/Token',
		"sap/ui/comp/valuehelpdialog/ValueHelpDialog",
		"sap/m/Input",
		"sap/m/MultiInput",
		"sap/m/Text",
		"sap/m/Label"
	],

	function (BaseController, JSONModel, Filter, FilterOperator, UploadCollectionParameter, MessageToast, MessageBox, messages, searchHelp,
		MobileLibrary, FilterBar, FilterGroupItem, mTable, Token, ValueHelpDialog, Input, MultiInput, Text, Label) {
		"use strict";
		return BaseController.extend("ECR.ECR_Approval.controller.ECR_Submit", {
			onInit: function () {
				// var oModel = new JSONModel();
				// this.setModel(oModel);
				this._JSONModel = this.getModel();
				// var today = new Date();
				// var year = today.getFullYear();
				// var month = today.getMonth() + 1;
				// var strDate = today.getDate();
				// if (month >= 1 && month <= 9) {
				// 	month = "0" + month;
				// }
				// if (strDate >= 0 && strDate <= 9) {
				// 	strDate = "0" + strDate;
				// }
				// today = year.toString() + month.toString() + strDate.toString();
				// var ECRData = this._JSONModel.getProperty("/ECRData");
				// ECRData.FORMDATE = today;
				// this._JSONModel.setProperty("/FiledEdit", {
				// 	edit1: true
				// });
				// this.getView().setModel(new JSONModel({
				// 	"maximumFilenameLength": 55,
				// 	"maximumFileSize": 10,
				// 	"mode": MobileLibrary.ListMode.SingleSelectMaster,
				// 	"uploadEnabled": true,
				// 	"uploadButtonVisible": true,
				// 	"enableEdit": false,
				// 	"enableDelete": true,
				// 	"visibleEdit": false,
				// 	"visibleDelete": true,
				// 	"listSeparatorItems": [
				// 		MobileLibrary.ListSeparators.All,
				// 		MobileLibrary.ListSeparators.None
				// 	],
				// 	"showSeparators": MobileLibrary.ListSeparators.All,
				// 	"listModeItems": [{
				// 		"key": MobileLibrary.ListMode.SingleSelectMaster,
				// 		"text": "Single"
				// 	}, {
				// 		"key": MobileLibrary.ListMode.MultiSelect,
				// 		"text": "Multi"
				// 	}],
				// 	"busy": false,
				// 	"submitEnabled": true
				// }), "settings");
				// this.getUserInfo();
			},
			getUserInfo: function () {
				this.setBusy(true);
				this._ODataModel = this.getModel("GetEMPLOYEES");
				var sPath = "/EMPLOYEES" + "('" + this._JSONModel.getProperty("/UserSet/name") + "')";
				var mParameters = {
					success: function (oData) {
						this._JSONModel.setProperty("/ECRData/ORGANIZATION", oData.DEPARTMENT); //发起单位
						this._JSONModel.setProperty("/ECRData/DEPARTMENT", oData.DEPARTMENT); //部门
						this._JSONModel.setProperty("/ECRData/WRITER", oData.FULLNAME); //填表人
						this._JSONModel.setProperty("/ECRData/REQUESTER", oData.FULLNAME); //申请人
						this._JSONModel.setProperty("/ECRData/STARTCOMPANY", oData.COMPANYCODE); //公司
						this.setBusy(false);
					}.bind(this),
					error: function (oError) {
						if (oError.statusCode === "404") {
							MessageToast.show("请先维护用户信息！");
							this.setBusy(false);
							return;
						} else {
							MessageToast.show(oError.statusText);
						}
						this.setBusy(false);
					}.bind(this),
				};
				this._ODataModel.read(sPath, mParameters);
			},
			openValuHelpDialog: function (oEvent) {
				var fcode = this.getfcode(oEvent);
				this.setfcode(fcode);
				switch (fcode) {
				case "WRITER":
					this._JSONModel.setProperty("/appProperties/f4title", "填表人");
					break;
				case "REQUESTER":
					this._JSONModel.setProperty("/appProperties/f4title", "申請人");
					break;
				case "MAINENGINEER":
					this._JSONModel.setProperty("/appProperties/f4title", "主辦工程師");
					break;
				}
				this._JSONModel.setProperty("/appProperties/fcode", fcode);
				this._ODataModel = this.getModel("GetEMPLOYEES");
				var aFilters = [];
				var oFilter1 = new sap.ui.model.Filter("DEPARTMENT", sap.ui.model.FilterOperator.Contains, "研");
				aFilters.push(oFilter1);
				var sUrl = "/EMPLOYEES";
				var mParameters = {
					filters: aFilters,
					success: function (oData, response) {
						if (response.statusCode === "200") {
							var Arry = !oData ? [] : oData.results;
							this._JSONModel.setProperty("/searchHelpData", Arry);
							this.openDialog(oEvent);
						}
						this.setBusy(false);
					}.bind(this),
					error: function (oError) {
						this.setBusy(false);
					}.bind(this)
				};
				this._ODataModel.read(sUrl, mParameters);
			},

			getfcode: function (oEvent) {
				var sButId = oEvent.getParameter("id");
				var aButId = sButId.split("-");
				var iLast = parseInt(aButId.length) - 1;
				var sOP = aButId[iLast].replace("button", "");
				sOP = sOP.replace("but", "");
				sOP = sOP.replace("bt", "");
				return sOP;
			},

			openDialog: function (oEvent) {
				if (!this._oSubControllerForPost) {
					this._oSubControllerForPost = new searchHelp(this.getView());
				}
				this._oSubControllerForPost.openDialog(oEvent);
			},
			onLess: function (oEvent) {
				var ECRLIST = this._JSONModel.getData().ECRLIST; //
				var ECRITEM = this.getView().byId("ECRITEM");
				var aSelectedIndices = [];
				var context = ECRITEM.getSelectedContexts();
				if (context.length <= 0) {
					sap.m.MessageBox.warning("请至少选择一行", {
						title: "提示"
					});
					this.setBusy(false);
					return;
				}
				if (context.length !== 0) {
					for (var i = 0; i < context.length; i++) {
						var linetext = context[i].sPath.split("/");
						var line = linetext[2];
						aSelectedIndices[i] = {
							Line: line
						};
					}
				}
				for (var y = aSelectedIndices.length - 1; y >= 0; y--) {
					ECRLIST.splice(aSelectedIndices[y].Line, 1);
				}
				var num = 10;
				for (var m = 0; m < ECRLIST.length; m++) {
					ECRLIST[m].ECRITEMNUM = num;
					num = num + 10;
				}
				this._JSONModel.setProperty("/ECRLIST", ECRLIST);
				ECRITEM.removeSelections(true);
				// item1.splice(n, 1);
			},
			//Add Data
			onAdd: function () {
				var ECRLIST = this._JSONModel.getData().ECRLIST;
				var item = [];
				if (ECRLIST.length === 0) {
					ECRLIST = [];
					item[0] = {
						ECRITEMNUM: 10,
						MATERIAL: "",
						WAREHOUSE1: "",
						QUANTITY1: "",
						INSTRUCTIONS1: "",
						WAREHOUSE2: "",
						INSTRUCTIONS2: "",
						OINSTRUCTIONS: ""
					};
				} else {
					var NUM = ECRLIST.length;
					item[0] = {
						ECRITEMNUM: ECRLIST[NUM - 1].ECRITEMNUM + 10,
						MATERIAL: "",
						WAREHOUSE1: "",
						QUANTITY1: "",
						INSTRUCTIONS1: "",
						WAREHOUSE2: "",
						INSTRUCTIONS2: "",
						OINSTRUCTIONS: ""
					};
				}
				ECRLIST.push(item[0]);
				this._JSONModel.setProperty("/ECRLIST", ECRLIST);
			},
			handleSave: function () {
				this.setBusy(true);
				var ECRData = this._JSONModel.getData().ECRData; //Header Data
				if (ECRData.ECRNO !== "") {
					MessageToast.show("單據已提交，請勿重復提交！");
					this.setBusy(false);
					return;
				}
				var ECRLIST = this._JSONModel.getData().ECRLIST; // Item Data
				if (ECRData.FORMDATE === "" || ECRData.ECRSUBJECT === "" || ECRData.MODELNO === "" || ECRData.WRITER === "" || ECRData.REQUESTER ===
					"") {
					sap.m.MessageBox.warning("ECR信息不完整，請檢查輸入(填單日期,ECR主旨,Part/Model,填表人,申請人)", {
						title: "提示"
					});
					this.setBusy(false);
					return;
				}
				if (ECRLIST.length !== 0) {
					for (var i = 0; i < ECRLIST.length; i++) {
						if (ECRLIST[i].MATERIAL === "") {
							MessageToast.show("請先輸入物料號！");
							this.setBusy(false);
							return;
						}
					}
				}
				// var token = this._fetchToken(); // Call local method to start the workflow instance     
				// this._startInstance(token, ECRData, ECRLIST);

				var that = this;
				// this.getModel("settings").setProperty("/busy", true);
				// this.checkBeforeSave().then(function (bTrue) {
				// 	// Step 1
				// 	// 新建Document Info Record
				// 	if (bTrue) {
				that.createDIR().then(function (oData) {
					// Step2
					//上传 Attachment
					that.uploadAttachment(oData);
					that.getModel("settings").setProperty("/busy", false);
					// 回写XSODATA 日志
					that.postToCFHana().then(function (oData1) {
						var ECRData = that._JSONModel.getData().ECRData; //Header Data
						var ECRLIST = that._JSONModel.getData().ECRLIST; // Item Data
						// 启动工作流
						var token = that._fetchToken();
						that._startInstance(token, ECRData, ECRLIST);
						that.setBusy(false);
					});

					// that.startWorkflow();

					//});
					// } else {
					// 	that.getModel("settings").setProperty("/busy", false);
					// }
				});

			},
			openValuHelpDialog1: function () {
				var that = this;
				var oSECONDENGINEER = this.getView().byId("SECONDENGINEER");
				var oSRColumnModel = new JSONModel();
				oSRColumnModel.setData({
					cols: [{
						label: "賬號",
						template: "ACCOUNT"
					}, {
						label: "姓名",
						template: "FULLNAME"
					}, {
						label: "公司",
						template: "COMPANYCODE"
					}, {
						label: "部門",
						template: "DEPARTMENT"
					}]
				});
				if (!this._oMTableSup) {
					this._oMTableSup = new mTable();
					this._oMTableSup.setModel(oSRColumnModel, "columns");
					this._oMTableSup.setModel(this.getModel("GetEMPLOYEES"));
				}

				this._oMTableSup.getModel().attachBatchRequestCompleted(function (oEvent) {
					that._oValueHelpDialogSup.setContentHeight("100%");
				});

				if (!this._oFilterBarSup) {
					var ACCOUNTMutiInput = new MultiInput({
						id: "ACCOUNT",
						showValueHelp: false
					});
					var FULLNAMEMutiInput = new MultiInput({
						id: "FULLNAME",
						showValueHelp: false
					});
					var COMPANYCODEMutiInput = new MultiInput({
						id: "COMPANYCODE",
						showValueHelp: false
					});
					var DEPARTMENTMutiInput = new MultiInput({
						id: "DEPARTMENT",
						showValueHelp: false
					});
					ACCOUNTMutiInput.addValidator(function (args) {
						var text = args.text;
						return new Token({
							key: text,
							text: text
						});
					});
					FULLNAMEMutiInput.addValidator(function (args) {
						var text = args.text;
						return new Token({
							key: text,
							text: text
						});
					});
					COMPANYCODEMutiInput.addValidator(function (args) {
						var text = args.text;
						return new Token({
							key: text,
							text: text
						});
					});
					DEPARTMENTMutiInput.addValidator(function (args) {
						var text = args.text;
						return new Token({
							key: text,
							text: text
						});
					});

					this._oFilterBarSup = new FilterBar({
						advancedMode: true,
						filterBarExpanded: true, //Device.system.phone,
						filterGroupItems: [
							new FilterGroupItem({
								groupTitle: "More Fields",
								groupName: "gn1",
								name: "ACCOUNTGroupItem",
								label: "賬號",
								control: ACCOUNTMutiInput,
								visibleInFilterBar: true
							}),
							new FilterGroupItem({
								groupTitle: "More Fields",
								groupName: "gn1",
								name: "FULLNAMEGroupItem",
								label: "姓名",
								control: FULLNAMEMutiInput,
								visibleInFilterBar: true
							}),
							new FilterGroupItem({
								groupTitle: "More Fields",
								groupName: "gn1",
								name: "COMPANYCODEGroupItem",
								label: "公司",
								control: COMPANYCODEMutiInput,
								visibleInFilterBar: true
							}),
							new FilterGroupItem({
								groupTitle: "More Fields",
								groupName: "gn1",
								name: "DEPARTMENTGroupItem",
								label: "部門",
								control: DEPARTMENTMutiInput,
								visibleInFilterBar: true
							})
						],
						search: function (oEvent) {
							var aSearchItems = oEvent.getParameters().selectionSet;
							var aFilters = [];
							var LastFilter = [];
							for (var i = 0; i < aSearchItems.length; i++) {
								if (aSearchItems[i].getTokens()) {
									var tokens = aSearchItems[i].getTokens();
									for (var j = 0; j < tokens.length; j++) {
										aFilters.push(new Filter({
											path: aSearchItems[i].getId(),
											operator: FilterOperator.Contains,
											value1: tokens[j].getKey()
										}));
									}
								}
							}
							aFilters.push(new Filter({
								path: "DEPARTMENT",
								operator: FilterOperator.Contains,
								value1: "研"
							}));
							if (aFilters.length > 0) {
								var aSelectFilter = new Filter({
									filters: aFilters,
									and: false
								});
								LastFilter.push(aSelectFilter);
							}
							that._oMTableSup.bindItems({
								path: "/EMPLOYEES",
								template: new sap.m.ColumnListItem({
									cells: [
										new Text({
											text: "{ACCOUNT}"
										}),
										new Text({
											text: "{FULLNAME}"
										}),
										new Text({
											text: "{COMPANYCODE}"
										}),
										new Text({
											text: "{DEPARTMENT}"
										})
									]
								}),
								filters: LastFilter
							});

						},
						clear: function (oEvent) {}
					});
				}

				var that = this;
				if (!this._oValueHelpDialogSup) {
					this._oValueHelpDialogSup = new ValueHelpDialog("idValueHelpSup", {
						supportRanges: true,
						supportMultiselect: true,
						// filterMode: true,
						key: "ACCOUNT",
						descriptionKey: "FULLNAME",
						title: "協辦工程師",
						ok: function (oEvent) {
							oSECONDENGINEER.setTokens(oEvent.getParameter("tokens"));
							var tokens = oEvent.getParameter("tokens");
							var EMPLOYEES = [];
							for (var i = 0; i < tokens.length; i++) {
								EMPLOYEES.push({
									key: tokens[i].getKey(),
									text: tokens[i].getText()
								});
							}
							that._JSONModel.setProperty("/ECRData/EMPLOYEES", EMPLOYEES);
							this.close();
						},
						cancel: function () {
							this.close();
							this.destroy();
						}
					});
				}
				this._oValueHelpDialogSup.setRangeKeyFields([{
					label: "賬號",
					key: "ACCOUNT"
				}, {
					label: "姓名",
					key: "FULLName"
				}]);
				this._oValueHelpDialogSup.setTable(this._oMTableSup);
				this._oValueHelpDialogSup.setFilterBar(this._oFilterBarSup);
				this._oValueHelpDialogSup.open();
				this._oValueHelpDialogSup.setRangeKeyFields([{
					label: "賬號",
					key: "ACCOUNT"
				}]);
				// this._oValueHelpDialog.setBusy(true);

			},
			createDIR: function () {
				var oDeferred = new jQuery.Deferred();
				// var that = this;
				var DIRCreate = {
					"DocumentInfoRecordDocType": "YBO",
					"DocumentInfoRecordDocVersion": "01",
					"DocumentInfoRecordDocPart": "000",
					"to_DocDesc": {
						"results": [{
							"Language": "ZH",
							"DocumentDescription": "123"
						}, {
							"Language": "EN",
							"DocumentDescription": "123"
						}, {
							"Language": "ZF",
							"DocumentDescription": "123"
						}]
					}
				};
				var mParameters = {
					success: function (oData) {
						// that.getRouter().navTo("detail", {
						// 	DocumentInfoRecordDocType: oData.DocumentInfoRecordDocType,
						// 	DocumentInfoRecordDocNumber: oData.DocumentInfoRecordDocNumber,
						// 	DocumentInfoRecordDocVersion: oData.DocumentInfoRecordDocVersion,
						// 	DocumentInfoRecordDocPart: oData.DocumentInfoRecordDocPart
						// });
						oDeferred.resolve(oData);

					},
					error: function (oError) {
						// Message
						MessageToast.show("存储附件错误");
						return;
					}
				};
				this.getModel("DIR").create("/A_DocumentInfoRecord", DIRCreate, mParameters);
				return oDeferred.promise();

			},
			uploadAttachment: function (oData) {
				this.getModel().setProperty("/DocumentInfoRecord", oData);
				// 上传附件
				var oUploadCollection = this.byId("UploadCollectionAttach");
				oUploadCollection.upload();

				// 绑定Upload Collection的OData URL
				var path = "Attach>/A_DocumentInfoRecordAttch(DocumentInfoRecordDocType='" + oData.DocumentInfoRecordDocType +
					"',DocumentInfoRecordDocNumber='" + oData.DocumentInfoRecordDocNumber + "',DocumentInfoRecordDocVersion='" +
					oData.DocumentInfoRecordDocVersion + "',DocumentInfoRecordDocPart='" + oData.DocumentInfoRecordDocPart + "')";

				oUploadCollection.bindElement(path);
			},
			onChange: function (oEvent) {
				this.getModel().setProperty("/AttachUploaded", "true");
			},
			onBeforeUploadStarts: function (oEvent) {
				// 设置提交附件的参数
				var oCustomerHeaderSlug = new UploadCollectionParameter({
					name: "Slug",
					value: encodeURIComponent(oEvent.getParameter("fileName"))
				});
				oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

				var oBusinessObjectTypeName = new UploadCollectionParameter({
					name: "BusinessObjectTypeName",
					value: "DRAW"
				});
				oEvent.getParameters().addHeaderParameter(oBusinessObjectTypeName);

				var oLinkedSAPObjectKey = new UploadCollectionParameter({
					name: "LinkedSAPObjectKey",
					value: this.getModel().getProperty("/DocumentInfoRecord").DocumentInfoRecord
				});
				oEvent.getParameters().addHeaderParameter(oLinkedSAPObjectKey);

				var xCsrfToken = this.getModel("Attach").getSecurityToken();
				var oxsrfToken = new UploadCollectionParameter({
					name: "x-csrf-token",
					value: xCsrfToken
				});
				oEvent.getParameters().addHeaderParameter(oxsrfToken);
			},

			onUploadComplete: function (oEvent) {
				this.getModel("Attach").refresh();
			},
			getMediaUrl: function (sUrl) {
				// if (oContext.getProperty("media_src")) {
				// 	return oContext.getProperty("media_src");
				// } else {
				// 	return "null";
				// }
				if (sUrl) {
					var url = new URL(sUrl);
					var start = url.href.indexOf(url.origin);
					// var sPath = url.href.substring(start, start + url.origin.length);
					var sPath = url.href.substring(start + url.origin.length, url.href.length);
					return sPath.replace("/sap/opu/odata/sap", "/destinations/WT_S4HC");

				} else {
					return "";
				}

			},
			postToCFHana: function () {
				var that = this;
				var promise = new Promise(function (resolve, reject) {
					that.createECRHeader(that).then(function (oData) {
						that.batchCreateECRItem(oData);
						that.getModel().setProperty("/ECRData/ECRNO", oData.ECRNO);
						resolve(oData);
					});
				});
				return promise;
			},
			createECRHeader: function (oController) {
				var Header = oController._JSONModel.getData().ECRData; //Header Data
				var sSECONDENGINEER = Header.EMPLOYEES;
				var LONGTEXT = "";
				if (sSECONDENGINEER !== undefined) {
					for (var i = 0; i < sSECONDENGINEER.length; i++) {
						LONGTEXT = LONGTEXT + sSECONDENGINEER[i].text + ';';
					}
				}
				var promise = new Promise(function (resolve, reject) {
					oController.GetSequence(oController).then(function (oSequence) {
						var ECRHeader = {
							ECRNO: oSequence,
							ECRSUBJECT: Header.ECRSUBJECT,
							ORGANIZATION: Header.ORGANIZATION,
							FORMDATE: Header.FORMDATE,
							DEPARTMENT: Header.DEPARTMENT,
							WRITER: Header.WRITER,
							REQUESTER: Header.REQUESTER,
							MODELNO: Header.MODELNO,
							MAINENGINEER: Header.MAINENGINEER,
							CHANGEREASON: Header.CHANGEREASON,
							ADVISE: Header.ADVISE,
							NOCHANGEIMPACT: Header.NOCHANGEIMPACT,
							SECONDENGINEER: LONGTEXT
						};
						var mParameter = {
							success: function (oData) {
								resolve(oData);
							},
							error: function (oError) {
								reject(oError);
							}
						};
						oController.getModel("ECR").create("/ECRHeader", ECRHeader, mParameter);

					});
				});
				return promise;
			},
			batchCreateECRItem: function (headerOData) {
				var item = this.getModel().getData().ECRLIST;
				var mParameters = {
					groupId: "ECRItems"
				};

				for (var i = 0; i < item.length; i++) {
					var ECRList = {
						ECRNO: headerOData.ECRNO,
						ECRITEMNUM: item[i].ECRITEMNUM,
						MATERIAL: item[i].MATERIAL,
						WAREHOUSE1: item[i].WAREHOUSE1,
						QUANTITY1: item[i].QUANTITY1,
						INSTRUCTIONS1: item[i].INSTRUCTIONS1,
						WAREHOUSE2: item[i].WAREHOUSE2,
						QUANTITY2: item[i].QUANTITY2,
						INSTRUCTIONS2: item[i].INSTRUCTIONS2,
						OINSTRUCTIONS: item[i].OINSTRUCTIONS
					};
					this.getModel("ECR").create("/ECRItem", ECRList, mParameters);
				}

			},
			_fetchToken: function () {
				var token;
				$.ajax({
					url: "/bpmworkflowruntime/rest/v1/xsrf-token",
					method: "GET",
					async: false,
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					success: function (result, xhr, data) {
						token = data.getResponseHeader("X-CSRF-Token");
					}
				});
				return token;
			},
			_startInstance: function (token, Head, Item) {
				var that = this;
				var oContext = {
					ECRNO: Head.ECRNO,
					STARTCOMPANY: Head.STARTCOMPANY,
					ECRSUBJECT: Head.ECRSUBJECT,
					ORGANIZATION: Head.ORGANIZATION,
					FORMDATE: Head.FORMDATE,
					DEPARTMENT: Head.DEPARTMENT,
					WRITER: Head.WRITER,
					REQUESTER: Head.REQUESTER,
					MODELNO: Head.MODELNO,
					MAINENGINEER: Head.MAINENGINEER,
					CHANGEREASON: Head.CHANGEREASON,
					ADVISE: Head.ADVISE,
					NOCHANGEIMPACT: Head.NOCHANGEIMPACT,
					SECONDENGINEER: Head.EMPLOYEES,
					ECRLIST: Item,
					DocumentInfoRecord: that.getModel().getProperty("/DocumentInfoRecord"),
				};
				$.ajax({
					url: "/bpmworkflowruntime/rest/v1/workflow-instances",
					method: "POST",
					async: false,
					contentType: "application/json",
					headers: {
						"X-CSRF-Token": token
					},
					data: JSON.stringify({
						definitionId: "workflow_ecr",
						context: oContext
					}),
					success: function (result, xhr, data) {
						MessageToast.show("工作流程已成功启动");
						that.saveHeadLog(result);
					},
					error: function (result, xhr, data) {
						MessageToast.show("工作流程启动失败");
					}
				});
			},
			GetSequence: function (oController) {
				var appType = "ECR";
				var promise = new Promise(function (resolve, reject) {
					$.ajax({
						url: "/destinations/Print/ws/data/order-no" + "?code=" + appType,
						method: "GET",
						async: false,
						success: function (data) {
							resolve(data);
						},
						error: function (xhr, textStatus, errorText) {
							reject(Error(errorText));
						}
					});
				});
				return promise;
				// var appType = "ECR";
				// var promise = new Promise(function (resolve, reject) {
				// 	$.ajax({
				// 		url: "/destinations/APLEXHANA/xsjs/Sequence.xsjs" + "?DocType=" + appType,
				// 		method: "GET",
				// 		contentType: "application/json",
				// 		dataType: "json",
				// 		success: function (result, xhr, data) {
				// 			// resolve with the process context as result
				// 			resolve(data.responseJSON);
				// 		},
				// 		error: function (xhr, textStatus, errorText) {
				// 			reject(Error(errorText));
				// 		}
				// 	});
				// });
				// return promise;

			},
			handleSearch: function () {
				this.navTo("ECRLIST");
			},
			saveHeadLog: function (WORKFLOWID) {
				var ECRData = this._JSONModel.getData().ECRData; //Header Data
				var loghead = {
					STARTCOMPANY: ECRData.STARTCOMPANY,
					FLOWID: "workflow_ecr",
					INSTANCEID: WORKFLOWID.id,
					DOCUMENT: ECRData.ECRNO,
					REQUESTER: ECRData.REQUESTER,
					STATUS: ""
				};
				this.getModel("WORKFLOWLOG").create("/WORKFLOWHEAD", loghead);
			},
			handleSendata: function () {
				var language = sap.ui.getCore().getConfiguration().getLanguage();
				switch (language) {
				case "zh-Hant":
				case "zh-TW":
					language = "zh_CN_F";
					break;
				case "zh-Hans":
				case "zh-CN":
					language = "zh_CN";
					break;
				case "EN":
				case "en":
					language = "en_GB";
					break;
				default:
					break;
				}
				var url = "/destinations/Print/ws/data/print/ecr";
				var ECRData = this._JSONModel.getData().ECRData;
				if (ECRData.ECRNO === "") {
					MessageToast.show("请先保存数据！");
					return;
				}
				var sSECONDENGINEER = ECRData.EMPLOYEES;
				var LONGTEXT = "";
				if (sSECONDENGINEER !== undefined) {
					for (var i = 0; i < sSECONDENGINEER.length; i++) {
						LONGTEXT = LONGTEXT + sSECONDENGINEER[i].text + ';';
					}
				}
				var ECRLIST = this._JSONModel.getData().ECRLIST;
				var ECRitem = [];
				for (var i = 0; i < ECRLIST.length; i++) {
					ECRitem[i] = {
						"ecrno": ECRData.ECRNO,
						"ecritemnum": ECRLIST[i].ECRITEMNUM,
						"material": ECRLIST[i].MATERIAL,
						"warehouse1": ECRLIST[i].WAREHOUSE1,
						"quantity1": ECRLIST[i].QUANTITY1,
						"instructions1": ECRLIST[i].INSTRUCTIONS1,
						"oinstructions": ECRLIST[i].OINSTRUCTIONS,
						"warehouse2": ECRLIST[i].WAREHOUSE2,
						"quantity2": ECRLIST[i].QUANTITY2,
						"instructions2": ECRLIST[i].INSTRUCTIONS2
					};
				}
				var param = {
					"ecrno": ECRData.ECRNO,
					"ecrsubject": ECRData.ECRSUBJECT,
					"organization": ECRData.ORGANIZATION,
					"formdate": ECRData.FORMDATE,
					"department": ECRData.DEPARTMENT,
					"modelno": ECRData.MODELNO,
					"writer": ECRData.WRITER,
					"requester": ECRData.REQUESTER,
					"changereason": ECRData.CHANGEREASON,
					"advise": ECRData.ADVISE,
					"nochangeimpact": ECRData.NOCHANGEIMPACT,
					"mainengineer": ECRData.MAINENGINEER,
					"secondengineer": LONGTEXT,
					"items": ECRitem
				};
				var xhr = new XMLHttpRequest();
				xhr.responseType = "blob";
				xhr.open("POST", url, true);
				xhr.setRequestHeader("content-Type", "application/json");
				xhr.setRequestHeader("accept-language", language);
				// var that = this;
				xhr.onload = function (e) {
					var sUrl = window.URL.createObjectURL(this.response);
					var link = document.createElement("a");
					link.style.display = "none";
					link.href = sUrl;
					link.target = "_blank";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				};
				xhr.send(JSON.stringify(param));
			}
		});
	});