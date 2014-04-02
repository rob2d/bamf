var Dialogs = {
	/**@type Y.Panel */
};

YUI.add('dialogs', function(Y)
{
	Y.Panel.prototype.showPrompt = function(msg, title, okAction)
	{
		this.show();
		Y.one('#input_prompt_box #prompt_message').setHTML(msg);
		Y.one('#input_prompt_box .yui3-widget-hd').setHTML(title);
		this.onOK = okAction;
	};
	Y.Panel.prototype.onCancel = function(e)
	{
		e.preventDefault();
		this.hide();
	};

	Y.Dialogs =
	{
		createPrompter : function(params)
		{
			return new Y.Panel(
				{
					srcNode:  params.srcNode,
					headerContent: 'a panel...',
					width:    220,
					zIndex:   110,
					centered: true,
					modal:    true,
					visible:  false,
					render:   true,
					plugins:  [Y.Plugin.Drag],
					buttons    : {
						footer: [
							{
								name  : 'cancel',
								label : 'Cancel',
								action: 'onCancel'
							},

							{
								name     : 'proceed',
								label    : 'OK',
								action   : 'onOK'
							}
						]
					}
				});
			}
		};
	},  '0.0.1',
	{requires: ['node', 'panel', 'dd-plugin']});

//load pop-up dialog code...
YUI().use('panel', 'dd-plugin', 'node', function(Y)
{
	Y.Panel.prototype.showPrompt = function(msg, title, okAction)
	{
		this.show();
		Y.one('#input_prompt_box #prompt_message').setHTML(msg);
		Y.one('#input_prompt_box .yui3-widget-hd').setHTML(title);
		this.onOK = okAction;
	};
	Y.Panel.prototype.onCancel = function(e)
	{
		e.preventDefault();
		this.hide();
	};

	Dialogs.createPrompter = function(params)
	{
		var newPrompter = new Y.Panel(
		{
			srcNode:  params.srcNode,
			headerContent: 'a panel...',
			width:    220,
			zIndex:   110,
			centered: true,
			modal:    true,
			visible:  true,
			render:   true,
			plugins:  [Y.Plugin.Drag],
			buttons    : {
				footer: [
					{
						name  : 'cancel',
						label : 'Cancel',
						action: 'onCancel'
					},

					{
						name     : 'proceed',
						label    : 'OK',
						action   : 'onOK'
					}
				]
			}
			});

		return newPrompter;
	};
});