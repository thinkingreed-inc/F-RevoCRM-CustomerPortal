/*+***********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 *************************************************************************************/

function Portal_IndexView_Component($scope, $api, $webapp, sharedModalService, $translatePartialLoader, $modal, $http) {
	var url = purl();
	$scope.module = url.param('module');
	$scope.pageInitialized = false;

	$scope.searchQ = {
		onlymine: true
	}
	$scope.pageNo = 0;
	$scope.headers = null;
	$scope.records = null;
	$scope.extheaders = null;
	$scope.extrecords = null;
	$scope.currentPage = 1;
	$scope.pageSize = 10;
	$scope.isCreatable = false;
	$scope.isEditable = false;
	$scope.exportEnabled = false;
	var availableModules = JSON.parse(localStorage.getItem('modules'));
	var currentModule = $scope.module;
	var allowedModules = ['HelpDesk', 'Documents'];
	if (currentModule !== undefined) {
		var ptitleLabel = availableModules[ currentModule ].uiLabel;
		$scope.ptitle = ptitleLabel;
		//set creatable true
		if (allowedModules.indexOf(currentModule) >= 0) {
			$scope.isCreatable = availableModules[ currentModule ].create;
		}
		$scope.filterPermissions = availableModules[currentModule].recordvisibility;
	}

	if ($translatePartialLoader !== undefined) {
		$translatePartialLoader.addPart('home');
		$translatePartialLoader.addPart($scope.module);
	}


	$scope.$watch('searchQ.onlymine', function (nvalue, ovalue) {
		if (nvalue != ovalue) {
			$scope.loadRecords($scope.pageNo);
			$scope.currentPage = 1;
		}
	});
	if ($scope.module !== 'HelpDesk') {
		localStorage.removeItem('currentStatus');
	}
	setTimeout(function () {
		$webapp.busy();
		if ($scope.module !== undefined)
			$scope.loadRecords();
	}, 500);

	$scope.loadRecords = function (pageNo) {
		var params = {};
		$webapp.busy(false);
		$scope.itemsPerPage = 10;
		if ($scope.module !== undefined)
			var label = availableModules[ $scope.module ].label;
		if ($scope.searchQ.onlymine) {
			$scope.searchQ.mode = 'mine';
		} else {
			$scope.searchQ.mode = 'all';
		}
		if ($scope.sortParams === undefined) {
			params = {
				'mode': $scope.searchQ.mode,
				'page': pageNo
			}
		} else if ($scope.sortParams !== undefined) {
			params = $scope.sortParams;
		}
		$api.get($scope.module+'/FetchRecords', {
			label: label,
			q: params
		}).success(function (result) {
			$webapp.busy(false);
			$scope.pageInitialized = true;

			if (result.count === undefined && $scope.module !== undefined && $scope.module !== 'HelpDesk') {
				alert(result.message);
				window.location.href = "index.php?view=Logout";
			}
			$scope.headers = result.headers;
			$scope.records = result.records;
			$scope.edits = result.editLabels;
			$scope.totalPages = result.count;
		});
	}

	$scope.ChangeLocation = function (record) {
		var url = "index.php?module="+$scope.module+"&view=Detail&id="+record.id;
		window.location = url;
	}

	$scope.hoverIn = function () {
		$scope.hoverEdit = true;
	};

	$scope.hoverOut = function () {
		$scope.hoverEdit = false;
	};


	$scope.downloadFile = function (recordId) {
		window.location.href = 'index.php?module='+$scope.module+'&api=DownloadFile&recordId='+recordId;
	};
	$scope.setSortOrder = function (header) {
		var order = 'ASC';
		if (header == $scope.OrderBy) {
			$scope.reverse = !$scope.reverse;
		}
		if ($scope.reverse && $scope.OrderBy !== undefined) {
			order = 'DESC';
		}
		$scope.OrderBy = header;
		var params = {
			'page': $scope.currentPage - 1,
			'mode': $scope.searchQ.mode,
			'order': order,
			'orderBy': $scope.edits[ header ]
		}
		if ($scope.loadPage !== undefined) {
			params.page = $scope.loadPage;
		}
		$scope.sortParams = params;
		$scope.loadRecords();
	}

	$scope.pageChanged = function (pageNo) {
		$scope.loadPage = pageNo - 1;
		if ($scope.sortParams !== undefined) {
			$scope.sortParams.page = pageNo - 1;
			$scope.loadRecords();
		} else {
			$scope.loadRecords(pageNo - 1);
		}
	}

	//Generic craete record Modal.
	$scope.createRecord = function (module) {
		var modalInstance = $modal.open({
			templateUrl: "createRecordModal.template",
			controller: Portal_CreateView_Component,
			backdrop: "static",
			size: "lg",
			resolve: {
				module: function () {
					return $scope.module;
				},
				api: function () {
					return $api;
				},
				webapp: function () {
					return $webapp;
				},
				language: function () {
					return $scope.$parent.language
				},
				editStatus: function () {
					return false;
				}
			}
		});
	}

	$scope.checkRecordsVisibility = function (filterValue) {
		var returnValue;
		switch (filterValue) {
			case "1":
				returnValue = true;
				break;
			case "0":
				returnValue = false;
				break;
			case "2":
				returnValue = false;
				break;
			default:
				returnValue = false;
		}
		return returnValue;
	}
}

function Portal_DetailView_Component($scope, $api, $webapp, $translatePartialLoader, $modal) {
	var url = purl();
	$scope.module = url.param('module');
	$scope.id = url.param('id');
	$scope.pageInitialized = false;
	$scope.splitContentView = false;

	$scope.record = null;
	$scope.blocks = [];
	$scope.fields = [];

	$scope.isEditable = false;
	$scope.isCommentCreateable = true;
	$scope.updatesEnabled = false;
	$scope.commentsEnabled = false;
	$scope.comments = [];
	$scope.newcomment = {};

	var parentModules = {
		"ProjectTask": "Project",
		"ProjectMilestone": "Project"
	};
	var availableModules = JSON.parse(localStorage.getItem('modules'));
	$scope.ptitle = availableModules[ $scope.module ].uiLabel;
	// Checks and logic added to provide bread crumb navigation.
	if (parentModules.hasOwnProperty($scope.module)) {
		$scope.ptitle = availableModules[ parentModules[ $scope.module ] ].uiLabel;
		$scope.childModuleUiLabel = availableModules[ $scope.module ].uiLabel;
	}

	//Set editable true
	$scope.isEditable = availableModules[ $scope.module ].edit;


	$scope.updates = [];
	if ($translatePartialLoader !== undefined) {
		$translatePartialLoader.addPart('home');
		$translatePartialLoader.addPart($scope.module);
	}

	if ($scope.module !== 'HelpDesk') {
		localStorage.removeItem('currentStatus');
	}

	setTimeout(function () {
		$scope.loadRecord();
	}, 300);

	$scope.loadRecord = function () {
		var language = $scope.$parent.language;
		$api.get($scope.module+'/FetchRelatedModules').success(function (modules) {
			var relatedModules = modules;
			angular.forEach(relatedModules, function (relModule, i) {
				if (relModule.name === 'History') {
					$scope.updatesEnabled = (relModule.value === 1) ? true : false;
					relatedModules[ i ].uiLabel = 'History';
				}
				if (relModule.name === 'ModComments') {
					$scope.commentsEnabled = (relModule.value === 1) ? true : false;
					relatedModules[ i ].uiLabel = 'ModComments';
				}
				if (relModule.name === 'ProjectTask') {
					$scope.projectTaskEnabled = (relModule.value === 1) ? true : false;
					relatedModules[ i ].uiLabel = availableModules.ProjectTask.uiLabel;
				}
				if (relModule.name === 'ProjectMilestone') {
					$scope.projectMilestoneEnabled = (relModule.value === 1) ? true : false;
					relatedModules[ i ].uiLabel = availableModules.ProjectMilestone.uiLabel;
				}
				if (relModule.name === 'Documents') {
					$scope.documentsEnabled = (relModule.value === 1) ? true : false;

					relatedModules[ i ].uiLabel = availableModules.Documents.uiLabel;
				}
			});
			$scope.relatedModules = relatedModules;
			if ($scope.updatesEnabled || $scope.commentsEnabled || $scope.projectTaskEnabled || $scope.projectMilestoneEnabled) {
				$scope.splitContentView = true;
			}
		});

		$webapp.busy();
		$scope.parentId = url.param('parentId');
		$api.get($scope.module+'/FetchRecord', {
			id: $scope.id,
			parentId: $scope.parentId,
			language: language
		}).success(function (result) {
			$webapp.busy(false);
			if (result.record === undefined && result.message !== undefined) {
				if (result.message === 'Record not Accessible') {
					alert("Record is not accessible.");
					var moduleLabel = $scope.module;
					if ($scope.module === 'ProjectTask' || $scope.module === 'ProjectMilestone')
						moduleLabel = 'Project'
					window.location.href = "index.php?module="+moduleLabel;
				} else if (result.message === 'Contacts module is disabled') {
					alert("Contacts module has been disabled.")
					window.location.href = "index.php?view=Logout";
				}
			}
			$scope.pageInitialized = true;
			$scope.header = result.record.identifierName.label;
			$scope.record = result.record;
			$scope.edits = result.editLabels;
			$scope.documentExists = true;
			if (result[ $scope.module ] !== undefined) {
				$scope.record.referenceFields = result[ $scope.module ].referenceFields;
			}
			if ($scope.module === 'HelpDesk') {
				$scope.HelpDeskStatus = result.HelpDesk.status;
				$scope.HelpDeskCloseLabel = result.HelpDesk.closeLabel;
				$scope.HelpDeskIsStatusEditable = result.HelpDesk.isStatusEditable;
				if (result.HelpDesk.referenceFields !== undefined)
					$scope.record.referenceFields = result.HelpDesk.referenceFields;
			}
			//Adding quote accept ability
			if ($scope.module === 'Quotes') {
				$scope.quoteStage = result.Quotes.stage;
				$scope.quoteAcceptLabel = result.Quotes.acceptLabel;
				$scope.$watch('quoteStage', function (nvalue, ovalue) {
					$scope.quoteAccepted = false;
					if (nvalue != ovalue) {
						if (nvalue.toUpperCase() != 'ACCEPTED') {
							$scope.quoteAccepted = true;
						}
					} else if (ovalue.toUpperCase() != 'ACCEPTED') {
						$scope.quoteAccepted = true;
					}
				});
			}
			if ($scope.module === 'Documents') {
				$scope.documentExists = result.record.documentExists;
			}
			if ($scope.commentsEnabled) {
				$scope.loadComments();
			}
			if ($scope.updatesEnabled) {
				$scope.loadUpdates();
			}
			if ($scope.projectTaskEnabled) {
				$scope.loadProjectTasks();
			}
			if ($scope.projectMilestoneEnabled) {
				$scope.loadProjectMilestones();
			}
			if ($scope.documentsEnabled) {
				$scope.loadDocuments();
			}
		});
	}

	$scope.selectedTab = function (selected) {
		$scope.selection = selected;
	}

	$scope.loadComments = function (pageNo) {
		$scope.commentsLoaded = false;
		$scope.noComments = false;
		if (pageNo === undefined)
			$scope.commentPageNo = 0;
		else
			$scope.commentPageNo = pageNo

		$scope.parentId = url.param('parentId');
		var params = {
			'relatedModule': 'ModComments',
			'id': $scope.id,
			'parentId': $scope.parentId,
			'page': $scope.commentPageNo
		}
		$api.get($scope.module+'/FetchRelatedRecords', params).success(function (comments) {
			var comments = comments.comments;
			if (comments === null) {
				$scope.noComments = true;
				$scope.commentsLoaded = false;
			}
			if (comments !== null)
				var commentCount = comments.length;
			var commentList = [];
			if ($scope.commentPageNo == 0) {
				angular.forEach(comments, function (comment) {
					commentList.push(comment);
				});
				var scopeComments = angular.copy(commentList);
				$scope.comments = scopeComments;
				if (commentCount < 10) {
					$scope.commentsLoaded = true;
				}
			} else {
				if (comments === null)
					$scope.commentsLoaded = true;
				var newCommentList = [];
				angular.forEach(comments, function (comment) {
					if (angular.isObject(comment))
						$scope.comments.push(comment);
				});
				if (commentCount < 10) {
					$scope.commentsLoaded = true;
				}
			}
		});
	}


	$scope.addComment = function (validity) {
		$scope.parentId = url.param('parentId') !== undefined ? url.param('parentId') : '';
		$scope.newcomment.parentId = $scope.parentId;
		$scope.comments = $scope.comments || {};
		$scope.newcomment.related_to = $scope.id;
		if (validity) {
			$scope.commentValidate = false;
			$scope.savingComment = true;
			$webapp.busy();
			$api.post('ModComments/AddComment', {comment: $scope.newcomment}).success(function (comment) {
				$webapp.busy(false);
				if ($scope.comments !== null) {
					$scope.comments = $scope.comments || [];
					$scope.loadComments($scope.commentsPageNo)
					$scope.comments.unshift(comment);
				} else {
					$scope.comments.push(comment);
				}
				$scope.savingComment = false;
				$scope.newcomment = {};
			});
		} else {
			$scope.commentValidate = true;
			return false;
		}
	};

	$scope.loadUpdates = function (pageNo, createdStatus) {
		var language = $scope.$parent.language;
		if ($scope.module == 'ProjectTask' || $scope.module == 'ProjectMilestone') {
			var parentId = $scope.parentId;
		}
		if (pageNo === undefined) {
			$scope.historyPageNo = 0;
		} else {
			$scope.historyPageNo = pageNo
		}
		$api.get($scope.module+'/FetchHistory', {
			id: $scope.id,
			page: $scope.historyPageNo,
			language: language,
			parentId: parentId
		}).success(function (updates) {
			$webapp.busy(false);
			$scope.updatesLoaded = false;
			if (createdStatus === undefined) {
				$scope.created = true;
				$scope.noUpdates = false;
			}
			var recordUpdates = updates.records;
			if (recordUpdates === undefined) {
				$scope.noUpdates = true;
				$scope.updatesLoaded = false;
			}
			if (updates.records !== undefined)
				$scope.updateCount = recordUpdates.count;
			if (recordUpdates !== null) {
				if ($scope.historyPageNo == 0) {
					var updateList = [];
					angular.forEach(recordUpdates, function (recUpdate) {
						if (recUpdate.created === undefined) {
							$scope.createdUndefined = true;
							updateList.push(recUpdate);
						} else if (recUpdate.created !== undefined && $scope.created) {
							if ($scope.created) {
								updateList.push(recUpdate)
								$scope.created = false;
								$scope.noUpdates = false;
							}
						}
					});
					$scope.updates = angular.copy(updateList);
				} else {
					if (recordUpdates === undefined)
						$scope.updatesLoaded = true;
					angular.forEach(recordUpdates, function (update) {
						if (angular.isObject(update)) {
							if (update.created === undefined) {
								$scope.updates.push(update);
							} else if (update.created !== undefined && $scope.created) {
								$scope.updates.push(update);
								$scope.created = false;
								$scope.updatesLoaded = true;
							}
						}
					});
				}
			} else
				$scope.updates = '';
		});
	};

	$scope.loadDocuments = function (pageNo) {
		if (pageNo === undefined) {
			$scope.documentsPageNo = 0;
		} else {
			$scope.documentsPageNo = pageNo
		}
		var params = {
			'relatedModule': 'Documents',
			'id': $scope.id,
			'relatedModuleLabel': 'Documents',
			'page': $scope.documentsPageNo
		}
		$api.get($scope.module+'/FetchRelatedRecords', params).success(function (result) {
			// $webapp.busy(false);
			$scope.documentsLoaded = false;
			$scope.noDocuments = false;
			var documentsCount = result.records.length;
			if (documentsCount === 0) {
				$scope.noDcouments = true;
				$scope.documentsLoaded = false;
			}
			if ($scope.documentsPageNo === 0) {
				$scope.documentsrecords = result.records;
				$scope.documentsheaders = result.headers;
				if (documentsCount < 10) {
					$scope.documentsLoaded = true;
				}
			} else {
				if (documentsCount === 0)
					$scope.documentsLoaded = true;
				var documentsRecords = angular.copy(result.records)
				angular.forEach(documentsRecords, function (documentRecord) {
					$scope.documentsrecords.push(documentRecord)
				});
				if (documentsCount < 10) {
					$scope.documentsLoaded = true;
				}
			}
		});
	}

	$scope.downloadFile = function (module, recordId, parentId) {
		if (parentId === undefined) {
			parentId = $scope.parentId;
			window.location.href = 'index.php?module='+module+'&api=DownloadFile&recordId='+recordId;
		} else {
			window.location.href = 'index.php?module='+module+'&api=DownloadFile&recordId='+recordId+"&parentId="+parentId;
		}
	};

	$scope.downloadCommentFile = function (module, commentId, attachmentId) {
		window.location.href = 'index.php?module='+module+'&api=DownloadFile&recordId='+commentId+"&attachmentId="+attachmentId;
	};

	$scope.isLanguage = function (val) {
		if (angular.isObject(val))
			return true;
		else
			return false;
	};

	$scope.loadHistoryPage = function (pageNo) {
		$scope.loadUpdates(pageNo+1, $scope.created);
		$webapp.busy(false);
	}

	$scope.loadCommentsPage = function (pageNo) {
		$scope.loadComments(pageNo+1);
		$webapp.busy(false);
	}

	$scope.loadDocumentsPage = function (pageNo) {
		$scope.loadDocuments(pageNo+1);
		$webapp.busy(false);
	}

	$scope.ChangeLocation = function (module, id) {
		var url = "index.php?module="+module+"&view=Detail&id="+id+"&parentId="+$scope.id;
		window.location.href = url;
	}
	//Bread crumb navigation method.
	$scope.navigateBack = function (module) {

		var parentModules = {
			"ProjectMilestone": "Project",
			"ProjectTask": "Project"
		};
		var url = "index.php?module="+module;
		if (parentModules.hasOwnProperty(module)) {
			module = parentModules[ module ];
			url = "index.php?module="+module+"&view=Detail&id="+$scope.parentId;
		}
		window.location.href = url;
	}

	//Generic edit record.

	$scope.editRecord = function (module, id) {
		var modalInstance = $modal.open({
			templateUrl: "editRecordModal.template",
			controller: Portal_CreateView_Component,
			backdrop: "static",
			size: "lg",
			resolve: {
				module: function () {
					return $scope.module;
				},
				api: function () {
					return $api;
				},
				webapp: function () {
					return $webapp;
				},
				language: function () {
					return $scope.$parent.language
				},
				editStatus: function () {
					return true;
				},
				record: function () {
					return $scope.record;
				}
			}
		});
	}
}

function PortalProfile_DetailView_Component($scope, $api, $webapp, $translatePartialLoader, $http, $q) {
	$scope.hoverEdit = [];

	if ($translatePartialLoader !== undefined) {
		$translatePartialLoader.addPart('home');
		$translatePartialLoader.addPart('Profile');
	}
	$webapp.busy();
	$api.get('Portal'+'/FetchProfile').success(function (profile) {
		$webapp.busy(false);
		$scope.contactDetails = profile.customer_details;
		$scope.accountDetails = profile.company_details;
	});

	$scope.saveContactDetails = function (data, field, type) {
		var d = $q.defer();
		var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		var urlRegex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i
		var params = {
			"api": "saveRecord"
		};
		var record = {};
		record[ field ] = data;
		params.record = record;


		if (type !== undefined && type === 'email' && !emailRegex.test(data)) {

			return 'Please enter a valid email address.';
		}

		if (type !== undefined && type === 'weburl' && !urlRegex.test(data)) {

			return 'Please enter a valid url.';
		}
		if (field === 'lastname' && data === '') {
			return 'Last name is required';
		}
		$webapp.busy(false);
		$http.post('index.php?module=Contacts&api=SaveRecord', params)
				.then(function (data) {

					if (data.data.success && angular.isObject(data.data.result)) {
						if (data.data.result[field] !== '' && data.data.result[ field ] == params.record[ field ]) {
							d.resolve();
						} else if (data.data.result.code !== 'undefined' && data.data.result.code !== 'undefined') {
							d.reject(data.data.result.message);
						} else {
							d.reject('Record could not be saved');
						}
					} else {
						d.reject('Result is not an object');
					}
				});
		return d.promise;
	}


	$scope.saveOrganizationDetails = function (data, field, type) {
		var d = $q.defer();
		var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		var urlRegex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i
		var params = {
			"api": "saveRecord"
		};
		var record = {};
		record[ field ] = data;
		params.record = record;

		if (type !== undefined && type === 'email' && !emailRegex.test(data)) {

			return 'Please enter a valid email address.';
		}

		if (type !== undefined && type === 'weburl' && !urlRegex.test(data)) {

			return 'Please enter a valid url.';
		}
		if (field === 'accountname' && data === '') {
			return 'Organization name is required';
		}
		$webapp.busy(false);
		$http.post('index.php?module=Accounts&api=SaveRecord', params)
				.then(function (data) {
					if (data.data.success && angular.isObject(data.data.result)) {
						if (data.data.result[field] !== '' && data.data.result[ field ] == params.record[ field ]) {
							d.resolve();
						} else if (data.data.result.code !== 'undefined' && data.data.result.code !== 'undefined') {
							d.reject(data.data.result.message);
						} else {
							d.reject('Record could not be saved');
						}
					} else {
						d.reject('Result is not an object');
					}
				});
		return d.promise;
	}

	$scope.hoverEditIn = function (item) {
		$scope.hoverEdit[ item ] = true;
	}

	$scope.hoverEditLeave = function (item) {
		$scope.hoverEdit[ item ] = false;
	}
}

function Portal_CreateView_Component($scope, module, $modalInstance, api, webapp, language, $translatePartialLoader, $filter, $http, editStatus, record) {
	$scope.data = {};
	$scope.datemodel = {};
	$scope.timemodel = {};
	$scope.minDates = [];
	$scope.structure = null;
	var availableModules = JSON.parse(localStorage.getItem('modules'));
	$scope.moduleUiLabel = availableModules[ module ].uiLabel;

	if ($translatePartialLoader !== undefined) {
		$translatePartialLoader.addPart('home');
		$translatePartialLoader.addPart(module);
	}

	function splitFields(arr, size) {
		var newArr = [];
		for (var i = 0; i < arr.length; i += size) {
			newArr.push(arr.slice(i, i+size));
		}
		return newArr;
	}
	$scope.openDatePicker = function ($event, elementOpened) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.datemodel[ elementOpened ] = !$scope.datemodel[ elementOpened ];
	};

	$scope.openTimePicker = function ($event, elementOpened) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.timemodel[ elementOpened ] = !$scope.timemodel[ elementOpened ];
	};
	// Disable weekend selection
	$scope.disabled = function (date, mode) {
		return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
	};

	$scope.minDate = new Date();

	if (!editStatus) {
		api.get(module+'/DescribeModule', {language: language}).success(function (structure) {
			var editables = [];
			var editablesText = [];
			$scope.timeLabels = [];
			$scope.multipicklistFields = [];
			$scope.referenceFields = [];
			$scope.nonAvailableReferenceFields = [];
			$scope.descriptionEnabled = false;
			var labelField = structure.describe.labelFields;
			angular.forEach(structure.describe.fields, function (field) {
				if (field.name !== 'contact_id' && field.name !== 'parent_id' && field.name !== 'assigned_user_id' && field.name !== 'related_to' && field.editable && field.type.name !== "text") {
					if (field.type.name == 'string' && field.editable) {
						$scope.data[ field.name ] = field.default;
						if (field.name == labelField) {
							$scope.recordTitleLabel = field.label;
							$scope.data[ labelField ] = field.default;
						}
					}

					if (field.type.name == 'integer' && field.editable) {

						$scope.data[ field.name ] = field.default;

					}

					if (field.type.name == 'phone' || field.type.name == 'skype' && field.editable) {
						$scope.data[ field.name ] = field.default;
					}

					if (field.type.name == 'boolean' && field.editable) {
						if (field.default == "on") {
							$scope.data[ field.name ] = true;
						} else {
							$scope.data[ field.name ] = false;
						}
					}

					if (field.type.name == 'email' && field.editable) {
						$scope.data[ field.name ] = field.default;
					}

					if (field.type.name == 'url' && field.editable) {
						$scope.data[ field.name ] = field.default;
					}

					if (field.type.name == 'double' && field.editable) {
						$scope.data[ field.name ] = field.default;
					}

					if (field.type.name == 'currency' && field.editable) {
						$scope.data[ field.name ] = field.default;
					}

					if (field.type.name == 'time' && field.editable) {
						var date = new Date();
						$scope.timeField = true;
						$scope.timeLabels.push(field.name);
						if (field.default !== '') {
							var defaultTime = field.default.split(':');
							date.setHours(defaultTime[ 0 ]);
							date.setMinutes(defaultTime[ 1 ]);
							$scope.data[ field.name ] = date;
						} else {
							$scope.data[ field.name ] = date;
						}
					}
					if (field.type.name == 'date' && field.editable) {
						if (!isNaN(field.default)) {
							var date = new Date();
							$scope.data[ field.name ] = $filter('date')(date, "yyyy-MM-dd");
							var minDate = $filter('date')(date, "yyyy-MM-dd");
							$scope.minDates.push(field.name);
							$scope.minDates[ field.name ] = minDate;
						} else {
							$scope.data[ field.name ] = $filter('date')(field.default, "yyyy-MM-dd");
							var minDate = $filter('date')(field.default, "yyyy-MM-dd");
							$scope.minDates.push(field.name);
							$scope.minDates[ field.name ] = minDate;
						}
					}

					if (field.type.name == 'multipicklist' && field.editable) {
						$scope.multipicklistFields.push(field.name);
						var defaultValues = [];
						if (field.default !== null) {
							defaultValues = field.default.split(' |##| ');
						}
						var selectedValues = [];
						if (defaultValues.length !== 0) {
							angular.forEach(defaultValues, function (values, i) {
								var o = {};
								o.label = defaultValues[ i ];
								o.value = defaultValues[ i ];
								selectedValues.push(o);
							});
						}
						$scope.data[ field.name ] = selectedValues;
					}

					if (field.type.name == 'picklist' && field.editable) {
						var continueLoop = true;
						var defaultValue = field.default;
						angular.forEach(field.type.picklistValues, function (pickList, i) {
							if (continueLoop) {
								if (defaultValue !== '' && pickList.value == defaultValue) {
									field.value = field.type.picklistValues[ i ];
									field.index = i;
									continueLoop = false;
								} else if (defaultValue === '') {
									field.value = field.type.picklistValues[ i ];
									field.defaultIndex = i;
									continueLoop = false;
								}
							}
						});
						if (field.index === undefined) {
							$scope.data[ field.name ] = field.type.picklistValues[ 0 ].value;
						} else {
							$scope.data[ field.name ] = field.type.picklistValues[ field.index ].value;
						}
					}
					if (field.name !== labelField) {
						editables.push(field)
					}
				}
				if (field.type.name === "text" && field.editable) {
					$scope.data[ field.name ] = field.default;
					editablesText.push(field);
				}
			});
			var newEditables = [];
			angular.forEach(editables, function (field, i) {
				var isDeleted = false;
				if (field.type.name === "reference") {
					if (field.type.refersTo[ 0 ] === undefined || availableModules[ field.type.refersTo[ 0 ] ] === undefined) {
						isDeleted = true;
					}
				}
				if (!isDeleted) {
					if (field.type.name === "reference") {
						$scope.referenceFields.push(field.name);
					}
					newEditables.push(field);
				}
			});
			editables = newEditables;
			$scope.fields = splitFields(editables, 2);
			if (editablesText.length !== 0) {
				$scope.textFieldsEnabled = true;
				$scope.editableText = editablesText;
			}
		});
	}

	$scope.fetchReferenceRecords = function (module, query) {
		var records = [];
		return $http.get('index.php?module='+module+'&api=FetchReferenceRecords', {
			params: {
				module: module,
				query: query
			}
		})
				.then(function (response) {
					angular.forEach(response.data.result, function (record, i) {
						if (angular.isObject(record)) {
							records.push(response.data.result[ i ]);
						}
					})
					return records;
				});
	}

	$scope.save = function (validity, dateFilter) {
		if (!validity) {
			$scope.submit = true;
			return false;
		}
		if ($scope.referenceFields.length > 0) {
			angular.forEach($scope.referenceFields, function (label) {
				if ($scope.data[ label ] !== undefined && $scope.data[ label ] !== '') {
					$scope.data[ label ] = $scope.data[ label ].id;
				} else {
					$scope.data[ label ] = '';
				}
			});
		}

		if ($scope.nonAvailableReferenceFields.length > 0) {
			angular.forEach($scope.nonAvailableReferenceFields, function (label) {
				if ($scope.data[ label ] !== undefined && $scope.data[ label ] !== '') {
					$scope.data[ label ] = $scope.data[ label ].value;
				} else {
					$scope.data[ label ] = '';
				}
			});
		}

		if ($scope.multipicklistFields.length !== 0) {
			angular.forEach($scope.multipicklistFields, function (label) {
				var choosenValues = $scope.data[ label ];
				var transformedValues = [];
				angular.forEach(choosenValues, function (values, i) {
					if (values.value !== '')
						transformedValues.push(values.value)
				});
				$scope.data[ label ] = '';
				if (transformedValues.length > 0) {
					$scope.data[ label ] = transformedValues;
				}
			});
		}

		if ($scope.timeField) {
			angular.forEach($scope.timeLabels, function (label) {
				var convertedTime = $filter('date')($scope.data[ label ], "HH:mm A");
				$scope.data[ label ] = convertedTime;
			})
		}
		webapp.busy();
		if ($scope.data[ 'serviceid' ] !== undefined) {
			$scope.data[ 'serviceid' ] = $scope.data[ 'serviceid' ].id;
		}
		var params = {
			record: $scope.data
		}
		if (editStatus)
			params.recordId = $scope.editRecord.id;
		$modalInstance.close($scope.data);
		api.post(module+'/SaveRecord', params).success(function (savedRecord) {
			webapp.busy(false);
			$modalInstance.dismiss('cancel');
			if (savedRecord.record !== undefined) {
				var id = savedRecord.record.id.split('x');
				window.location.href = 'index.php?module='+module+'&view=Detail&id='+savedRecord.record.id;
			}
			if (savedRecord.record === undefined) {
				alert(savedRecord.message);
			}
		});
	}

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	}

	if (editStatus) {
		var editFields = [];
		var editableTextFields = [];
		$scope.referenceFields = [];
		$scope.nonAvailableReferenceFields = [];
		$scope.multipicklistFields = [];
		$scope.timeLabels = [];
		$scope.editRecord = angular.copy(record);
		$scope.header = record.identifierName.label;
		$scope.modalTitle = record[ $scope.header ];
		$scope.disabledFields = [];
		api.get(module+'/DescribeModule').success(function (describe) {
			var editableFields = describe.describe.fields;
			var labelField = describe.describe.labelFields;
			$scope.labelField = labelField;
			$scope.editRecord.labelField = labelField;
			$scope.modalTitle = record[ $scope.header ];
			angular.forEach(editableFields, function (field) {
				//If not editable push the field to disabledFields
				if (!field.editable) {
					$scope.disabledFields.push(field.name);
					$scope.disabledFields[ field.name ] = true;
				}
				if (field.name !== 'contact_id' && field.name !== 'parent_id' && field.name !== 'assigned_user_id' && field.name !== 'related_to' && field.type.name !== 'text' && field.editable) {
					if (field.type.name == 'string') {
						if (field.name == labelField) {
							$scope.recordTitleLabel = field.label;
							$scope.data[ $scope.labelField ] = record[ field.label ];
						}
						if (field.name == 'serialnumber') {
							$scope.disabledFields.push(field.name);
							$scope.disabledFields[ field.name ] = true;
						}
						if (record[ field.label ] === '') {
							$scope.data[ field.name ] = field.default;
						} else {
							$scope.data[ field.name ] = record[ field.label ];
						}
					}

					if (field.type.name == 'integer') {
						if (record[ field.label ] === '') {
							$scope.data[ field.name ] = field.default;
						} else {
							$scope.data[ field.name ] = record[ field.label ];
						}
					}

					if (field.type.name == 'phone' || field.type.name == 'skype') {
						if (record[ field.label ] === '') {
							$scope.data[ field.name ] = field.default;
						} else {
							$scope.data[ field.name ] = record[ field.label ];
						}
					}

					if (field.type.name == 'boolean') {
						if (record[ field.label ] === '') {
							$scope.data[ field.name ] = false;
						}
						if (record[ field.label ] == "Yes" || field.default == "on") {
							$scope.data[ field.name ] = true;
						} else {
							$scope.data[ field.name ] = false;
						}
					}

					if (field.type.name == 'email') {
						if (record[ field.label ] === '') {
							$scope.data[ field.name ] = field.default;
						} else {
							$scope.data[ field.name ] = record[ field.label ];
						}
					}

					if (field.type.name == 'url') {
						if (record[ field.label ] === '') {
							$scope.data[ field.name ] = field.default;
						} else {
							$scope.data[ field.name ] = record[ field.label ];
						}
					}

					if (field.type.name == 'reference') {
						if (record[ field.label ] === '' || record[ field.label ] === 0) {
							$scope.data[ field.name ] = '';
						} else {

							if (field.name === 'account' || field.name === 'contact') {
								$scope.disabledFields.push(field.name);
								$scope.disabledFields[ field.name ] = true;
							}
							if (field.name === 'product' && module === 'Assets') {
								$scope.disabledFields.push(field.name);
								$scope.disabledFields[ field.name ] = true;
							}
							$scope.data[ field.name ] = record.referenceFields[ field.label ];
						}
					}

					if (field.type.name == 'double') {
						if (record[ field.label ] === '') {
							$scope.data[ field.name ] = field.default;
						} else {
							$scope.data[ field.name ] = record[ field.label ];
						}
					}

					if (field.type.name == 'currency') {
						if (record[ field.label ] === '') {
							$scope.data[ field.name ] = field.default;
						} else {
							$scope.data[ field.name ] = record[ field.label ];
						}
					}

					if (field.type.name == 'picklist') {
						var continueLoop = true;
						var defaultValue = field.default;
						angular.forEach(field.type.picklistValues, function (pickList, i) {
							if (continueLoop) {
								if (pickList.label == record[ field.label ] && record[ field.label ] !== '') {
									field.value = field.type.picklistValues[ i ];
									field.index = i;
									continueLoop = false;
								} else if (record[ field.label ] == '' && pickList.value == defaultValue) {
									field.value = field.type.picklistValues[ i ];
									field.index = i;
									continueLoop = false;
								}
							}
						});
						if (field.index === undefined) {
							$scope.data[ field.name ] = field.type.picklistValues[ 0 ].value;
						} else {
							$scope.data[ field.name ] = field.type.picklistValues[ field.index ].value;
						}
					}

					if (field.type.name == 'multipicklist') {
						$scope.multipicklistFields.push(field.name);
						var defaultValues = [];
						var recordValues = record[ field.label ].split(',');
						if (field.default !== null) {
							defaultValues = field.default.split(' |##| ');
						}
						var selectedValues = [];
						if (recordValues.length > 0 && recordValues[ 0 ] !== '') {
							angular.forEach(recordValues, function (values, i) {
								var o = {};
								o.label = values;
								o.value = values;
								selectedValues.push(o);
							});
						} else if ((recordValues.length > 0 || recordValues[ 0 ] !== '') && defaultValues.length > 0) {
							angular.forEach(defaultValues, function (values, i) {
								var o = {};
								o.label = values;
								o.value = values;
								selectedValues.push(o);
							});
						}
						$scope.data[ field.name ] = selectedValues;
					}

					if (field.type.name == 'date') {
						if (field.name === 'datesold' && module === 'Assets') {
							$scope.disabledFields.push(field.name);
							$scope.disabledFields[ field.name ] = true;
						}
						if (record[ field.label ] === '' && !isNaN(field.default)) {
							var date = new Date();
							$scope.data[ field.name ] = $filter('date')(date, "yyyy-MM-dd");
							var minDate = $filter('date')(record[ field.label ], "yyyy-MM-dd");
							$scope.minDates.push(field.name);
							$scope.minDates[ field.name ] = minDate;
						} else if (record[ field.label ] === '' && isNaN(field.default)) {
							$scope.data[ field.name ] = $filter('date')(field.default, "yyyy-MM-dd");
							var minDate = $filter('date')(field.default, "yyyy-MM-dd");
							$scope.minDates.push(field.name);
							$scope.minDates[ field.name ] = minDate;
						} else {
							$scope.data[ field.name ] = $filter('date')(record[ field.label ], "yyyy-MM-dd");
							var minDate = $filter('date')(record[ field.label ], "yyyy-MM-dd");
							$scope.minDates.push(field.name);
							$scope.minDates[ field.name ] = minDate;
						}
					}

					if (field.type.name == 'time') {
						var date = new Date();
						$scope.timeField = true;
						$scope.timeLabels.push(field.name);
						if (record[ field.label ] !== '') {
							var selectedTime = record[ field.label ].split(':');
							date.setHours(selectedTime[ 0 ]);
							date.setMinutes(selectedTime[ 1 ]);
							$scope.data[ field.name ] = date;
						} else if (field.default !== '') {
							var defaultTime = field.default.split(':');
							date.setHours(defaultTime[ 0 ]);
							date.setMinutes(defaultTime[ 1 ]);
							$scope.data[ field.name ] = date;
						} else {
							$scope.data[ field.name ] = date;
						}
					}
					if (field.name !== labelField) {
						editFields.push(field)
					}
				}
				if (field.type.name === "text" && field.editable) {
					editableTextFields.push(field);
					if (record[ field.label ] !== '') {
						$scope.data[ field.name ] = record[ field.label ];
					} else {
						$scope.data[ field.name ] = field.default;
					}
				}
			});

			var newEditFields = [];
			angular.forEach(editFields, function (field, i) {
				var isDeleted = false;
				if (field.type.name === "reference") {
					if (field.type.refersTo[ 0 ] === undefined || availableModules[ field.type.refersTo[ 0 ] ] === undefined) {
						isDeleted = true;
					}
				}
				if (!isDeleted) {
					if (field.type.name === "reference") {
						$scope.referenceFields.push(field.name);
					}
					newEditFields.push(field);
				}
				if (field.type.name === 'reference' && availableModules[ field.type.refersTo[ 0 ] ] === undefined) {
					$scope.nonAvailableReferenceFields.push(field.name);
				}
			});
			editFields = newEditFields;

			$scope.fields = splitFields(editFields, 2);
			if (editableTextFields.length !== 0) {
				$scope.textFieldsEnabled = true;
				$scope.editableText = editableTextFields;
			}
		})
	}

}
