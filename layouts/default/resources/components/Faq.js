/*+**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 ************************************************************************************/

function Faq_IndexView_Component( $scope, $api, $webapp, $translatePartialLoader, $filter, $http, $modal ) {
	angular.extend( this, new Portal_IndexView_Component( $scope, $api, $webapp ) );
	if ( $translatePartialLoader !== undefined ) {
		$translatePartialLoader.addPart( 'home' );
		$translatePartialLoader.addPart( 'Faq' );
	}

	var params = {};
	var url = purl();
	var recordId = url.param( 'record' );
	if ( recordId !== undefined ) {
		var stateObject = {};
		var title = "Portal";
		var newUrl = "index.php?module=Faq";
		history.pushState( stateObject, title, newUrl );
	}
	$scope.oneAtATime = true;
	$scope.open = false;
	$scope.faqCategories = null;
	$scope.faqRecords = null;
	$scope.faqPageNo = 0;
	$scope.search = '';
	$scope.searchResultLength = 0;
	var params = {
		'field': 'faqcategories',
		'page': $scope.faqPageNo
	}

	$scope.sendCategory = function ( faqcategory ) {
		$scope.loadCategory = faqcategory;
		recordId = undefined;
		params = {
			'field': 'faqcategories',
			'value': faqcategory,
			'page': 0
		}
		$scope.loadRecords( params );
	};

	$scope.faqFilter = function () {}

	$scope.loadRecords = function ( params ) {
		$webapp.busy();
		var availableModules = JSON.parse( localStorage.getItem( 'modules' ) );
		$scope.documentsModuleLabel = availableModules.Documents.uiLabel;
		if ( params === undefined ) {
			params = {
				'page': $scope.faqPageNo
			};
		}
		$api.get( 'Faq/FetchRecords', {
				q: params,
				label: 'Faq',
				language: $scope.$parent.language
			} )
			.success( function ( result ) {
				$webapp.busy( false );
				$scope.allLoaded = true;
				$scope.faqsCount = result.count;
				$scope.noOfPages = Math.ceil( $scope.faqsCount / 10 );
				if ( result.records.length == 0 || result.count == 0 ) {
					$scope.noFaq = true;
					$scope.moreRecords = false;
					$scope.allLoaded = true;
				}
				if ( params[ 'page' ] == 0 && result.count != 0 ) {
					$scope.faqEdits = result.edits;
					$scope.currentPage = $scope.faqPageNo;
					if ( $scope.noOfPages >= 1 ) {
						$scope.moreRecords = true;
					} else if ( $scope.noOfPages == 1 && $scope.faqPageNo == 0 ) {
						$scope.moreRecords = false;
					} else if ( $scope.noFaq && result.count == 0 ) {
						$scope.allLoaded = false;
						$scope.noFaq = true;
					}
					angular.forEach( result.records, function ( record, i ) {
						if ( record.id == recordId && recordId !== undefined ) {
							record.isOpen = true;
						} else {
							record.isOpen = false;
						}
					} )
					$scope.faqRecords = result.records;
				} else {
					var faqRecords = result.records;
					if ( faqRecords.length == 0 || faqRecords.length < 10 ) {
						$scope.moreRecords = false;
						$scope.noFaq = false;
					}
					if ( $scope.faqPageNo == $scope.noOfPages - 1 ) {
						$scope.allLoaded = true;
					}
					$scope.faqPageNo = params.page;
					angular.forEach( faqRecords, function ( faqRec ) {
						$scope.faqRecords.push( faqRec );
					} );
				}
				var faqCategories = result.faqCategories;
				if ( faqCategories.length > 0 ) {
					$scope.categoryExists = true;
					$scope.faqCategories = result.faqCategories;
				} else {
					$scope.categoryExists = false;
				}
			} );
	}

	$scope.loadFaqPage = function ( pageNo ) {
		var params = {
			'page': pageNo + 1
		}
		if ( $scope.loadCategory !== undefined ) {
			params.field = 'faqcategories';
			params.value = $scope.loadCategory;
		}
		$scope.loadCategory = undefined;
		$scope.loadRecords( params );
	}

	$scope.openAny = true;

	$scope.$watch( 'search', function ( newvalue, oldvalue ) {
		if ( newvalue !== oldvalue && ( newvalue.length > oldvalue.length || $scope.searchResultLength === 0 ) && newvalue.length >= 3 ) {
			setTimeout( function () {
				$scope.searchFaqs( newvalue );
			}, 10 );
		} else if ( newvalue === '' && oldvalue !== '' ) {
			$scope.loadRecords();
			$scope.loadCategory = undefined;
		}
	} );

	$scope.searchFaqs = function ( query ) {
		var filteredFaqs = [];
		$scope.moreRecords = false;
		$scope.loadCategory = undefined;
		return $http.get( "index.php", {
				params: {
					module: $scope.module,
					searchKey: query,
					api: 'SearchFaqs'
				}
			} )
			.then( function ( response ) {
				$webapp.busy( false );
				var data = response.data.result;
				angular.forEach( data, function ( faqRecord, i ) {
					if ( i !== 'language' ) {
						if ( i == 0 ) {
							faqRecord.isOpen = true;
						} else {
							faqRecord.isOpen = false;
						}
						filteredFaqs.push( faqRecord );
					}
				} );
				$scope.faqRecords = filteredFaqs;
				$scope.searchResultLength = filteredFaqs.length;
			} )
	}

	$scope.isFaqActive = function ( category ) {
		if ( category === $scope.loadCategory ) {
			return 'faq-active';
		}
	}

	$scope.fetchComments = function ( id ) {
		var faqRecordId = id;
		var modalInstance = $modal.open( {
			templateUrl: 'faqRelatedComments.template',
			controller: Faq_Comments_Controller,
			backdrop: 'static',
			keyboard: 'false',
			size: 'lg',
			resolve: {
				recordId: function () {
					return faqRecordId;
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
				language: function () {
					return $scope.$parent.language;
				}
			}
		} );
	}

	$scope.fetchDocuments = function ( id ) {
		var faqRecordId = id;
		var modalInstance = $modal.open( {
			templateUrl: 'faqRelatedDocuments.template',
			controller: Faq_Documents_Controller,
			backdrop: 'static',
			keyboard: 'false',
			size: 'lg',
			resolve: {
				recordId: function () {
					return faqRecordId;
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
				language: function () {
					return $scope.$parent.language;
				}
			}
		} );
	}

}


function Faq_Comments_Controller( $scope, $webapp, $api, module, recordId, $modalInstance ) {
	$scope.comments = [];
	$scope.newcomment = {};
	$scope.faqRecordId = recordId;
	$scope.loadComments = function ( pageNo ) {
		$scope.commentsLoaded = false;
		$scope.noComments = false;
		if ( pageNo === undefined )
			$scope.commentPageNo = 0;
		else
			$scope.commentPageNo = pageNo

		$scope.parentId = '';
		var params = {
			'relatedModule': 'ModComments',
			'module': 'Faq',
			'id': recordId,
			'relatedModuleLabel': 'ModComments',
			'page': $scope.commentPageNo
		}
		$api.get( 'Faq' + '/FetchRelatedRecords', params )
			.success( function ( comments ) {
				var comments = comments.comments;
				if ( comments === null ) {
					$scope.noComments = true;
					$scope.commentsLoaded = false;
				}
				if ( comments !== null )
					var commentCount = comments.length;
				var commentList = [];
				if ( $scope.commentPageNo == 0 ) {
					angular.forEach( comments, function ( comment ) {
						commentList.push( comment );
					} );
					var scopeComments = angular.copy( commentList );
					$scope.comments = scopeComments;
					if ( commentCount < 10 ) {
						$scope.commentsLoaded = true;
					}
				} else {
					if ( comments === null )
						$scope.commentsLoaded = true;
					var newCommentList = [];
					angular.forEach( comments, function ( comment ) {
						if ( angular.isObject( comment ) )
							$scope.comments.push( comment );
					} );
					if ( commentCount < 10 ) {
						$scope.commentsLoaded = true;
					}
				}
			} );
	}
	$scope.loadComments();

	$scope.addComment = function ( validity, faqId ) {
		$scope.parentId = '';
		$scope.newcomment.parentId = $scope.parentId;
		$scope.comments = $scope.comments || {};
		$scope.newcomment.related_to = faqId;
		if ( validity ) {
			$scope.commentValidate = false;
			$scope.savingComment = true;
			$webapp.busy();
			$api.post( 'ModComments/AddComment', {
					comment: $scope.newcomment
				} )
				.success( function ( comment ) {
					$webapp.busy( false );
					if ( $scope.comments !== null ) {
						$scope.comments = $scope.comments || [];
						$scope.loadComments( $scope.commentsPageNo )
						$scope.comments.unshift( comment );
					} else {
						$scope.comments.push( comment );
						$scope.savingComment = false;
					}
					$scope.newcomment = {};
					$scope.savingComment = false;
				} );
		} else {
			$scope.commentValidate = true;
			return false;
		}
	};

	$scope.loadCommentsPage = function ( pageNo ) {
		$scope.loadComments( pageNo + 1 );
		$webapp.busy( false );
	}

	$scope.cancel = function () {
		$modalInstance.dismiss( 'cancel' );
	}

    $scope.downloadCommentFile = function (module, commentId, attachmentId) {
        window.location.href = 'index.php?module=' + module + '&api=DownloadFile&recordId=' + commentId + "&attachmentId=" + attachmentId;
    };
}

function Faq_Documents_Controller( $scope, $webapp, $api, module, recordId, $modalInstance ) {
	$scope.faqRecordId = recordId;
	var availableModules = JSON.parse( localStorage.getItem( 'modules' ) );
	$scope.documentsModuleLabel = availableModules.Documents.uiLabel;
	$scope.loadDocuments = function ( pageNo ) {
		if ( pageNo === undefined ) {
			$scope.documentsPageNo = 0;
		} else {
			$scope.documentsPageNo = pageNo
		}
		var params = {
			'relatedModule': 'Documents',
			'id': recordId,
			'relatedModuleLabel': 'Documents',
			'page': $scope.documentsPageNo,
			'prentModule': 'Faq'
		}
		$api.get( 'Faq' + '/FetchRelatedRecords', params )
			.success( function ( result ) {
				// $webapp.busy(false);
				$scope.documentsLoaded = false;
				$scope.noDocuments = false;
				var documentsCount = result.records.length;
				if ( documentsCount === 0 ) {
					$scope.noDcouments = true;
					$scope.documentsLoaded = false;
				}
				if ( $scope.documentsPageNo === 0 ) {
					$scope.documentsrecords = result.records;
					$scope.documentsheaders = result.headers;
					if ( documentsCount < 10 ) {
						$scope.documentsLoaded = true;
					}
				} else {
					if ( documentsCount === 0 )
						$scope.documentsLoaded = true;
					var documentsRecords = angular.copy( result.records )
					angular.forEach( documentsRecords, function ( documentRecord ) {
						$scope.documentsrecords.push( documentRecord )
					} );
					if ( documentsCount < 10 ) {
						$scope.documentsLoaded = true;
					}
				}
			} );
	}

	$scope.loadDocuments();

	$scope.loadDocumentsPage = function ( pageNo ) {
		$scope.loadDocuments( pageNo + 1 );
		$webapp.busy( false );
	}

	$scope.downloadFile = function ( module, recordId, parentId ) {
		window.location.href = 'index.php?module=' + module + '&api=DownloadFile&recordId=' + recordId + "&parentId=" + parentId + '&parentModule=Faq';
	};
        
	$scope.cancel = function () {
		$modalInstance.dismiss( 'cancel' );
	}
}
