/* global $ */
(function () {
  'use strict';

  function setupContainer (id, width, height, scale) {
    $('#' + id).css({
      width  : width * scale,
      height : height * scale
    });
  }

  $(document).ready(function () {
    $.ajax({
      url      : 'data/config.json',
      method   : 'GET',
      dataType : 'JSON',
      success  : function (config) {
        var height = config.height;
        var scale  = config.mapScale;

        setupContainer('leftView-container', config.left, height, scale);
        setupContainer('backView-container', config.back, height, scale);
        setupContainer('rightView-container', config.right, height, scale);
      }
    });
  });
})();
