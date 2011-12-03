/*
	jQuery Plugin AutoCompleteExtended
	
	This plugin was made with a particular function of adding multiple inputs with autocomplete with some other functions like adding a new item to the list that is not into
	the autocomplete list or removing an item (when there are more than one into a list).
	
	Author: Julian Xhokaxhiu
	Date: 16/06/2010
	Changelog:
		- 0.2:  completely rewrited in object-oriented method. Now every object could be an instance of this plugin,
				so you can call methods after you have initialized it.
		- 0.1:  initial relase version.
*/
var AutocompleteExtended;
(function ($) {
	AutocompleteExtended = function(options){
		var input = $(this);
		// Leggo i valori cachati nell'oggetto
		var cache = $(this).data('autocompleteextendedcache');
		if(!cache)cache={};
		var father = $(this).data('autocompleteextendedfather');
		var theInput = $(this).data('autocompleteextendedoriginalinput');
		var count = $(this).data('autocompleteextendedcount');
		if(!count)count = 0;
		var settings = $(this).data('autocompleteextendedsettings');
		// If settings are not declared, we set the default value for them
		if(!settings){
			settings = {
				SearchUri: '',
				minLength: 2,
				useRegEx: false,
				RegExPattern: null,
				multiple: false,
				defaultvalue: null,
				withList: true,
				withNew: true,
				callback: null,
				buttons: {
					useIcons: true,
					textNew: 'New',
					textList: 'List',
					textDelete: 'Delete'
				},
				windows: {
					add: {
						onOK: null,
						onCancel: null,
						onClose: null
					},
					list: {
						onOK: null,
						onCancel: null,
						onClose: null
					},
					remove: {
						onOK: null,
						onCancel: null,
						onClose: null
					}
				}
			}
		};
		// Private methods - can only be called from within this object
		var IntFunz = {
			addActionButton: function (options) {
				if(!father.find('.autocompleteextended-buttoncontainer').length)father.append($('<div/>',{'class':'autocompleteextended-buttoncontainer'}));
				if (options.add) {
					if (settings.buttons.useIcons) father.find('.autocompleteextended-buttoncontainer').append($('<button/>', { 'class': 'new' }).button({ text: false, icons: { primary: 'ui-icon-plus'} }));
					else father.find('.autocompleteextended-buttoncontainer').append($('<button/>', { 'class': 'new' }).text(settings.buttons.textNew).button());
					father.find('.autocompleteextended-buttoncontainer').find('button.new').click(function () {
						father = $(this).parent().parent();
						$('body #autocompleteextended-new-item').dialog('option', {
							buttons: {
								'OK': function () {
									var input = father.find('input');
									if (settings.windows.add.onOK) settings.windows.add.onOK($(this).find('input'));
									input.val($(this).find('input').val());
									if (settings.multiple) {
										input.attr('readonly','readonly').addClass('readonly').next().find('button').remove();
										IntFunz.addActionButton({ remove: true });
										father = father.parent();
										IntFunz.InitPlugin({ addInput: true });
									}
									$(this).dialog('close');
								},
								'Cancel': function () {
									$(this).dialog('close');
								}
							},
							close: function (event, ui) {
								if (settings.windows.add.onClose) settings.windows.add.onClose();
								if (settings.callback) settings.callback();
							}
						});
						$('body #autocompleteextended-new-item').dialog('open');
						$('body #autocompleteextended-new-item input').val('').focus();
						return false;
					});
				};
				if (options.list) {
					if (settings.buttons.useIcons) father.find('.autocompleteextended-buttoncontainer').append($('<button/>', { 'class': 'list' }).button({ text: false, icons: { primary: 'ui-icon-script'} }));
					else father.find('.autocompleteextended-buttoncontainer').append($('<button/>', { 'class': 'list' }).text(settings.buttons.textList).button());
					father.find('.autocompleteextended-buttoncontainer').find('button.list').click(function () {
						father = $(this).parent().parent();
						$('body #autocompleteextended-list-elements').dialog('option', {
							buttons: {
								'OK': function () {
									var input = father.find('input');
									input.val($(this).find('input.autocompleteextended-list-elements-ui').val());
									if (settings.multiple) {
										input.attr('readonly', 'readonly').addClass('readonly').next().find('button').remove();
										IntFunz.addActionButton({ remove: true });
										father = father.parent();
										IntFunz.InitPlugin({ addInput: true });
									}
									$(this).dialog('close');
								},
								'Cancel': function () {
									$(this).dialog('close');
								}
							},
							close: function (event, ui) {
								if (settings.windows.list.onClose) settings.windows.list.onClose();
								if (settings.callback) settings.callback();
							}
						});
						$('body #autocompleteextended-wait-dialog').dialog('open');
						$.ajax({
							url: settings.SearchUri,
							dataType: "json",
							success: function (data) {
								$('body #autocompleteextended-list-elements select').empty();
								$.each(data, function (i, v) { $('body #autocompleteextended-list-elements select').append('<option value="' + v.id + '">' + v.value + '</option>') });
								$('body #autocompleteextended-list-elements select').combobox();
								$('body #autocompleteextended-wait-dialog').dialog('close');
								$('body #autocompleteextended-list-elements').dialog('open');
								$('body #autocompleteextended-list-elements input').focus();
							}
						});
						return false;
					});
				};
				if (options.remove) {
					if (settings.buttons.useIcons) father.find('.autocompleteextended-buttoncontainer').append($('<button/>', { 'class': 'delete' }).button({ text: false, icons: { primary: 'ui-icon-minus'} }));
					else father.find('.autocompleteextended-buttoncontainer').append($('<button/>', { 'class': 'delete' }).text(settings.buttons.textDelete).button());
					father.find('.autocompleteextended-buttoncontainer').find('button.delete').button().click(function () {
						var obj = $(this).parent().parent();
						$('body #autocompleteextended-confirm-delete').dialog('option', {
							buttons: {
								'OK': function () {
									obj.remove();
									$(this).dialog('close');
								},
								'Cancel': function () {
									$(this).dialog('close');
								}
							},
							close: function (event, ui) {
								if (settings.windows.remove.onClose) settings.windows.remove.onClose();
								if (settings.callback) settings.callback();
							}
						});
						$('body #autocompleteextended-confirm-delete').dialog('open');
						return false;
					});
				}
			},
			setInput:function () {
				if (settings.withNew) IntFunz.addActionButton({ add: true });
				if (settings.withList) IntFunz.addActionButton({ list: true });
				// Enable autocomplete
				var input = father.find('input');
				input.autocomplete({
					minLength: settings.minLength,
					source: function (request, response) {
						if (request.term in cache)response(cache[request.term]);
						else {
							$.ajax({
								url: settings.SearchUri,
								dataType: "json",
								data: request,
								success: function (data) {
									cache[request.term] = data;
									response(data);
								}
							});
						}
					},
					select: function (event, ui) {
						if (settings.multiple) {
							input.val(ui.item).attr('readonly', 'readonly').addClass('readonly').next().find('button').remove();
							IntFunz.addActionButton({ remove: true });
							father = father.parent();
							IntFunz.InitPlugin({ addInput: true });
						}
					},
					change: function (event, ui) {
						if (!ui.item) {
							// remove invalid value, as it didn't match anything
							$(this).val("");
							return false;
						}
					},
					open: function (event, ui) {
						input.autocomplete("widget").width(input.width());
					}
				});
				input.keypress(function () { father = $(this).parent() });
				if (settings.useRegEx) input.filter(function () { return this.value.match(settings.RegExPattern); });
				return input;
			},
			InitPlugin:function (options) {
				if (settings.multiple) {
					count++;
					father.addClass('autocompleteextended-father');
					father.append('<div class="autocompleteextended-grp autocompleteextended-grp-' + count + ' ui-widget"></div>');
					if (options.addInput) {
						var theNewInput = theInput.clone();
						father = father.find('div.autocompleteextended-grp-' + count);
						theNewInput.attr('id', theInput.attr('id') + count);
						father.append(theNewInput);
					}
					else {
						father.find('div.autocompleteextended-grp-' + count).append(father.find('input'));
						father = father.find('div.autocompleteextended-grp-' + count);
					}
				}else father.addClass('autocompleteextended-grpinputs').addClass('ui-widget');
				return IntFunz.setInput();
			},
			setvalue:function(items){
				if(settings.multiple){
					$.each(items, function (i, v) {
						input.val(v);
						input.attr('readonly', 'readonly').addClass('readonly').next().find('button').remove();
						IntFunz.addActionButton({ remove: true });
						father = father.parent();
						input = IntFunz.InitPlugin({ addInput: true });
					});
				}else input.val(items);
			}
		};
		
		if(typeof(options)=='string'){
			if(IntFunz[options])IntFunz[options].apply(null,Array.prototype.slice.call(arguments,1));
		}else if(options){
			settings = $.extend(settings, options || {});
			$(this).data('autocompleteextendedsettings',settings);
			
			// Run plugin
			AutocompleteExtended.init();
			// Do this only if the input is not already binded
			if (!input.attr('autocomplete')){
				// Get the input as it is, so we can add more like this after
				theInput = input.clone();
				father = input.parent();
				IntFunz.InitPlugin({ addInput: false });
				if(settings.defaultvalue)IntFunz.setvalue(settings.defaultvalue);
			}
			
			$(this).data('autocompleteextendedcache',cache);
			$(this).data('autocompleteextendedfather',father);
			$(this).data('autocompleteextendedoriginalinput',theInput);
			$(this).data('autocompleteextendedcount',count);
		}
	};
	// Public methods - can be called from client code
	// Prepare the code for the windows that would be loaded
	AutocompleteExtended.init = function(initoptions){
		var initsettings = $.extend({
			add: {
				title: 'Add item',
				text: 'Write here the value'
			},
			list: {
				title: 'Items list'
			},
			remove: {
				title: 'Are you sure?',
				text: 'Do you really want to delete the selected item?'
			},
			wait: {
				title: 'Now loading...',
				text: 'The items are now loading. This may take some time...'
			}
		}, initoptions || {});
		// Prepare the windows
		if ($('body #autocompleteextended-new-item').length == 0) {
			$('body').append('<div id="autocompleteextended-new-item" title="' + initsettings.add.title + '"><fieldset style="margin:0;padding:0;border:none"><label style="display:block;margin-bottom:5px">' + initsettings.add.text + '</label><input style="width:330px" type="text" class="text ui-widget-content ui-corner-all"/></fieldset></div>');
			$('body #autocompleteextended-new-item').dialog({
				autoOpen: false,
				height: 180,
				width: 370,
				modal: true,
				resizable: false,
				draggable: false,
				open: function (event, ui) {
					//hide close button.
					$(this).parent().children().children('.ui-dialog-titlebar-close').hide();
				}
			});
		}
		if ($('body #autocompleteextended-list-elements').length == 0) {
			$('body').append('<div id="autocompleteextended-list-elements" title="' + initsettings.list.title + '"><select></select></div>');
			$('body #autocompleteextended-list-elements').dialog({
				autoOpen: false,
				width: 345,
				modal: true,
				resizable: false,
				draggable: false,
				open: function (event, ui) {
					//hide close button.
					$(this).parent().children().children('.ui-dialog-titlebar-close').hide();
				}
			});
		}
		if ($('body #autocompleteextended-wait-dialog').length == 0) {
			$('body').append('<div id="autocompleteextended-wait-dialog" title="' + initsettings.wait.title + '"><p style="padding:0;margin:0">' + initsettings.wait.text + '</p></div>');
			$('body #autocompleteextended-wait-dialog').dialog({
				autoOpen: false,
				height: 100,
				modal: true,
				resizable: false,
				closeOnEscape: false,
				draggable: false,
				open: function (event, ui) {
					//hide close button.
					$(this).parent().children().children('.ui-dialog-titlebar-close').hide();
				}
			});
		}
		if ($('body #autocompleteextended-confirm-delete').length == 0) {
			$('body').append('<div id="autocompleteextended-confirm-delete" title="' + initsettings.remove.title + '"><p style="padding:0;margin:0">' + initsettings.remove.text + '</p></div>');
			$('body #autocompleteextended-confirm-delete').dialog({
				autoOpen: false,
				height: 160,
				modal: true,
				resizable: false,
				draggable: false,
				open: function (event, ui) {
					//hide close button.
					$(this).parent().children().children('.ui-dialog-titlebar-close').hide();
				}
			});
		}
	};
	// This will initialize a method that can make your select skinned with jQuery ui and autocompleted (so you can type in and filter the items)
	$.widget("ui.combobox", {
		_create: function () {
			var self = this;
			var select = this.element.hide();
			var input = $("<input>").insertAfter(select).autocomplete({
				source: function (request, response) {
					var matcher = new RegExp(request.term, "i");
					response(select.children("option").map(function () {
						var text = $(this).text();
						if (this.value && (!request.term || matcher.test(text)))
							return {
								id: this.value,
								label: text.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(request.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "$1"),
								value: text
							};
					}));
				},
				open: function (event, ui) {
					input.autocomplete("widget").width(input.width() - 4).height(180).css('overflow-y', 'scroll').css('overflow-x', 'hidden');
				},
				delay: 0,
				change: function (event, ui) {
					if (!ui.item) {
						// remove invalid value, as it didn't match anything
						$(this).val("");
						return false;
					}
					select.val(ui.item.id);
					self._trigger("selected", event, {
						item: select.find("[value='" + ui.item.id + "']")
					});
				},
				minLength: 0
			}).addClass("ui-widget ui-widget-content ui-corner-left ui-combobox autocompleteextended-list-elements-ui").css('width', '280px').css('padding', '0.4em 0');
			$("<button/>",{"tabIndex":-1,"title":"Show All Items","style":"padding:0;margin:5px 0;vertical-align:bottom;display:inline-block"}).text("&nbsp;").insertAfter(input).button({
				icons: {
					primary: "ui-icon-triangle-1-s"
				},
				text: false
			}).removeClass("ui-corner-all").addClass("ui-corner-right ui-button-icon").click(function () {
			// close if already visible
				if (input.autocomplete("widget").is(":visible")) {
					input.autocomplete("close");
					return;
				}
				// pass empty string as value to search for, displaying all results
				input.autocomplete("search", "");
				input.focus();
				return false;
			});
		}
	});
	$.fn.extend({
		autocompleteextended:function(){
			var args = arguments;
			this.each(function(){AutocompleteExtended.apply(this,args)});
		}
	});
})(jQuery);