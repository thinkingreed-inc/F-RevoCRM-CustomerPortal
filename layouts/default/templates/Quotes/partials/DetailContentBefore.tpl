{*+**********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.2
* ("License.txt"); You may not use this file except in compliance with the License
* The Original Code is: Vtiger CRM Open Source
* The Initial Developer of the Original Code is Vtiger.
* Portions created by Vtiger are Copyright (C) Vtiger.
* All Rights Reserved.
************************************************************************************}

{literal}
<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ticket-detail-header-row ">
  <h3 class="fsmall">
    <detail-navigator>
      <span>
        <a ng-click="navigateBack(module)" style="font-size:small;">{{ptitle}}</a>
      </span>
    </detail-navigator>
      {{record[header]}}
    <button ng-if="quoteAccepted" translate="Accept Quote" class="btn btn-success close-ticket" ng-click="acceptQuote();"></button>
  </h3>
</div>
</div>
<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
  {/literal}
  <script type="text/javascript" src="{portal_componentjs_file('Documents')}"></script>
  {include file=portal_template_resolve('Documents', "partials/IndexContentAfter.tpl")}
