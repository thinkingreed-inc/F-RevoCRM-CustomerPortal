/*+**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 ************************************************************************************/

function Documents_IndexView_Component($scope, $api, $webapp, $modal, $translatePartialLoader) {

	if ($translatePartialLoader !== undefined) {
		$translatePartialLoader.addPart('home');
		$translatePartialLoader.addPart('Documents');
	}

	var availableModules = JSON.parse(localStorage.getItem('modules'));
	var currentModule = 'Documents';
	//set creatable true
	if (availableModules !== null && availableModules[currentModule]) {
		$scope.isCreatable = availableModules[currentModule].create;
		$scope.filterPermissions = availableModules[currentModule].recordvisibility;
	}

	angular.extend(this, new Portal_IndexView_Component($scope, $api, $webapp));
	$scope.searchQ = {
		onlymine: true
	}

	$scope.$on('editRecordModalDocuments.Template', function () {
		$modal.open({
			templateUrl: 'editRecordModalDocuments.template',
			controller: Documents_EditView_Component,
			backdrop: 'static',
			keyboard: 'false',
			resolve: {
				record: function () {
					return {};
				},
				api: function () {
					return $api;
				},
				webapp: function () {
					return $webapp;
				},
				module: function () {
					return 'Documents';
				}
			}
		});
	});

	$scope.searchQ = {
		onlymine: true
	}
	$scope.isCreateable = true;
	$scope.viewLoading = true;

	$scope.$watch('searchQ.folder', function (nvalue, ovalue) {
		if (nvalue != ovalue) {
			$scope.loadRecords();
		}
	});

	$scope.create = function () {
		var modalInstance = $modal.open({
			templateUrl: 'editRecordModalDocuments.template',
			controller: Documents_EditView_Component,
			backdrop: 'static',
			keyboard: 'false',
			resolve: {
				record: function () {
					return {};
				},
				api: function () {
					return $api;
				},
				webapp: function () {
					return $webapp;
				},
				module: function () {
					return $scope.module;
				},
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

function Documents_EditView_Component($scope, $modalInstance, record, api, webapp, module, $http, $translatePartialLoader, ngProgress) {
	$scope.editRecord = angular.copy(record);
	$scope.structure = null;
	if ($translatePartialLoader !== undefined) {
		$translatePartialLoader.addPart('Documents');
	}
	$scope.save = function () {
		var fd = new FormData();
		if ($scope.editRecord.folderid !== undefined) {
			fd.append('folderid', $scope.editRecord.folderid);
		}
		fd.append('module', 'Documents');
		fd.append('api', 'UploadAttachment');
		if (record.parentId !== undefined && record.parentModule !== undefined)
			fd.append('parentId', record.parentId);
		if ($scope.editRecord !== undefined) {
			fd.append('file', $scope.editRecord.filename[ 0 ]);
			ngProgress.start();
			$scope.saving = true;
			$http.post('index.php?', fd, {
				transformRequest: angular.identity,
				headers: {
					'Content-Type': undefined
				}
			})
					.success(function (data) {
						if (data.success) {
							$modalInstance.close($scope.editRecord.filename[ 0 ]);
							ngProgress.complete();
							if (record.parentId === undefined) {
								window.location.href = 'index.php?module=' + module + '&view=Detail&id=' + data.result.record.id;
							} else if (record.parentId !== undefined && record.parentModule !== undefined) {
								window.location.href = 'index.php?module=' + record.parentModule + '&view=Detail&id=' + record.parentId;
							}
						} else {
							$modalInstance.dismiss('cancel');
							alert(data.error[ 'message' ]);
						}
					});
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	}
}
