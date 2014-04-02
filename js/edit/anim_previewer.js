var app;
require(['bamf/bamf', 'bamf/canvas2d'], function(BAMF, Canvas2D)
{

	var bamfApp = new BAMF({targetW : 480,
							targetH : 480,
							renderer: new Canvas2D({$canvas : document.getElementById('preview_app')}),
							fullScreen : false });

	console.log(bamfApp);

	//anims variable is declared on the new preview window dynamically
	var bamfObj = new Canvas2D.AnimE({  app : bamfApp,
									      x : 0,
									      y : 0,
								       init : function(){},
								      logic : function(){},
								      anims : anims });
	bamfApp.start();

	app = bamfApp;
});