angular.module('ui.bootstrap.timepicker', ['ui.bootstrap.position'])

.constant('timepickerConfig', {
  hourStep: 1,
  minuteStep: 1,
  showMeridian: true,
  meridians: null,
  readonlyInput: false,
  mousewheel: true
})

.controller('TimepickerController', ['$scope', '$attrs', '$parse', '$log', '$locale', 'timepickerConfig', function($scope, $attrs, $parse, $log, $locale, timepickerConfig) {
  var selected = new Date(),
      ngModelCtrl = { $setViewValue: angular.noop }, // nullModelCtrl
      meridians = angular.isDefined($attrs.meridians) ? $scope.$parent.$eval($attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;

  this.init = function( ngModelCtrl_, inputs ) {
    ngModelCtrl = ngModelCtrl_;
    ngModelCtrl.$render = this.render;

    var hoursInputEl = inputs.eq(0),
        minutesInputEl = inputs.eq(1);

    var mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$parent.$eval($attrs.mousewheel) : timepickerConfig.mousewheel;
    if ( mousewheel ) {
      this.setupMousewheelEvents( hoursInputEl, minutesInputEl );
    }

    $scope.readonlyInput = angular.isDefined($attrs.readonlyInput) ? scope.$parent.$eval($attrs.readonlyInput) : timepickerConfig.readonlyInput;
    this.setupInputEvents( hoursInputEl, minutesInputEl );
  };

  var hourStep = timepickerConfig.hourStep;
  if ($attrs.hourStep) {
    $scope.$parent.$watch($parse($attrs.hourStep), function(value) {
      hourStep = parseInt(value, 10);
    });
  }

  var minuteStep = timepickerConfig.minuteStep;
  if ($attrs.minuteStep) {
    $scope.$parent.$watch($parse($attrs.minuteStep), function(value) {
      minuteStep = parseInt(value, 10);
    });
  }

  // 12H / 24H mode
  $scope.showMeridian = timepickerConfig.showMeridian;
  if ($attrs.showMeridian) {
    $scope.$parent.$watch($parse($attrs.showMeridian), function(value) {
      $scope.showMeridian = !!value;

      if ( ngModelCtrl.$error.time ) {
        // Evaluate from template
        var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
        if (angular.isDefined( hours ) && angular.isDefined( minutes )) {
          selected.setHours( hours );
          refresh();
        }
      } else {
        updateTemplate();
      }
    });
  }

  // Get $scope.hours in 24H mode if valid
  function getHoursFromTemplate ( ) {
    var hours = parseInt( $scope.hours, 10 );
    var valid = ( $scope.showMeridian ) ? (hours > 0 && hours < 13) : (hours >= 0 && hours < 24);
    if ( !valid ) {
      return undefined;
    }

    if ( $scope.showMeridian ) {
      if ( hours === 12 ) {
        hours = 0;
      }
      if ( $scope.meridian === meridians[1] ) {
        hours = hours + 12;
      }
    }
    return hours;
  }

  function getMinutesFromTemplate() {
    var minutes = parseInt($scope.minutes, 10);
    return ( minutes >= 0 && minutes < 60 ) ? minutes : undefined;
  }

  function pad( value ) {
    return ( angular.isDefined(value) && value.toString().length < 2 ) ? '0' + value : value;
  }

  // Respond on mousewheel spin
  this.setupMousewheelEvents = function( hoursInputEl, minutesInputEl ) {
    var isScrollingUp = function(e) {
      if (e.originalEvent) {
        e = e.originalEvent;
      }
      //pick correct delta variable depending on event
      var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
      return (e.detail || delta > 0);
    };

    hoursInputEl.bind('mousewheel wheel', function(e) {
      $scope.$apply( (isScrollingUp(e)) ? $scope.incrementHours() : $scope.decrementHours() );
      e.preventDefault();
    });

    minutesInputEl.bind('mousewheel wheel', function(e) {
      $scope.$apply( (isScrollingUp(e)) ? $scope.incrementMinutes() : $scope.decrementMinutes() );
      e.preventDefault();
    });

  };

  this.setupInputEvents = function( hoursInputEl, minutesInputEl ) {
    if ( $scope.readonlyInput ) {
      $scope.updateHours = angular.noop;
      $scope.updateMinutes = angular.noop;
      return;
    }

    var invalidate = function(invalidHours, invalidMinutes) {
      ngModelCtrl.$setViewValue( null );
      ngModelCtrl.$setValidity('time', false);
      if (angular.isDefined(invalidHours)) {
        $scope.invalidHours = invalidHours;
      }
      if (angular.isDefined(invalidMinutes)) {
        $scope.invalidMinutes = invalidMinutes;
      }
    };

    $scope.updateHours = function() {
      var hours = getHoursFromTemplate();

      if ( angular.isDefined(hours) ) {
        selected.setHours( hours );
        refresh( 'h' );
      } else {
        invalidate(true);
      }
    };

    hoursInputEl.bind('blur', function(e) {
      if ( !$scope.validHours && $scope.hours < 10) {
        $scope.$apply( function() {
          $scope.hours = pad( $scope.hours );
        });
      }
    });

    $scope.updateMinutes = function() {
      var minutes = getMinutesFromTemplate();

      if ( angular.isDefined(minutes) ) {
        selected.setMinutes( minutes );
        refresh( 'm' );
      } else {
        invalidate(undefined, true);
      }
    };

    minutesInputEl.bind('blur', function(e) {
      if ( !$scope.invalidMinutes && $scope.minutes < 10 ) {
        $scope.$apply( function() {
          $scope.minutes = pad( $scope.minutes );
        });
      }
    });

  };

  this.render = function() {
    var date = ngModelCtrl.$modelValue ? new Date( ngModelCtrl.$modelValue ) : null;

    if ( isNaN(date) ) {
      ngModelCtrl.$setValidity('time', false);
      $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
    } else {
      if ( date ) {
        selected = date;
      }
      makeValid();
      updateTemplate();
    }
  };

  // Call internally when we know that model is valid.
  function refresh( keyboardChange ) {
    makeValid();
    ngModelCtrl.$setViewValue( new Date(selected) );
    updateTemplate( keyboardChange );
  }

  function makeValid() {
    ngModelCtrl.$setValidity('time', true);
    $scope.invalidHours = false;
    $scope.invalidMinutes = false;
  }

  function updateTemplate( keyboardChange ) {
    var hours = selected.getHours(), minutes = selected.getMinutes();

    if ( $scope.showMeridian ) {
      hours = ( hours === 0 || hours === 12 ) ? 12 : hours % 12; // Convert 24 to 12 hour system
    }

    $scope.hours = keyboardChange === 'h' ? hours : pad(hours);
    $scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
    $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
  }

  function addMinutes( minutes ) {
    var dt = new Date( selected.getTime() + minutes * 60000 );
    selected.setHours( dt.getHours(), dt.getMinutes() );
    refresh();
  }

  $scope.incrementHours = function() {
    addMinutes( hourStep * 60 );
  };
  $scope.decrementHours = function() {
    addMinutes( - hourStep * 60 );
  };
  $scope.incrementMinutes = function() {
    addMinutes( minuteStep );
  };
  $scope.decrementMinutes = function() {
    addMinutes( - minuteStep );
  };
  $scope.toggleMeridian = function() {
    addMinutes( 12 * 60 * (( selected.getHours() < 12 ) ? 1 : -1) );
  };
}])

.directive('timepicker', function () {
  return {
    restrict: 'EA',
    require: ['timepicker', '?^ngModel'],
    controller:'TimepickerController',
    replace: true,
    scope: {},
    templateUrl: 'template/timepicker/timepicker.html',
    link: function(sscope, element, attrs, ctrls) {
      var timepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if ( ngModelCtrl ) {
        timepickerCtrl.init( ngModelCtrl, element.find('input') );
      }
    }
  };
})

.constant('timepickerPopupConfig', {
  showMeridian: true,
  appendToBody: false
})

.directive('timepickerPopup', ['$document', '$compile', '$position', 'dateFilter', 'timepickerPopupConfig', function ($document, $compile, $position, dateFilter, timepickerPopupConfig) {
  return {
    restrict: 'EA',
    priority: 1,
    require: 'ngModel',
    scope: {
      isOpen: '=?'
    },
    link: function (scope, element, attrs, ngModel) {
      var appendToBody = angular.isDefined(attrs.timepickerAppendToBody) ? scope.$parent.$eval(attrs.timepickerAppendToBody) : timepickerPopupConfig.appendToBody,
        popupEl = angular.element('<div timepicker-popup-wrap> <div timepicker></div> </div>').attr({'ng-model': 'time', 'ng-change': 'pickerChange()'}),
        showMeridian = angular.isDefined(attrs.showMeridian) ? scope.$parent.$eval(attrs.showMeridian) : timepickerPopupConfig.showMeridian,
        timeFormat = showMeridian ? 'hh:mm a' : 'HH:mm';

      function cameltoDash(string) {
        return string.replace(/([A-Z])/g, function ($1) {
          return '-' + $1.toLowerCase();
        });
      }

      // timepicker element
      var timepickerEl = angular.element(popupEl.children()[0]);
      if (attrs.timepickerOptions) {
        angular.forEach(scope.$parent.$eval(attrs.timepickerOptions), function (value, option) {
          timepickerEl.attr(cameltoDash(option), value);
        });
      }

      ngModel.$render = function () {
        element.val(ngModel.$viewValue ? dateFilter(ngModel.$viewValue, timeFormat) : '');
        scope.time = ngModel.$modelValue;
      };

      element.bind('input change keyup', function () {
        scope.$apply(function () {
          scope.time = ngModel.$modelValue;
        });
      });

      var documentClickBind = function () {
        if (scope.isOpen && event.target !== element[0]) {
          scope.$apply(function () {
            scope.isOpen = false;
          });
        }
      };

      var openCalendar = function () {
        scope.$apply(function () {
          scope.isOpen = true;
        });
      };

      scope.$watch('isOpen', function (value) {
        if (value) {
          scope.position = appendToBody ? $position.offset(element) : $position.position(element);
          scope.position.top = scope.position.top + element.prop('offsetHeight');

          $document.bind('click', documentClickBind);
          element.unbind('focus', openCalendar);
          element[0].focus();
        } else {
          $document.unbind('click', documentClickBind);
          element.bind('focus', openCalendar);
        }
      });

      scope.pickerChange = function () {
        ngModel.$setViewValue(scope.time);
        ngModel.$render();
      };

      ngModel.$parsers.unshift(function parseTime(viewValue) {
        if (!viewValue) {
          ngModel.$setValidity('time', true);
          return null;
        } else if (angular.isDate(viewValue)) {
          ngModel.$setValidity('time', true);
          return viewValue;
        } else if (angular.isString(viewValue)) {
          var isAM = (viewValue.indexOf('AM') !== -1),
              isPM = (viewValue.indexOf('PM') !== -1),
              colon = viewValue.indexOf(':'),
              meridians = isAM || isPM,
              hour = parseInt(viewValue.substring(0, colon), 10),
              minute = parseInt(viewValue.substring(colon + 1), 10),
              newTime = new Date();
          if (minute >= 60 && minute < 0) {
            ngModel.$setValidity('time', false);
            return undefined;
          }
          if (meridians && (hour > 0 && hour < 13)) {
            if (isPM) {
              if (hour !== 12) {
                hour += 12;
              }
            } else if (isAM) {
              if (hour === 12) {
                hour = 0;
              }
            }
            newTime.setHours(hour);
            newTime.setMinutes(minute);
          } else if (hour > -1 && hour < 24) {
            newTime.setHours(hour);
            newTime.setMinutes(minute);
          }
          ngModel.$setValidity('time', true);
          return newTime;
        } else {
          ngModel.$setValidity('time', false);
          return undefined;
        }
      });

      var $popup = $compile(popupEl)(scope);
      if (appendToBody) {
        $document.find('body').append($popup);
      } else {
        element.after($popup);
      }

      scope.$on('$destroy', function () {
        $popup.remove();
        element.unbind('focus', openCalendar);
        $document.unbind('click', documentClickBind);
      });
    }
  };
}])

.directive('timepickerPopupWrap', function() {
  return {
    restrict:'EA',
    replace: true,
    transclude: true,
    templateUrl: 'template/timepicker/popup.html',
    link:function (scope, element, attrs) {
      element.bind('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
      });
    }
  };
});
