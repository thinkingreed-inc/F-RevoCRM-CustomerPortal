{*+**********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.2
* ("License.txt"); You may not use this file except in compliance with the License
* The Original Code is: Vtiger CRM Open Source
* The Initial Developer of the Original Code is Vtiger.
* Portions created by Vtiger are Copyright (C) Vtiger.
* All Rights Reserved.
************************************************************************************}

</div>
{literal}
<script type="text/ng-template" id="editRecordModal.template">
	<form class="form form-vertical" novalidate="novalidate" name="editForm">
		<div class="modal-header">
			<button type="button" class="close" ng-click="cancel()" title="Close">&times;</button>
			<h4 class="modal-title" ng-show="editRecord.id">{{'Edit'|translate}} {{ptitle}} - {{modalTitle}}</h4>
			<h4 class="modal-title" ng-show="!editRecord.id">{{'Add New'|translate}} {{moduleUiLabel}}</h4>
		</div>
		<div class="modal-body" scroll-me="{'height':'350px'}">
			<div class="form-group" ng-class="{'has-error':editForm.titleLabel.$error.required && submit}" ng-if="!disabledFields[labelField]">
				<label>{{recordTitleLabel}}
					<span class="text-danger">*</span>
				</label>
				<input type="text" class="form-control" name="titleLabel" ng-model="data[labelField]" ng-required="true">
			</div>
			<div class="form-group">
				<div class="row" style="margin-bottom:10px;" ng-repeat="editables in fields">
					<div class="col-sm-6 col-md-6 col-lg-6" ng-repeat="editable in editables">
						<ng-switch on="editable.type.name">
							<div ng-switch-when="picklist">
								<ng-form name="innerForm" ng-class="{'has-error':innerForm.name.$error.required && submit}">
									<label>{{editable.label}}</label>
									<span ng-show="{{editable.mandatory}}" class="text-danger mandatory-label">*</span>
									<select class="form-control" name="name" ng-model="data[$parent.editable.name]" ng-required="{{editable.mandatory}}" ng-options="picklistValue.value as picklistValue.label for picklistValue in editable.type.picklistValues" ng-disabled="disabledFields[$parent.editable.name]">
									</select>
								</ng-form>
							</div>
							<ng-switch on="editable.type.name">
								<div ng-switch-when="multipicklist">
									<ng-form name="innerForm" ng-class="{'has-error':innerForm.name.$error.required && submit}">
										<label>{{editable.label}}</label>
										<span ng-show="{{editable.mandatory}}" class="text-danger mandatory-label">*</span>
										<ui-select multiple name="name" ng-model="data[$parent.editable.name]" ng-required="{{editable.mandatory}}" portal-select ng-disabled="disabledFields[$parent.editable.name]">
											<ui-select-match>{{$item.label}}</ui-select-match>
											<ui-select-choices repeat="picklistValue in editable.type.picklistValues|propsFilter: {label: $select.search,value: $select.search} track by picklistValue.label">
												{{picklistValue.label}}
											</ui-select-choices>
										</ui-select>
									</ng-form>
								</div>
								<ng-switch on="editable.type.name">
									<div ng-switch-when="string">
										<ng-form name="innerForm" ng-class="{'has-error':innerForm.name.$error.required && submit}">
											<label>{{editable.label}}</label>
											<span ng-show="{{editable.mandatory}}" class="text-danger field-error mandatory-label">*</span>
											<input type="text" name="name" class="form-control" ng-model="data[$parent.editable.name]" ng-required="{{editable.mandatory}}" ng-disabled="disabledFields[editable.name]">
										</ng-form>
									</div>
									<ng-switch on="editable.type.name">
										<div ng-switch-when="integer">
											<ng-form name="innerForm" ng-class="{'has-error':(innerForm.name.$error.required && submit) || innerForm.name.$error.pattern}">
												<label>{{editable.label}}</label>
												<span ng-show="{{editable.mandatory}}" class="text-danger field-error mandatory-label">*</span>
												<input type="double" name="name" class="form-control" ng-model-options="{updateOn:'blur'}" ng-pattern="/^[\-\+\ ]?\d+$/" ng-trim="false" ng-model="data[$parent.editable.name]" ng-required="{{editable.mandatory}}" ng-disabled="disabledFields[$parent.editable.name]">
											</ng-form>
											<span ng-show="innerForm.name.$error.pattern" class="text-danger pull-right" translate="Please enter a integer value."></span>
										</div>
										<ng-switch on="editable.type.name">
											<div ng-switch-when="skype">
												<ng-form name="innerForm" ng-class="{'has-error':innerForm.name.$error.required && submit}">
													<label>{{editable.label}}</label>
													<span ng-show="{{editable.mandatory}}" class="text-danger field-error mandatory-label">*</span>
													<input type="text" name="name" class="form-control" ng-model="data[$parent.editable.name]" ng-required="{{editable.mandatory}}" ng-disabled="disabledFields[$parent.editable.name]">
												</ng-form>
											</div>
											<ng-switch on="editable.type.name">
												<div ng-switch-when="email">
													<ng-form name="innerForm" ng-class="{'has-error':(innerForm.name.$error.required && submit) || innerForm.name.$error.pattern}">
														<label>{{editable.label}}</label>
														<span ng-show="{{editable.mandatory}}" class="text-danger field-error mandatory-label">*</span>
														<input type="text" name="name" ng-model-options="{updateOn:'blur'}" ng-pattern='/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/' class="form-control"
														ng-trim="false" ng-model="data[$parent.editable.name]" ng-required="{{editable.mandatory}}" ng-disabled="disabledFields[$parent.editable.name]">
													</ng-form>
													<span ng-show="innerForm.name.$error.pattern" class="text-danger pull-right" translate="Please enter a valid E-mail address."></span>
												</div>
												<ng-switch on="editable.type.name">
													<div ng-switch-when="double">
														<ng-form name="innerForm" ng-class="{'has-error':(innerForm.name.$error.required && submit) || innerForm.name.$error.pattern}">
															<label>{{editable.label}}</label>
															<span ng-show="{{editable.mandatory}}" class="text-danger field-error mandatory-label">*</span>
															<input type="double" name="name" ng-model-options="{updateOn:'blur'}" ng-pattern="/^-?\d*(\.\d*)?$/" class="form-control" ng-model="data[$parent.editable.name]" ng-trim="false" ng-required="{{editable.mandatory}}" ng-disabled="disabledFields[$parent.editable.name]">
														</ng-form>
														<span ng-show="innerForm.name.$error.pattern" class="text-danger pull-right" translate="Please enter integer value."></span>
													</div>
													<ng-switch on="editable.type.name">
														<div ng-switch-when="phone">
															<ng-form name="innerForm" ng-class="{'has-error':innerForm.name.$error.required && submit}">
																<label>{{editable.label}}</label>
																<span ng-show="{{editable.mandatory}}" class="text-danger field-error  mandatory-label">*</span>
																<input type="text" name="name" class="form-control" ng-model="data[$parent.editable.name]" ng-required="{{editable.mandatory}}" ng-disabled="disabledFields[$parent.editable.name]">
															</ng-form>
														</div>
														<ng-switch on="editable.type.name">
															<div ng-switch-when="time">
																<ng-form name="innerForm" ng-class="{'has-error':innerForm.name.$error.required && submit}">
																	<label>{{editable.label}}</label>
																	<span ng-show="{{editable.mandatory}}" class="text-danger field-error mandatory-label">*</span>
																	<p class="input-group timepicker">
																		<input type="text" class="form-control" name="name" timepicker-popup minute-step="15" hour-step="1" ng-model="data[$parent.editable.name]" is-open="timemodel[$parent.editable.name]" enable-date="false" show-meridian="true" ng-required="{{editable.mandatory}}"
																		show-button-bar="false" ng-disabled="disabledFields[$parent.editable.name]" portal-time>
																		<span class="input-group-btn">
																			<button type="button" class="btn btn-default" ng-click="openTimePicker($event,$parent.editable.name)"><i class="glyphicon glyphicon-time"></i></button>
																		</span>
																	</p>
																</ng-form>
															</div>
															<ng-switch on="editable.type.name">
																<div ng-switch-when="currency">
																	<ng-form name="innerForm" ng-class="{'has-error':(innerForm.name.$error.required && submit) || innerForm.name.$error.pattern}">
																		<label>{{editable.label}}</label>
																		<span ng-show="{{editable.mandatory}}" class="text-danger field-error mandatory-label">*</span>
																		<div class="input-group">
																			<span class="input-group-addon">$</span>
																			<input type="text" name="name" ng-model-options="{updateOn:'blur'}" ng-pattern="/^\d*\.?\d*$/" class="form-control" ng-model="data[$parent.editable.name]" ng-trim="false" ng-required="{{editable.mandatory}}" ng-disabled="disabledFields[$parent.editable.name]">
																		</div>
																		<span ng-show="innerForm.name.$error.pattern" class="text-danger pull-right field-error" translate="Please enter positive numbers."></span>
																	</ng-form>
																</div>
																<ng-switch on="editable.type.name">
																	<div ng-switch-when="date">
																		<ng-form name="innerForm" ng-class="{'has-error':innerForm.name.$error.required && submit}">
																			<label>{{editable.label}}</label>
																			<span ng-show="{{editable.mandatory}}" class="text-danger field-error mandatory-label">*</span>
																			<p class="input-group datepicker">
																				<input type="text" class="form-control" name="name" datepicker-popup="yyyy-MM-dd" show-weeks="false" ng-model="data[$parent.editable.name]" is-open="datemodel[$parent.editable.name]" min-date="minDates[data.$parent.editable.name]" close-text="Close" ng-required="{{editable.mandatory}}"
																				show-button-bar="false" close-on-date-selection="true" ng-disabled="disabledFields[editable.name]" ng-disabled="disabledFields[$parent.editable.name]" portal-date>
																				<span class="input-group-btn">
																					<button type="button" class="btn btn-default" ng-click="openDatePicker($event,$parent.editable.name)" ng-disabled="disabledFields[editable.name]"><i class="glyphicon glyphicon-calendar"></i></button>
																				</span>
																			</p>
																		</ng-form>
																	</div>
																	<ng-switch on="editable.type.name">
																		<div ng-switch-when="url">
																			<ng-form name="innerForm" ng-class="{'has-error':(innerForm.name.$error.required && submit) || innerForm.name.$error.url}">
																				<label>{{editable.label}}</label>
																				<span ng-show="{{editable.mandatory}}" class="text-danger field-error mandatory-label">*</span>
																				<input type="url" name="name" class="form-control" ng-model-options="{updateOn:'blur'}" ng-model="data[$parent.editable.name]" ng-trim="false" ng-required="{{editable.mandatory}}" ng-disabled="disabledFields[$parent.editable.name]">
																			</ng-form>
																			<span ng-show="innerForm.name.$error.url" class="text-danger pull-right field-error" translate="Please enter a valid Url."></span>
																		</div>
																		<ng-switch on="editable.type.name">
																			<div ng-switch-when="boolean">
																				<div class="checkbox" style="padding:10px;margin-top:20px;">
																					<ng-form name="innerForm" ng-class="{'has-error':innerForm.name.$error.required && submit}">
																						<div style="font-weight:bold;margin-left:10px;">
																							<input type="checkbox" name="name" style="cursor:pointer;" ng-model="data[$parent.editable.name]" ng-required="{{editable.mandatory}}" ng-disabled="disabledFields[$parent.editable.name]">{{editable.label}}
																							<span ng-show="{{editable.mandatory}}" class="text-danger mandatory-label">*</span>
																						</div>
																					</ng-form>
																				</div>
																			</div>
																			<ng-switch on="editable.type.name">
																				<div ng-switch-when="reference">
																					<ng-form name="innerForm" ng-class="{'has-error':(innerForm.name.$error.required || innerForm.name.$error.editable)  && submit}">
																						<label>{{editable.label}}</label>
																						<span ng-show="{{editable.mandatory}}" class="text-danger field-error mandatory-label">*</span>
																						<input type="text" name="name" ng-model="data[$parent.editable.name]" typeahead="record as record.label for record in fetchReferenceRecords(editable.type.refersTo[0],$viewValue)" typeahead-min-length="3" typeahead-wait-ms="10" typeahead-editable="false"
																						class="form-control" placeholder="{{'Type 3 characters'|translate}}" typeahead-loading="loadingRecords" ng-required="{{editable.mandatory}}" ng-trim="false" ng-disabled="disabledFields[editable.name]">
																						<i ng-show="loadingRecords" class="glyphicon glyphicon-refresh"></i>
																					</ng-form>
																					<span ng-show="innerForm.name.$error.editable && submit" class="text-danger pull-right field-error" translate="Record not found."></span>
																				</div>
					</div>
				</div>
				<div class="row" ng-if="textFieldsEnabled">
					<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12" ng-repeat="editable in editableText">
						<div class="form-group">
							<ng-form name="innerForm" ng-class="{'has-error':innerForm.name.$error.required && submit}">
								<label>{{editable.label}}</label>
								<span ng-show="{{editable.mandatory}}" class="text-danger mandatory-label">*</span>
								<textarea msd-elastic class="form-control" name="name" style="resize:none;height:100px;" ng-model="data[editable.name]" ng-required="{{editable.mandatory}}" ng-disabled="disabledFields[$parent.editable.name]"></textarea>
							</ng-form>
						</div>
					</div>
				</div>
			</div>
		</div>
		</div>
		</div>
		</div>
		</div>
		</div>
		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-danger" ng-click="cancel()" translate="Cancel"></button>
			<button type="submit" class="btn btn-success" ng-click="save(editForm.$valid)" translate="Save"></button>
		</div>
	</form>
</script>
{/literal}
