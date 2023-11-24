{*+**********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.2
* ("License.txt"); You may not use this file except in compliance with the License
* The Original Code is: Vtiger CRM Open Source
* The Initial Developer of the Original Code is Vtiger.
* Portions created by Vtiger are Copyright (C) Vtiger.
* All Rights Reserved.
************************************************************************************}

<!doctype>
<html ng-app="portalapp">

	<head>
		<meta charset="UTF-8">
		<link rel="SHORTCUT ICON" href="layouts/{portal_layout()}/resources/images/favicon.ico">
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

		<link rel="stylesheet" href="libraries/bootstrap/css/bootstrap.min.css" type="text/css" media="screen" />
		<link rel="stylesheet" href="libraries/jqueryaddons/selectric/selectric.css" type="text/css" media="screen" />
		<link rel="stylesheet" href="libraries/angularjsaddons/ngProgress/ngProgress.css" type="text/css" media="screen" />
		<link rel="stylesheet" href="libraries/angularuiaddons/ui-select-master/src/select.css" type="text/css" media="screen" />
		<link rel="stylesheet" href="layouts/{portal_layout()}/resources/application.css" type="text/css" media="screen" />
		<link rel="stylesheet" href="layouts/{portal_layout()}/skins/default/styles.css" type="text/css" media="screen" />
		<link rel="stylesheet" href="libraries/angularjsaddons/angular-xeditable/css/xeditable.css">
		<script type="text/javascript" src="libraries/jquery/jquery.min.js"></script>
		<script type="text/javascript" src="libraries/bootstrap/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="libraries/jqueryaddons/purl.js"></script>
		<script type="text/javascript" src="libraries/jqueryaddons/selectric/jquery.selectric.min.js"></script>
		<script type="text/javascript" src="libraries/jqueryaddons/slimscroll/jquery.slimscroll.min.js"></script>
		<script type="text/javascript" src="libraries/angularjs/angular.min.js"></script>
		<script type="text/javascript" src="libraries/angularjs/angular-sanitize.min.js"></script>
		<script type="text/javascript" src="libraries/angularui/ui-utils.min.js"></script>
		<script type="text/javascript" src="libraries/angularui/ui-bootstrap-tpls-0.12.0.min.js"></script>
		<script type="text/javascript" src="libraries/angularui/ui-tinymce.js"></script>
		<script type="text/javascript" src="libraries/angularuiaddons/ui-select-master/src/select.js"></script>
		<script type="text/javascript" src="libraries/angularjsaddons/elastic/elastic.js"></script>
		<script type="text/javascript" src="libraries/angularjsaddons/ngProgress/ngProgress.min.js"></script>
		<script type="text/javascript" src="libraries/angularuiaddons/timepicker/timepicker.js"></script>
		<script type="text/javascript" src="libraries/angularjsaddons/angularjs-translate/angular-translate.js"></script>
		<script type="text/javascript" src="libraries/angularjs/directives/modelOptions/ngModelOptions.min.js"></script>
		<script type="text/javascript" src="libraries/angularjsaddons/angular-translate-loader-partial/angular-translate-loader-partial.js"></script>
		<script type="text/javascript" src="libraries/angularjsaddons/ngCsv/ng-csv.js"></script>
		<script type="text/javascript" src="libraries/angularjsaddons/angular-xeditable/js/xeditable.min.js"></script>
		<script type="text/javascript" src="layouts/{portal_layout()}/resources/application.js"></script>
		<script type="text/javascript" src="layouts/{portal_layout()}/resources/components/main.js"></script>
		<script type="text/javascript" src="layouts/{portal_layout()}/resources/components/home.js"></script>
		<script type="text/javascript" src="layouts/{portal_layout()}/resources/components/Portal.js"></script>
		<script type="text/javascript" src="{portal_componentjs_file($MODULE)}"></script>
		<script type="text/javascript" src="libraries/jqueryaddons/ckeditor/ckeditor.js"></script>
		<script type="text/javascript" src="libraries/jqueryaddons/angular-ckeditor.js"></script>

		<style type="text/css">
			{
				literal
			}
			
			[ng\:cloak],
			[ng-cloak],
			[data-ng-cloak],
			[x-ng-cloak],
			.ng-cloak,
			.x-ng-cloak {
				display: none !important;
			}
			
			{
				/literal
			}

		</style>
		<title ng-controller="MainController">{literal}{{companyTitle}} - {{'Portal'|translate}}{/literal}</title>
	</head>

	<body ng-controller="MainController" ng-cloak>
		<nav class="navbar navbar-static-top">
			{literal}
			<div class="search-wrapper" ng-controller="globalSearchController">

				<form class="search-container">
					<!-- <pre>Model:{{search}}|Results:{{record}}</pre> -->
					<div class="search-results-container hidden-lg hidden-md">
						<input id="search-box" type="text" class="search-box" name="q" ng-model="search" typeahead="record as record.value for record in searchRecords($viewValue)|filter:{value:$viewValue}" typeahead-min-length="3" typeahead-wait-ms="400" typeahead-editable="false"
						placeholder="{{'Type 3 characters'|translate}}" typeahead-template-url="searchResults.tpl" ng-trim="false">
						<label for="search-box">
							<span class="glyphicon glyphicon-search search-icon"></span>
						</label>
				</form>
				</div>
			</div>
			{/literal}
			<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
				<span class="sr-only">Toggle navigation</span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</button>
			{literal}
			<div class="collapse navbar-collapse" role="navigation">
				{/literal}
				<div class="col-lg-2 col-md-2" title="logo.png">
					<a class="logo-left" href="index.php">
						<img src="{get_logo()}">
					</a>
				</div>
				{literal}
				<div class="col-lg-8 col-md-8 col-sm-6 col-xs-6 portalnavbar" ng-if="loginUser">
					<ul class=" nav navbar-nav headerLinks menu" ng-show="modules">
						<li ng-class="{'active':isActive('Home')}">
							<a translate="Home" href="index.php"></a>
						</li>
						<li class="hidden-md hidden-sm hidden-lg" ng-repeat="module in modules|orderBy:'order'" ng-if="module!=='language' && module.name!=='ProjectTask' && module.name!=='ProjectMilestone'" ng-class="{'active':isActive(module.name)}">
							<a translate="{{module.uiLabel}}" href="index.php?module={{module.name}}">
                                    {{module.uiLabel}}
                                </a>
						</li>
						<li class="hidden-xs hidden-sm" ng-repeat="module in modules|orderModulesBy:'order'" ng-if="module!=='language' && module.name!=='ProjectTask' && module.name!=='ProjectMilestone'" ng-class="{'active':isActive(module.name)}">
							<a ng-if="$index <=1" translate="{{module.uiLabel}}" href="index.php?module={{module.name}} ">{{module.uiLabel}}</a>
						</li>
						<li class="hidden-xs hidden-sm hidden-md visible-lg" ng-repeat="module in modules|orderModulesBy:'order'" ng-if="module!=='language' && module.name!=='ProjectTask' && module.name!=='ProjectMilestone'" ng-class="{'active':isActive(module.name)}">
							<a ng-if="$index >1  && $index <=4" translate="{{module.uiLabel}}" href="index.php?module={{module.name}}">{{module.uiLabel}}</a>
						</li>
						<li class="hidden-xs navbartoggle" ng-if="modulesCount > 5">
							<a href="#" class="dropdown-toggle " data-toggle="dropdown">{{'More' | translate}}<b class="caret"></b></a>
							<ul class="dropdown-menu">
								<li class="hidden-md hidden-lg" ng-repeat="module in modules|orderModulesBy:'order'" ng-if="module!=='language' && module.uiLabel!==undefined && module.name!=='ProjectTask' && module.name!=='ProjectMilestone'" ng-class="{'active':isActive(module.name)}">
									<a ng-if="$index>-1 && $index<=1" translate="{{module.uiLabel}}" href="index.php?module={{module.name}}">{{module.uiLabel}}</a>
								</li>
								<li class="hidden-lg" ng-repeat="module in modules|orderModulesBy:'order'" ng-if="module!=='language' && module.name!=='ProjectTask' && module.name!=='ProjectMilestone'" ng-class="{'active':isActive(module.name)}">
									<a ng-if="$index >1  && $index <=4" translate="{{module.uiLabel}}" href="index.php?module={{module.name}}">{{module.uiLabel}}</a>
								</li>
								<li ng-repeat="module in modules|orderModulesBy:'order'" ng-if="module!=='language' && module.name!=='ProjectTask' && module.name!=='ProjectMilestone'" ng-class="{'active':isActive(module.name)}">
									<a ng-if="$index > 4" translate="{{module.uiLabel}}" href="index.php?module={{module.name}}">{{module.uiLabel}}</a>
								</li>
							</ul>
						</li>
						<li>
							<div class="search-wrapper hidden-sm hidden-xs" ng-controller="globalSearchController">

								<form class="search-container">
									<!-- <pre>Model:{{search}}|Results:{{record}}</pre> -->
									<div class="search-results-container">
										<input id="search-box2" type="text" class="search-box" name="q" ng-model="search" typeahead="record as record.value for record in searchRecords($viewValue)|filter:{value:$viewValue}" typeahead-min-length="3" typeahead-wait-ms="400" placeholder="{{'Type 3 characters'|translate}}"
										typeahead-editable="false" typeahead-template-url="searchResults.tpl" typeahead-on-select="search=''" ng-trim="false">
										<label for="search-box">
											<span class="glyphicon glyphicon-search search-icon"></span>
										</label>
								</form>
								</div>

						</li>
					</ul>
					</div>
					<div class="col-lg-2 col-md-2 col-sm-2 col-xs-2 portalnavbar" ng-if="loginUser">
						<ul class="nav navbar-nav navbar-right headerLinks">
							<li class="dropdown">
								<a href="#" class="dropdown-toggle" data-toggle="dropdown">
									<img src="layouts/default/resources/images/user.png" style="heigth:20px;" alt="User image">
									<span class="caret"></span>
								</a>
								<ul class="dropdown-menu" role="menu">
									<li>
										<a href="index.php?module=PortalProfile&view=MyProfile" translate="Profile">
                                            Profile
                                        </a>
									</li>
									<li>
										<a href="#" ng-click="changePassword()" translate="Change Password">
                                            Change Password
                                        </a>
									</li>
									<li>
										<a ng-click="logout()" translate="Logout">
                                            Logout
                                        </a>
									</li>
								</ul>
							</li>
						</ul>
					</div>
				</div>

				<script type="text/ng-template" id="changePassword.template">
					<div class="modal-header">
						<button type="button" class="close" ng-click="cancel()" title="Close">&times;</button>
						<h3 class="modal-title">{{'Change Password'|translate}}</h3>
					</div>
					<form class="form-horizontal" role="form">
						<div class="modal-body">
							<div class="form-group">
								<label class="col-sm-4 control-label">{{'Current Password'|translate}}</label>
								<div class="col-sm-5">
									<input ng-model="data.oldPassword" type="password" required class="form-control"></input>
								</div>
							</div>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{'New Password'|translate}}</label>
								<div class="col-sm-5">
									<input ng-model="data.newPassword" type="password" required class="form-control"></input>
								</div>
							</div>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{'Confirm Password'|translate}}</label>
								<div class="col-sm-5">
									<input ng-model="data.confirmPassword" type="password" required class="form-control"></input>
									<span class="text-danger" ng-if="data.oldPassword.length && data.newPassword.length && data.confirmPassword.length && (data.newPassword!==data.confirmPassword) && (data.newPassword!==data.oldPassword)">Re-confirm your password</span>
									<span class="text-danger" ng-if="data.oldPassword.length && data.newPassword.length && (data.newPassword==data.oldPassword)">New password cannot be same as current password.Please enter new password.</span>
								</div>
							</div>
						</div>
						<div class="modal-footer">
							<button ng-if="data.oldPassword.length && data.newPassword.length && data.confirmPassword.length && (data.newPassword==data.confirmPassword) && (data.newPassword!==data.oldPassword)" class="btn btn-danger" type="button" ng-click="cancel()">{{'Cancel'|translate}}</button>
							<button ng-if="data.oldPassword.length && data.newPassword.length && data.confirmPassword.length && (data.newPassword==data.confirmPassword) && (data.newPassword!==data.oldPassword)" class="btn btn-success" type="submit" ng-click="save()">{{'Save'|translate}}</button>
						</div>
					</form>
				</script>
				<script id="template/pagination/pagination.html" type="text/ng-template">
					<ul class="pagination">
						<li ng-if="boundaryLinks && totalPages>'10'" ng-class="{disabled: noPrevious()}" title="First Page"><a href ng-click="selectPage(1)">&laquo;</a></li>
						<li ng-if="directionLinks" ng-class="{disabled: noPrevious()}" title="Previous Page">
							<a href class="page-left" ng-click="selectPage(page - 1)"></a>
						</li>
						<li ng-repeat="page in pages track by $index" ng-class="{active: page.active}"><a href ng-click="selectPage(page.number)">{{page.text}}</a></li>
						<li ng-if="directionLinks" ng-class="{disabled: noNext()}" title="Next Page">
							<a href class="page-right" ng-click="selectPage(page + 1)"></a>
						</li>
						<li ng-if="boundaryLinks && totalPages>'10'" ng-class="{disabled: noNext()}" title="Last Page"><a href ng-click="selectPage(totalPages)">&raquo;</a></li>
					</ul>
				</script>
				<script id="template/timepicker/popup.html" type="text/ng-template">
					<ul class="dropdown-menu" ng-style="{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}">
						<li ng-transclude></li>
					</ul>
				</script>
				<script id="template/timepicker/timepicker.html" type="text/ng-template">
					<table>
						<tbody>
							<tr class="text-center">
								<td>
									<a ng-click="incrementHours()" class="btn btn-link">
										<span class="glyphicon glyphicon-chevron-up"></span>
									</a>
								</td>
								<td>&nbsp;</td>
								<td>
									<a ng-click="incrementMinutes()" class="btn btn-link">
										<span class="glyphicon glyphicon-chevron-up"></span>
									</a>
								</td>
								<td ng-show="showMeridian"></td>
							</tr>
							<tr>
								<td style="width:50px;" class="form-group" ng-class="{'has-error': invalidHours}">
									<input type="text" ng-model="hours" ng-change="updateHours()" class="form-control text-center" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2">
								</td>
								<td>:</td>
								<td style="width:50px;" class="form-group" ng-class="{'has-error': invalidMinutes}">
									<input type="text" ng-model="minutes" ng-change="updateMinutes()" class="form-control text-center" ng-readonly="readonlyInput" maxlength="2">
								</td>
								<td ng-show="showMeridian">
									<button type="button" class="btn btn-default text-center" ng-click="toggleMeridian()">{{meridian}}</button>
								</td>
							</tr>
							<tr class="text-center">
								<td>
									<a ng-click="decrementHours()" class="btn btn-link">
										<span class="glyphicon glyphicon-chevron-down"></span>
									</a>
								</td>
								<td>&nbsp;</td>
								<td>
									<a ng-click="decrementMinutes()" class="btn btn-link">
										<span class="glyphicon glyphicon-chevron-down"></span>
									</a>
								</td>
								<td ng-show="showMeridian"></td>
							</tr>
						</tbody>
					</table>
				</script>
				<script type="text/ng-template" id="searchResults.tpl">
					<a tabindex="-1" ng-controller="globalSearchController">
						<!-- <pre>{{match}} -- {{query}}</pre> -->
						<i ng-click="searchItemSelected(match)" bind-html-unsafe="match.model.module.uiLabel" ng-class="getModuleLabelClass(match.model.module)"></i>
						<span ng-click="searchItemSelected(match)">{{match.model.value|limitTo:30}}</span>
					</a>
				</script>
				{/literal}

		</nav>
		<div class="webapp-page">
