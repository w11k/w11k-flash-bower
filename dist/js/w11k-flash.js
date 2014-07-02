/**
 * w11k-flash - v0.1.3 - 2014-07-02
 * https://github.com/w11k/w11k-flash
 *
 * Copyright (c) 2014 WeigleWilczek GmbH
 */
"use strict";

angular.module("w11k.flash", []);

angular.module("w11k.flash").factory("swfobject", [ "$window", function($window) {
    return $window.swfobject;
} ]);

angular.module("w11k.flash").factory("w11kFlashRegistry", [ function() {
    var flashIdPrefix = "w11k-flash-id-";
    var flashIdCounter = 0;
    var flashMap = {};
    return {
        getFlashId: function() {
            return flashIdPrefix + flashIdCounter++;
        },
        registerFlash: function(flashId, flashObject) {
            flashMap[flashId] = flashObject;
        },
        unregisterFlash: function(flashId) {
            delete flashMap[flashId];
        },
        getFlash: function(flashId) {
            return flashMap[flashId];
        }
    };
} ]);

angular.module("w11k.flash").run([ "$window", "w11kFlashRegistry", function($window, w11kFlashRegistry) {
    if (angular.isFunction($window.w11kFlashIsReady) === false) {
        $window.w11kFlashIsReady = function(flashId) {
            var flash = w11kFlashRegistry.getFlash(flashId);
            if (angular.isDefined(flash)) {
                flash.deferred.resolve(flash.object);
            } else {
                throw new Error("unknown flashId");
            }
        };
    }
} ]);

angular.module("w11k.flash").run([ "$window", "w11kFlashRegistry", function($window, w11kFlashRegistry) {
    if (angular.isFunction($window.w11kFlashCall) === false) {
        $window.w11kFlashCall = function(flashId, expression, locals) {
            var flash = w11kFlashRegistry.getFlash(flashId);
            if (angular.isDefined(flash)) {
                var scope = flash.element.scope();
                var result = scope.$eval(expression, locals);
                scope.$apply(function() {});
                return result;
            } else {
                throw new Error("unknown flashId");
            }
        };
    }
} ]);

angular.module("w11k.flash").constant("w11kFlashConfig", {
    templateUrl: "w11k-flash.tpl.html",
    swfObject: {
        minFlashVersion: "14.0.0",
        width: 800,
        height: 600
    }
});

angular.module("w11k.flash").directive("w11kFlash", [ "swfobject", "$window", "$q", "w11kFlashConfig", "$timeout", "w11kFlashRegistry", function(swfobject, $window, $q, w11kFlashConfig, $timeout, w11kFlashRegistry) {
    var deepMerge = function(destination, source) {
        for (var property in source) {
            if (source[property] && source[property].constructor && source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                deepMerge(destination[property], source[property]);
            } else {
                destination[property] = source[property];
            }
        }
        return destination;
    };
    return {
        restrict: "EA",
        templateUrl: w11kFlashConfig.templateUrl,
        link: function(scope, element, attrs) {
            var flashContainer = angular.element(element[0].querySelector(".w11k-flash-container"));
            var flashElement = angular.element(element[0].querySelector(".w11k-flash-element"));
            flashElement.remove();
            var included = false;
            scope.$watch(attrs.w11kFlashVisible, function(visible) {
                if (visible && included === false) {
                    includeFlash();
                    included = true;
                }
                if (visible) {
                    element.css("visibility", "visible");
                    element.css("height", "auto");
                    element.css("width", "auto");
                } else {
                    element.css("visibility", "hidden");
                    element.css("height", "0");
                    element.css("width", "0");
                }
            });
            var includeFlash = function() {
                var customConfig = scope.$eval(attrs.w11kFlash);
                var flashId = w11kFlashRegistry.getFlashId();
                var config = {
                    flashvars: {},
                    params: {},
                    attributes: {}
                };
                deepMerge(config, w11kFlashConfig.swfObject);
                deepMerge(config, customConfig);
                config.flashvars.w11kFlashId = flashId;
                flashContainer.append(flashElement);
                flashElement.attr("id", flashId);
                if (swfobject.hasFlashPlayerVersion(config.minFlashVersion)) {
                    flashElement.css("min-height", config.height);
                    flashElement.css("min-width", config.width);
                    var callback = function(event) {
                        var deferred = $q.defer();
                        w11kFlashRegistry.registerFlash(flashId, {
                            deferred: deferred,
                            object: event.ref,
                            element: element
                        });
                        scope.$on("$destroy", function() {
                            w11kFlashRegistry.unregisterFlash(flashId);
                        });
                        if (angular.isFunction(config.callback)) {
                            config.callback(deferred.promise);
                        }
                    };
                    swfobject.embedSWF(config.swfUrl, flashId, "" + config.width, "" + config.height, config.minFlashVersion, false, config.flashvars, config.params, config.attributes, callback);
                }
            };
        }
    };
} ]);