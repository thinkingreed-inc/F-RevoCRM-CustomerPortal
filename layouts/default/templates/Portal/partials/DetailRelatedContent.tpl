{*+**********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.2
* ("License.txt"); You may not use this file except in compliance with the License
* The Original Code is: Vtiger CRM Open Source
* The Initial Developer of the Original Code is Vtiger.
* Portions created by Vtiger are Copyright (C) Vtiger.
* All Rights Reserved.
************************************************************************************}

<div ng-if="splitContentView" class="col-lg-7 col-md-7 col-sm-12 col-xs-12 rightEditContent">
    {literal}
        <ul tabset>
            <tab ng-repeat="relatedModule in relatedModules" select="selectedTab(relatedModule.name)" ng-if="relatedModule.value" heading={{relatedModule.name}} active="tab.active" disabled="tab.disabled">
                <tab-heading><strong translate="{{relatedModule.uiLabel}}">{{relatedModule.uiLabel}}</strong><tab-heading>
						</ul>
                    {/literal}
                    <br>
                    <div class="tab-content">
                        {literal}<div ng-show="selection==='ModComments'">{/literal}
                            {include file="Portal/partials/CommentContent.tpl"}
                        </div>
                        {literal}<div ng-hide="selection!=='History'"> {/literal}
                            {include file="Portal/partials/UpdatesContent.tpl"}
                        </div>
                        {literal}<div ng-hide="selection!=='ProjectTask'"> {/literal}
                            {include file="Project/partials/ProjectTaskContent.tpl"}
                        </div>
                        {literal}<div ng-hide="selection!=='ProjectMilestone'"> {/literal}
                            {include file="Project/partials/ProjectMilestoneContent.tpl"}
                        </div>
                        {literal}<div ng-hide="selection!=='Documents'"> {/literal}
                            {include file="Documents/partials/RelatedDocumentsContent.tpl"}
                        </div>
                    </div>
                    </div>
