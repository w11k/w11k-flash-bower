angular.module('w11k.flash.template', ['w11k-flash.tpl.html']);

angular.module('w11k-flash.tpl.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('w11k-flash.tpl.html',
    '<div class="w11k-flash-container"><div class="w11k-flash-element"><p>Adobe Flash Player required.</p></div></div>');
}]);
