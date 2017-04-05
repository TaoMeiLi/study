(function() {

	"use strict";

	var requireOptions = {
		paths: {
			// Plugins
			checkbox: "plugins/checkbox",
			radio: "plugins/radio",
			timeinputer: "plugins/timeinputer",
			placeholder: "plugins/placeholder",
			submitter: "plugins/submitter",
			msg: "plugins/msg",
			validate: "plugins/validate",
			table: "plugins/table",
			uploader: "plugins/uploader",
			// Libraries
			jquery: "jquery.min",
			"origin-underscore": "underscore.min",
			"underscore": "underscore-contrib.min",
			bootstrap: "bootstrap.min",
			datepicker: "bootstrap-datepicker.min",
			datetimepicker: "bootstrap-datetimepicker.min",
			moment: "moment-with-locales.min",
			typeahead: "bootstrap3-typeahead.min",
			ZeroClipboard: "ZeroClipboard.min",
			"mobile-utils": "mobile-utils.min",
			ueditorConfig: "../ueditor/ueditor.config",
			ueditor: "../ueditor/ueditor.all.min"
			// hippo: 'http://i1.dpfile.com/hls/hippo3.min'
		},
		shim: {
			jquery: {
				exports: '$'
			},
			ueditor: {
				exports: 'window.UE'
			},
			underscore: {
				deps: ["origin-underscore"],
				exports: "_"
			},
			datetimepicker: {
				deps: ["moment"],
				exports: "$.fn.datetimepicker"
			}
		}
	};
	require.config(requireOptions);

	require(["jquery","underscore"], function($) {

		require(["welife","bootstrap","checkbox","radio","timeinputer","placeholder","submitter","msg","validate","table"], function(WeLife) {
			$(function() {
				var $main = $(".main");
				$main.data("welife", new WeLife($main[0], $main.data("module")));
			});
		});

	});

}());
