{*+**********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.2
* ("License.txt"); You may not use this file except in compliance with the License
* The Original Code is: Vtiger CRM Open Source
* The Initial Developer of the Original Code is Vtiger.
* Portions created by Vtiger are Copyright (C) Vtiger.
* All Rights Reserved.
************************************************************************************}

{literal}
<div class="row">
	<div class="col-lg-1 col-md-1 col-sm-1 col-xs-1"></div>
	<div class="col-lg-10 col-md-10 col-sm-10 col-xs-10">
		<div class="container-fluid">
			<br>
			<div class="row">
				<div class="col-lg-8 col-md-8 col-sm-7 col-xs-7">
					<input type="text" class="form-control" ng-model="search" placeholder="{{'Search'|translate}}">
				</div>
				<div class="col-lg-2 col-md-2 hidden-sm hidden-xs">

				</div>
			</div>
			<br>
			<hr class="hrHeader">
			<br>
			<div class="row">
				<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
					<div class="container-fluid">
						<div class="row">
							<div class="col-lg-9 col-md-9 col-sm-12 col-xs-12 leftEditContent" style="padding-top:0;">
								<div class="row">
									<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
										<h4> {{'Top Questions'|translate}} </h4>
										<br>
										<div class="panel-group">
											<accordion close-others="oneAtATime">
												<accordion-group is-open="record.isOpen" ng-repeat="record in faqRecords">
													<accordion-heading style="white-space:pre-line;">
														<span class="text-primary" style="white-space:pre-line;" ng:bind-html="record.question"></span>
													</accordion-heading>
													<h5 class="panel-title" style="white-space:pre-line;" ng:bind-html="record.faq_answer"></h5>
													<div class="pull-right row form-inline">
														<div class="col-md-6 col-sm-6 col-xs-6 col-lg-6">
															<a class="text-primary" ng-click="fetchComments(record.id)" translate="ModComments"></a>
														</div>
														<div class="col-md-6 col-sm-6 col-xs-6 col-lg-6">
															<a class="text-primary" ng-click="fetchDocuments(record.id)">{{documentsModuleLabel}}</a>
														</div>

													</div>
												</accordion-group>
											</accordion>
										</div>
										<a ng-if="moreRecords" ng-click="loadFaqPage(faqPageNo)">{{'more'|translate}}...</a>
										<p ng-if="noFaq" class="text-muted">{{'No FAQs'|translate}}</p>
										<p ng-if="allLoaded && !moreRecords" class="text-muted">{{'No more FAQs'|translate}}</p>
									</div>
								</div>
							</div>
							<div class="col-lg-3 col-md-3 hidden-sm hidden-xs faqSection" ng-if="categoryExists">
								<h4> {{'Categories'|translate}} </h4>
								<ul class="nav">
									<li style="cursor: pointer;" ng-class="isFaqActive(category.value)" ng-click="sendCategory(category.value)" ng-repeat="category in faqCategories">
										<a class="break">{{category.label}}</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
			<br>
		</div>
	</div>
	<div class="col-lg-1 col-md-1 col-sm-1 col-xs-1"></div>
</div>
</div>

<script type="text/ng-template" id="faqRelatedComments.template">
	<div class="container-fluid">
		<div class="modal-header">
			<button type="button" class="close" ng-click="cancel()" title="Close">&times;</button>
			<h4 class="modal-title" translate="ModComments"></h4>
		</div>
		<div class="modal-body" scroll-me="{'height':'350px'}">
			<div class="row">
				<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
					<form ng-submit="addComment(commentForm.$valid,faqRecordId)" name="commentForm" novalidate="novalidate">
						<textarea msd-elastic style="resize:none;height:90px;" name="comment" ng-model="newcomment.commentcontent" class="form-control text-left" placeholder="{{'Add your comment here'|translate}}..." rows="3" ng-required="true"></textarea>
						<span ng-if="!commentForm.$valid && commentValidate" class="text-danger">This field is required.</span>
						<br>
						<button type="submit" ng-disabled="savingComment" class="btn btn-success pull-right">{{'Submit'|translate}}</button>
					</form>
				</div>
			</div>
			<div class="row">
				<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 comment-list">
					<div class="row " ng-repeat="comment in comments | orderBy:'createdtime':true |limitTo:comments.length">
						<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
							<p class="usertitle commnet-owner">
								<b class="uname" ng-if="comment.creator.label!=='' && !comment.customer.label">{{comment.creator.label}}&nbsp;</b>
								<b class="uname" ng-if="comment.creator.label!=='' && comment.customer.label">{{comment.customer.label}}&nbsp;</b>
								<small class="utime">{{comment.createdtime}}</small>
							</p>
							<p class="comment-content" style="white-space: pre-line;">{{comment.commentcontent}}</p>
                                                        <ul class="comment-docs">
                                                        <li ng-repeat=" attachment in comment.attachments"><a><small ng-if="attachment.filename" ng-click="downloadCommentFile('ModComments',comment.id,attachment.attachmentid)">{{attachment.filename}} <i class="glyphicon glyphicon-download-alt comment-document" ng-click="downloadCommentFile('ModComments',comment.id,attachment.attachmentid)"></i></small></a></li>
                                                        </ul>
						</div>
					</div>
					<a ng-if="!commentsLoaded && !noComments && record.Status.toUpperCase()!=='CLOSED'" ng-click="loadCommentsPage(commentPageNo)">{{'more'|translate}}...</a>
					<p ng-if="commentsLoaded" class="text-muted">{{'No more comments'|translate}}</p>
					<p ng-if="!commentsLoaded && noComments" class="text-muted">{{'No comments'|translate}}</p>
				</div>
			</div>
		</div>
	</div>
</script>
<script type="text/ng-template" id="faqRelatedDocuments.template">
	<div class="container-fluid">
		<div class="modal-header">
			<button type="button" class="close" ng-click="cancel()" title="Close">&times;</button>
			<h4 class="modal-title">{{documentsModuleLabel}}</h4>
		</div>
		<div class="modal-body" scroll-me="{'height':'350px'}">
			  <div class="alert alert-warning" style="margin: 2px 0;" ng-hide="documentsrecords">
			    {{'No records found.'|translate}}
			  </div>
			<div class="cp-table-container" ng-show="documentsrecords">
				<div class="table-responsive">
					<table class="table table-hover table-condensed table-detailed dataTable no-footer">
						<thead>
							<tr class="listViewHeaders">

								<th ng-hide="documentsheader=='id'" ng-repeat="documentsheader in documentsheaders" nowrap="" class="medium">
									<a href="javascript:void(0);" class="listViewHeaderValues" translate="{{documentsheader}}">{{documentsheader}}</a>
								</th>
								<th ng-hide="header=='id'" class="medium">
									<a class="listViewHeaderValues">{{'Actions'|translate}}</a>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr class="listViewEntries" ng-repeat="documentrecord in documentsrecords">

								<td ng-hide="documentsheader=='id'" ng-repeat="documentsheader in documentsheaders" class="listViewEntryValue medium">
									<ng-switch on="documentrecord[documentsheader].type">
										<a ng-href="index.php?module=Documents&view=Detail&id={{documentrecord.id}}"></a>
										<span ng-switch-default title="{{documentrecord[documentsheader]}}">{{documentrecord[documentsheader]|limitTo:25}}{{documentrecord[documentsheader].length > 25 ? '...' : ''}}</span>
									</ng-switch>
								</td>
								<td ng-hide="documentsheader=='id'" class="listViewEntryValue medium" nowrap="" style='cursor: pointer;'>
									<span ng-if="documentrecord.documentExists" class="btn btn-primary" ng-click="downloadFile('Documents',documentrecord.id,faqRecordId)">{{'Download'|translate}}</span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<a ng-if="!documentsLoaded && !noDocuments" ng-click="loadDocumentsPage(documentsPageNo)">{{'more'|translate}}...</a>
			<p ng-show="documentsrecords" ng-if="documentsLoaded" class="text-muted">{{'No more documents'|translate}}</p>
			<p ng-if="!documentsLoaded && noDocuments" class="text-muted">{{'No documents'|translate}}</p>
		</div>
	</div>
</script>
{/literal}
