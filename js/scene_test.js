require(['bamf/bamf', 'bamf/canvas2d', 'bamf/mouse'],  function(BAMF, Canvas2D, Mouse)
{	var APP_W = 400,
		APP_H = 400;

	var $canvas = document.getElementById('imm_canvas_1');

	//create a BAMF App instance
	var app = new BAMF(
		{	renderer     : new Canvas2D({$canvas : $canvas}),
			targetW    : APP_W,
			targetH    : APP_H,
			fullScreen : true
		});
	                                  W
	var mouse = new Mouse({app : app});
	var clickListener = new mouse.SceneClickListener();

	var scene1BG = new BAMF.ImgE(
		{
			img: { src : '..\\img\\scene1bg.jpg' , xO: 0, yO: 0},
			x  : 0,
			y  : 0,
			logic : function()
			{    if(this.timer-- >= 0)
					this.x-= 0.5;
			},
			init  : function() { this.timer = 200; },
			app   : app
		});

	var sceneTxt = new BAMF.TxtE(
	{
		txt : 'Scene 1',
		color: '#FFFFFF',
		x    : 20,
		y    : 20,
		app  : app
	});

	var clickTxt = new BAMF.TxtE(
		{
			txt : 'Click To Advance',
			color: 'rgba(255, 255, 255, 0.5)',
			x    : APP_W - 250,
			y    : APP_H - 20,
			logic: function()
			{	if(clickListener.clickEvent)
				{
					console.log(clickListener.clickEvent);
					app.setScene(1);
				}
			},
			app  : app
		});

	var scene = new BAMF.Scene({app : app});

	scene.add(scene1BG);
	scene.add(sceneTxt);
	scene.add(clickTxt);
	scene.add(clickListener);

	app.scene = scene;
	app.start();
});