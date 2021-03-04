/*+**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 ************************************************************************************/

/**
 * Globals
 */
function parseBool(input) {
	if (typeof input === 'string' && input.toLowerCase() == 'true')
		return true;
	if (input === true)
		return true;
	return (parseInt(input) > 0);
}

/**
 * AngularJS
 */
window.module = angular.module('portalapp', ['ui.bootstrap', 'ngProgress', 'monospaced.elastic', 'pascalprecht.translate', 'modelOptions', 'ui.select', 'ui.bootstrap.timepicker', 'ngSanitize', 'ngCsv', 'xeditable', 'ckeditor']);

window.module.filter('unsafe', function ($sce) {
	return function (val) {
		return $sce.trustAsHtml(val);
	};
});

window.module.filter('orderModulesBy', function () {
	return function (modules, attribute, reverse) {
		var sorted = [];
		angular.forEach(modules, function (module) {
			if (!angular.isObject(module)) {
				return;
			}
			sorted.push(module);
		});
		sorted.sort(function (a, b) {
			return (parseInt(a.order) > parseInt(b.order) ? 1 : -1);
		});

		if (reverse)
			sorted.reverse();
		return sorted;
	}
});


window.module.factory('$deferred', function ($q) {

	return {
		create: function () {
			// $q.promise does not provide ("then" callback)
			// we try to implement by pushing error and result to "then" callback.
			var deferred = $q.defer();

			// Backup actual then handler, to provide customized promise methods (then, success, error)
			var deferredThen = deferred.promise.then;

			// Customize handlers
			var thenFn = function () {
			}, successFn = null, errorFn = null;
			deferred.promise.success = function (fn) {
				successFn = fn;
			}
			deferred.promise.error = function (fn) {
				errorFn = fn;
			}
			deferred.promise.then = function (fn) {
				thenFn = fn;
			}

			deferredThen(function (result) {
				successFn ? successFn(result) : thenFn(null, result);
			}, function (err) {
				errorFn ? errorFn(err) : thenFn(err, null);
			});

			return deferred;
		}
	}

});

window.module.factory('$api', function ($deferred, $http) {
	var APIBASE = 'index.php';

	function _invoke(method, path, params) {
		// Derive target module & api through path
		var pathParts = path.split('/');
		if (typeof params == 'undefined')
			params = {};
		params.module = pathParts.shift();
		if (pathParts.length)
			params.api = pathParts.shift();

		var options = {
			method: method,
			url: APIBASE
		}
		if (params) {
			if (method == 'GET')
				options.params = params;
			else
				options.data = params;
		}
		var deferred = $deferred.create();
		$http(options)
				.success(function (data, status, headers, config) {
					data.success ?
							deferred.resolve(data.result, null) :
							deferred.reject(data.error ? data.error.message : "No response");
				})
				.error(function (data, status, headers, config) {
					deferred.reject(data ? data : "ERR: " + status);
				});
		return deferred.promise;
	}
	return {
		// http://docs.angularjs.org/api/ng.$http
		'get': function (path, params) {
			return _invoke.apply(null, ['GET', path, params]);
		},
		'post': function (path, params) {
			return _invoke.apply(null, ['POST', path, params]);
		},
	}

});

window.module.factory('$webapp', function ($deferred, $api, ngProgress) {
	ngProgress.color('#10cfbd');
	ngProgress.height('3px');
	var busyIndicator = jQuery('#busy-indicator');

	function busy(on) {
		if (typeof on == 'undefined')
			on = true;
		if (busyIndicator.length) {
			if (on) {
				busyIndicator.removeClass('hide')
						.show();
			} else {
				busyIndicator.addClass('hide')
						.hide();
			}
		} else {
			if (on) {
				ngProgress.reset();
				ngProgress.start();
			} else {
				ngProgress.complete();
			}
		}
	}
	return {
		busy: busy,
	}
});

window.module.directive('hpSelectric', function ($timeout, $rootScope) {
	return {
		restrict: 'E',
		scope: {
			items: '=',
			ngModel: '='
		},
		replace: true,
		template: '<select id="cn" class="col-lg-12 col-md-12 col-sm-12 col-xs-12" ng-options="item.label for item in items"></select>',
		link: function (scope, element, attrs) {
		},
		compile: function (scope, element, attrs) {
			return {
				pre: function (scope, element, attrs, ngModel) {
					scope.$watch('items', function (v) {
						if (v) {
							if (element.context.nodeName == 'CN-SELECTRIC') {
								jQuery(function () {
									jQuery(element)
											.selectric();
								})
							}
						}
					})
				},
				post: function (scope, element) {
					scope.$watch('items', function (v) {
						if (v) {
							jQuery(function () {
								jQuery(element)
										.selectric('refresh');
							})
						}
					})
				}
			}
		},
		controller: function ($scope, $element, $attrs) {
		}
	}
});

window.module.directive('scrollMe', function () {
	return {
		restrict: 'A',
		replace: true,
		controller: function ($scope, $element, $attrs) {
		},
		link: function (scope, element, attrs) {
		},
		compile: function () {
			return function (scope, elem, attrs) {
				var option = scope.$eval(attrs.scrollMe);
				$(elem)
						.slimScroll({
							height: option.height,
							alwaysVisible: true
						});
			}
		}
	}
});

window.module.directive('fileInput', ['$parse', function ($parse) {

		return {
			restrict: 'A',
			link: function (scope, elem, attrs) {
				elem.bind('change', function () {
					if (elem[ 0 ].files[ 0 ].size / (1024 * 1024) > (25)) {
						scope.message = true;
						scope.fileSize = (elem[ 0 ].files[ 0 ].size) / (1024 * 1024);
					} else {
						scope.message = false;
					}
					$parse(attrs.fileInput)
							.assign(scope, elem[ 0 ].files);
					scope.$apply();
				});
			}
		};
	}]);


window.module.factory('sharedModalService', function ($rootScope) {

	var sharedService = {};
	sharedService.prepForModal = function (modal) {
		this.modal = modal;
		this.loadModal();
	}
	sharedService.loadModal = function () {
		$rootScope.$broadcast('editRecordModal' + this.modal + '.Template');
	}
	sharedService.loadService = function (service) {
		$rootScope.$broadcast('service' + service);
	}
	return sharedService;
})

window.module.config(function ($translateProvider, $translatePartialLoaderProvider) {
	$translateProvider.useLoader('$translatePartialLoader', {
		urlTemplate: 'i18n/{part}/{lang}.json'
	});
	$translateProvider.preferredLanguage("ja_jp");
	$translateProvider.fallbackLanguage("ja_jp");
});

window.module.run(function ($rootScope, $translate, editableOptions) {
	$rootScope.$on('$translatePartialLoaderStructureChanged', function () {
		$translate.refresh();
	});
	editableOptions.theme = 'bs3';
});

window.module.directive('portalDate', function (dateFilter, $parse) {
	return {
		restrict: 'EAC',
		require: '?ngModel',
		link: function (scope, element, attrs, ngModel, ctrl) {
			ngModel.$parsers.push(function (viewValue) {
				return dateFilter(viewValue, 'yyyy-MM-dd');
			});
		}
	}
});

window.module.directive("autofill", function () {
	return {
		require: "ngModel",
		link: function (scope, element, attrs, ngModel) {
			scope.$on("autofill:update", function () {
				ngModel.$setViewValue(element.val());
			});
		}
	}
});

window.module.filter('propsFilter', function () {
	return function (items, props) {
		var out = [];

		if (angular.isArray(items)) {
			items.forEach(function (item) {
				var itemMatches = false;

				var keys = Object.keys(props);
				for (var i = 0; i < keys.length; i++) {
					var prop = keys[ i ];
					var text = props[ prop ].toLowerCase();
					if (item[ prop ].toString()
							.toLowerCase()
							.indexOf(text) !== -1) {
						itemMatches = true;
						break;
					}
				}

				if (itemMatches) {
					out.push(item);
				}
			});
		} else {
			// Let the output be the input untouched
			out = items;
		}

		return out;
	};
});
