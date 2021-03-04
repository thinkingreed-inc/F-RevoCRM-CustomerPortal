{*+**********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.2
* ("License.txt"); You may not use this file except in compliance with the License
* The Original Code is: Vtiger CRM Open Source
* The Initial Developer of the Original Code is Vtiger.
* Portions created by Vtiger are Copyright (C) Vtiger.
* All Rights Reserved.
************************************************************************************}

<div class="col-lg-7 col-md-7 col-sm-12 col-xs-12 rightEditContent">
    {literal}
        <ul class="nav nav-tabs" ng-init="tab = 1">
            <li ng-class="{active:tab===1}">
                <a href ng-click="tab = 1"><strong>{{'History' | translate}} </strong></a>
            </li>
        </ul>
    {/literal}    
    <br>
    <div class="tab-content">
        {literal}<div  ng-show="tab === 1"> {/literal}
            {include file="Portal/partials/UpdatesContent.tpl"}
        </div>
    </div>
</div>