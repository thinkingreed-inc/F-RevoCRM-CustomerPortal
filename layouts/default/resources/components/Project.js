/*+***********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 *************************************************************************************/

function Project_DetailView_Component($scope, $api, $webapp, $translatePartialLoader,sharedModalService,$modal) {
    if ($translatePartialLoader !== undefined) {
        $translatePartialLoader.addPart('home');
        $translatePartialLoader.addPart('Project');
        $translatePartialLoader.addPart('Documents');
        $translatePartialLoader.addPart('ProjectTask');
        $translatePartialLoader.addPart('ProjectMilestone');
    }
    angular.extend(this, new Portal_DetailView_Component($scope, $api, $webapp));
    var url = purl();

    $scope.module = url.param('module');
    $scope.id = url.param('id');
    $scope.pageInitialized = false;
    $scope.splitContentView = false;

    $scope.record = null;
    $scope.fields = [];

    $scope.isEditable = false;
    $scope.isCommentsEnabled = true;
    $scope.isCommentCreateable = true;

    $scope.comments = [];
    $scope.newcomment = {};

    $scope.updates = [];

    $scope.$on('editRecordModalDocuments.Template', function() {
      $modal.open({
        templateUrl: 'editRecordModalDocuments.template',
        controller: Documents_EditView_Component,
        backdrop:'static',
        keyboard:'false',
        resolve: {
          record: function() {
            return {'parentId':$scope.id,'parentModule':$scope.module};
          },
          api: function() {
            return $api;
          },
          webapp: function() {
            return $webapp;
          },
          module: function() {
            return 'Documents';
          }
        }
      });
    });

    $scope.attachDocument = function(module, action) {
      var actionConfig = {'LBL_ADD_DOCUMENT': 'Documents'};
      if (actionConfig.hasOwnProperty(action)) {
        sharedModalService.prepForModal(actionConfig[action]);
      }
    }

    $scope.loadProjectTasks = function(pageNo) {
        if (pageNo === undefined) {
            $scope.projectTaskPageNo = 0;
        }
        else {
            $scope.projectTaskPageNo = pageNo
        }
        var params = {
            'relatedModule': 'ProjectTask',
            'id': $scope.id,
            'relatedModuleLabel': 'Project Tasks',
            'page': $scope.projectTaskPageNo
        }
        $api.get($scope.module + '/FetchRelatedRecords', params).success(function(result) {
            // $webapp.busy(false);
            $scope.tasksLoaded = false;
            $scope.noTasks = false;
            var tasksCount = result.records.length;
            if (tasksCount === 0) {
                $scope.noTasks = false;
                $scope.tasksLoaded = true;
            }
            if ($scope.projectTaskPageNo === 0 && tasksCount > 0) {
                $scope.projecttaskrecords = result.records;
                $scope.projecttaskheaders = result.headers;
                if (tasksCount < 10){
                    $scope.tasksLoaded = false;
                    $scope.noTasks = true;
                  }
            }
            else if ($scope.projectTaskPageNo!==0){
                if (tasksCount === 0)
                    $scope.tasksLoaded = true;
                var projectTaskRecords = angular.copy(result.records)
                angular.forEach(projectTaskRecords, function(taskRecord) {
                    $scope.projecttaskrecords.push(taskRecord)
                });
                if (tasksCount < 10) {
                    $scope.tasksLoaded = false;
                    $scope.noTasks=true;
                }
            }
        });
    }

    $scope.loadProjectMilestones = function(pageNo) {
        if (pageNo === undefined) {
            $scope.projectMilestonePageNo = 0;
        }
        else {
            $scope.projectMilestonePageNo = pageNo
        }
        var params = {
            'relatedModule': 'ProjectMilestone',
            'id': $scope.id,
            'relatedModuleLabel': 'Project Milestones',
            'page': $scope.projectMilestonePageNo
        }
        $api.get($scope.module + '/FetchRelatedRecords', params).success(function(result) {
          $scope.milestonesLoaded = false;
          $scope.noMilestones = false;
          var milestoneCount = result.records.length;
            if (milestoneCount === 0) {
                $scope.noMilestones = false;
                $scope.milestonesLoaded = true;
            }
            if ($scope.projectMilestonePageNo === 0 && milestoneCount>0) {
                $scope.projectmilestonerecords = result.records;
                $scope.projectmilestoneheaders = result.headers;
                if(milestoneCount < 10){
                  $scope.milestonesLoaded = false;
                  $scope.noMilestones = true;
                }
            }
            else if ($scope.projectMilestonePageNo!==0){
                if (milestoneCount === 0)
                    $scope.milestonesLoaded = true;
                var projectMilestoneRecords = angular.copy(result.records)
                angular.forEach(projectMilestoneRecords, function(milestoneRecord) {
                    $scope.projectmilestonerecords.push(milestoneRecord)
                });

                if(milestoneCount < 10){
                  $scope.milestonesLoaded = false;
                  $scope.noMilestones = true;
                }
            }
        });
    }

    $scope.ChangeLocation = function(record,module) {
        var url = "index.php?module=" + module + "&view=Detail&id=" + record.id + "&parentId=" + $scope.id;
        window.location.href = url;
    }

    $scope.loadProjectTaskPage = function(pageNo) {
        $webapp.busy(false);
        $scope.loadProjectTasks(pageNo + 1)
    }

    $scope.loadProjectMilestonePage = function(pageNo) {
        $webapp.busy(false);
        $scope.loadProjectMilestones(pageNo + 1)
    }
}
