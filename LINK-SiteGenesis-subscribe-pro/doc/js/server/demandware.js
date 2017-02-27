'use strict';
/**
 * Salesforce Commerce Cloud plugin to document controller-based Salesforce Commerce Cloud script code.
 */

var helper = require('jsdoc/util/templateHelper');

var registerInforPortalLinks = function (p) {
	if (p.type && p.type.names) {
		var names = p.type.names;
		for (var j = 0; j < names.length; j++) {
			var name = names[j];
			if (name.indexOf('dw.') === 0 || ['Object', 'String', 'Array', 'Boolean', 'Date', 'Number', 'XML', 'RegExp'].indexOf(name) > -1) {
				//  logger.warn(name);
				//  https://info.demandware.com/DOC3/topic/com.demandware.dochelp/DWAPP-15.3-API-doc/scriptapi/html/api/class_dw_net_FTPClient.html?cp=0_20_2_8_0
				var urlName = name.indexOf('dw.') === 0 ? name.split('.').join('_') : 'TopLevel_' + name;
				helper.registerLink(name, 'https://info.demandware.com/DOC3/topic/com.demandware.dochelp/DWAPP-15.3-API-doc/scriptapi/html/api/class_' + urlName + '.html');
			}
		}
	}
};

exports.handlers = {
	beforeParse: function (e) {
		// make E4X parsable (code becomes unusable but for doc generation OK)
		e.source = e.source.replace(/::\[/g, '[').replace(/::/g, '');
		// remove for each loops
		e.source = e.source.replace(/for each\s?\(/g, 'for (');
	},
	newDoclet: function (e) {
		var params = e.doclet.params;
		var i;
		if (params) {
			for (i = 0; i < params.length; i++) {
				registerInforPortalLinks(params[i]);
			}
		}
		var returns = e.doclet.returns;
		if (returns) {
			for (i = 0; i < returns.length; i++) {
				registerInforPortalLinks(returns[i]);
			}
		}
	}
};

exports.defineTags = function (dictionary) {
	dictionary.defineTag('transactional', {mustHaveValue: false, canHaveName: false, canHaveType: false,
		onTagged: function (doclet) {
			doclet.transactional = true;
		}
	});
};
