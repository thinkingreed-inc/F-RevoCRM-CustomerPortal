{*+**********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.2
* ("License.txt"); You may not use this file except in compliance with the License
* The Original Code is: Vtiger CRM Open Source
* The Initial Developer of the Original Code is Vtiger.
* Portions created by Vtiger are Copyright (C) Vtiger.
* All Rights Reserved.
************************************************************************************}

{literal}
    <div class="cp-table-container" ng-show="projectmilestonerecords">
        <div class="table-responsive">
            <table class="table table-hover table-condensed table-detailed dataTable no-footer">
                <thead>
                    <tr class="listViewHeaders">
                        <th ng-hide="header=='id'" ng-repeat="header in projectmilestoneheaders" nowrap="" class="medium">
                            <a href="javascript:void(0);" class="listViewHeaderValues" data-nextsortorderval="ASC" data-columnname="{{header}}" translate="{{header}}">{{header}}&nbsp;&nbsp;</a>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="listViewEntries" ng-repeat="record in projectmilestonerecords">
                        <td ng-hide="header=='id'" ng-repeat="header in projectmilestoneheaders" class="listViewEntryValue medium" nowrap="" style='cursor: pointer;' ng-mousedown="ChangeLocation(record, 'ProjectMilestone')">
                <ng-switch on="record[header].type">
                    <a ng-href="index.php?module=ProjectMilestone&view=Detail&id={{record.id}}"></a>
                    <span ng-switch-default>{{record[header]}}</span>
                </ng-switch>
                </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
    <a href="" ng-if="!milestonesLoaded && !noMilestones" ng-click="loadProjectMilestonePage(projectMilestonePageNo)">{{'more'|translate}}...</a>
    <p ng-if="milestonesLoaded" class="text-muted">{{'No Milestones'|translate}}</p>
    <p ng-if="!milestonesLoaded && noMilestones" class="text-muted">{{'No more Milestones'|translate}}</p>
{/literal}
