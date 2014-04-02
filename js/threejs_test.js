
require(['bamf/bamf', 'bamf/canvas3d', 'bamf/key'],  function(BAMF, Canvas3D, Key)
{	var APP_W = 400,
	    APP_H = 400;

	Key.define('LEFT', 37);
	Key.define('UP', 38);
	Key.define('RIGHT', 39);
	Key.define('DOWN', 40);
	Key.define('A1', 32);
	//create a BAMF App instance
	var app1 = new BAMF(
		{	virtualW    : APP_W,
			virtualH    : APP_H,
			renderer    : new Canvas3D({ $canvasDiv  : document.getElementById('3d_draw_div')}),
			input       : Key,
			settings    : {fullScreen : true}
		});

	//create a test red 3d rectangle mesh
	var rect1 = new Canvas3D.ShapeE({
		app : app1,
		shape : 'cube', color : 0xFF0000,
		width : 10, height: 40, length: 100,
		x : 100, y : 100, z :100,
		init: function()
		{

		},
	    logic : function()
		{

		}
	});

	//create a test red 3d orange mesh
	var rect2 = new Canvas3D.ShapeE({
		app : app1,
		shape : 'cube', color : 0xFFDD00,
		width : 50, height: 40, length: 200,
		x : -100, y : 100, z :100,
		init : function()
		{
			this.timer = 0;
		},
		logic : function()
		{
			this.timer++;

			//space cam effect...
			this.object.position.x += Math.cos(this.timer / 800) / 2;
		}
	});

	var sphere1 = new Canvas3D.ShapeE({
	   	app : app1,
	   	shape: 'sphere', color: 0x2200FF,
		radius: 50, xSegments : 20, ySegments : 20,
		x : 25, y : 150, z : 100,
		textureUrl : '../img/earth_texture.png',
		init : function()
		{
			this.ballGravity = 0;
			this.ballY = -100;
		},
		logic : function()
		{
			//bouncing a ball!
			this.object.position.y = this.ballY + 51;
			this.ballY += this.ballGravity;

			if(this.ballY <= -100 && this.ballGravity < 0)               //invisible floor?
			{
				this.ballGravity = (this.ballGravity * -1) - 0.85;
				if(this.ballGravity <= -0.25) this.ballGravity = 0;
			}

			if(this.ballGravity > -15)       	//add some gravity
				this.ballGravity-= 0.5;

			while(this.ballY <= -100)
			{ this.ballY++; }

			if(Key.state['A1'] == Key.KEY_PRESSED)
			{ this.ballGravity = 15; }
		}

	});

	var cameraE = new BAMF.E({
		init : function()
		{	this.camera = app1.renderer.camera;
			this.timer = 0;
		}
	});
	cameraE.draw = function(){}; //just to override superclass
	cameraE.logic = function(){
		this.timer++;

		//space cam effect...
		this.camera.rotation.z += Math.cos(this.timer / 800) / 1200;

		if(Key.state['DOWN'] > 0)
			this.camera.rotation.x -= 0.07;		//continuously rotate the camera

		if(Key.state['UP'] > 0)
			this.camera.rotation.x += 0.07;		//continuously rotate the camera

		if(Key.state['LEFT'] > 0)
			this.camera.rotation.y -= 0.07;		//continuously rotate the camera

		if(Key.state['RIGHT'] > 0)
			this.camera.rotation.y += 0.07;		//continuously rotate the camera

	};

	app1.addEntity(cameraE);

	app1.start();
});