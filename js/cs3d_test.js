
require(['bamf/bamf', 'bamf/canvas3d', 'bamf/key', 'bamf/collision', 'bamf/angle', 'bamf/pool', 'cs/constants'],
	function(BAMF, C3D, Key, Collision, A, Pool, C)
{	var APP_W = 400,
	    APP_H = 400;

	Key.define('L', 37);
	Key.define('R', 39);
	Key.define('U', 38);
	Key.define('D', 40);
	Key.define('A1', 90);
	Key.define('A2', 88);

	Key.define('CAM_L', 65);
	Key.define('CAM_R', 68);
	Key.define('CAM_U', 87);
	Key.define('CAM_D', 83);
	Key.define('CAM_ZI', 80);
	Key.define('CAM_ZO', 81);

	var IMG_DIR = '../img/cs/game/';

	//create a BAMF App instance
	var app1 = new BAMF(
	{	virtualW    : APP_W,
		virtualH    : APP_H,
		renderer    : new C3D({ $canvasDiv  : document.getElementById('3d_draw_div')}),
		input       : Key,
		settings    : {fullScreen : true}
	});

	var Game =
	{
		lives : 5,
		score : 0,
		bombs : 3
	};

	var horzLanePlane = new C3D.ShapeE(
		{
			app		: app1,
			shape   : 'plane',
			color   : 0x000000,
			width   : 800,
			height  : C.POS_WIDTH * 3,
			x       : (C.POS_WIDTH * 3 / 2),
			y       : (C.POS_WIDTH * 3)/2,
			z       : 1,
			textureUrl : IMG_DIR + 'shaft_texture.png'
		}
	);

	var vertLanePlane = new C3D.ShapeE(
	{
		app		: app1,
		shape   : 'plane',
		width   : 800,
		height  : C.POS_WIDTH * 3,
		x          : (C.POS_WIDTH * 3 / 2),
		y          : (C.POS_WIDTH * 3 / 2),
		z          : 0,
		textureUrl : IMG_DIR + 'shaft_texture.png',
		init       : function()
		{
			this.obj.rotation.z += Math.PI/2;
		}
	});

	var centerPlane = new C3D.ShapeE(
		{
			app			: app1,
			shape   	: 'plane',
			width   	: C.POS_WIDTH * 3,
			height  	: C.POS_WIDTH * 3,
			x       	: (C.POS_WIDTH * 3)/2,
			y       	: (C.POS_WIDTH * 3)/2,
			z       	: 2,
			textureUrl : IMG_DIR + 'center_texture.png'
		}
	);

	var HUDUpdate =
	{
		DOM :
		{
			lives : document.getElementById('lives_hud'),
			bombs : document.getElementById('bombs_hud'),
			score : document.getElementById('score_hud')
		},
		updateLives : function()
		{
			HUDUpdate.DOM.lives.innerHTML = 'LIVES: ' + Game.lives;
		},
		updateScore : function()
		{
			HUDUpdate.DOM.score.innerHTML = 'SCORE: ' + Game.score;
		},
		updateBombs : function()
		{
			HUDUpdate.DOM.bombs.innerHTML = 'BOMBS: ' + Game.bombs;
		},
			update      : function()
		{
			HUDUpdate.updateScore();
			HUDUpdate.updateBombs();
			HUDUpdate.updateLives();
		}
	};

	HUDUpdate.update();	//initialize



	/** Control Block Entity, which also controls and contains the 4 color blocks s*/
	var controlBlock =  new BAMF.E(
	{
		app  : app1,
		init : function()
		{
			this.gridCol = 1;
			this.gridRow = 1;
			this.blocks = [];	//array of color blocks
			this.targetX = -1000;
			this.targetY = -1000;
			this.z = C.GRID_Z;
			this.rotation = 0;
			this.rotationTarget = 0;
			this.rotateDir = C.TURN_R;
			this.draw = function(){};
			this.bounds = {};
		},
		logic : function()
		{
			this.position();

			//TODO--> invicibility graphic
			if(this.invincibleTimer > 0)
				this.invincibleTimer--;

			if(this.rotation != this.rotationTarget)
			{
				if(this.rotateDir === C.TURN_R)
				{	this.rotation = (this.rotation + 30) % 360;	}
				else
				{
					this.rotation-= 30;
					if(this.rotation < 0)
						this.rotation += 360;
				}
				//TODO -> fluctuate saturation at 1 life...?
			}

			if(Key.state['L'] == Key.KEY_PRESSED)
			{	this.move(C.MOVE_L);  }

			if(Key.state['R'] == Key.KEY_PRESSED)
			{	this.move(C.MOVE_R);  }

			if(Key.state['D'] == Key.KEY_PRESSED)
			{   this.move(C.MOVE_D);  }

			if(Key.state['U'] == Key.KEY_PRESSED)
			{   this.move(C.MOVE_U);  }

			if(Key.state['A1'] == Key.KEY_PRESSED)
			{	this.rotate(C.TURN_L);	}

			if(Key.state['A2'] == Key.KEY_PRESSED)
			{	this.rotate(C.TURN_R);	}
		},
		draw : function(){}
	});

	//create the 4 color blocks that surround the control block
	for(var i = 0; i < 4; i++)
	{
		var color,
			xOffset = 0,
			yOffset = 0;
		switch(i)
		{
			case C.BLOCK_RED:
				color = 0xFF0000;
				xOffset = 64;
				break;
			case C.BLOCK_BLUE:
				color = 0x0000FF;
				yOffset = -64;
				break;
			case C.BLOCK_YELLOW:
				xOffset = -64;
				color = 0xFFFF00;
				break;
			case C.BLOCK_GREEN:
				color = 0x00FF00;
				yOffset = 64;
				break;
		}

		controlBlock.blocks[i] = new C3D.ShapeE(
		{
			app		: app1,
			shape   : 'cube',
			color   : color,
			roundness : 1,
			materialType : 'lambert',
			width   : C.BLOCK_WIDTH,
			height  : C.BLOCK_WIDTH,
			length  : C.BLOCK_WIDTH,
			x       : controlBlock.x + xOffset,
			y       : controlBlock.y + yOffset,
			z       : controlBlock.z
		});
		controlBlock.blocks[i].bounds = {};

		controlBlock.blocks[i].getBounds = function()
		{
			this.bounds.top = this.obj.position.y;
			this.bounds.left = this.obj.position.x;
			this.bounds.right = this.obj.position.x + C.BLOCK_WIDTH;
			this.bounds.bottom= this.obj.position.y + C.BLOCK_WIDTH;
			return this.bounds;
		};
	}

	controlBlock.position = function()
	{
		//basic positioning to target/smooth movement
		if(this.initialized)
		{
			this.targetX = C.GRID_X + C.POS_WIDTH * this.gridCol;
			this.targetY = C.GRID_Y  +C.POS_WIDTH * (2-this.gridRow);
		}
		else
		{
			var destX = C.GRID_X + this.gridCol * C.POS_WIDTH + C.POS_WIDTH / 2;
			var destY = C.GRID_X + (2-this.gridRow) * C.POS_WIDTH + C.POS_WIDTH / 2;

			if((destX - this.targetX / 5) > 0.2)
			{
				this.targetX += (destX - this.targetX)/5;
			}
			else
			{
				this.targetX = destX;
			}

			if((destY - this.targetY / 5) > 0.2)
			{
				this.targetY += (destY - this.targetY)/5;
			}
			else
			{
				this.targetY = destY;
			}
			//if we've positioned the control block where it should be
			if(this.targetX == destX && this.targetY == destY) //flag it
			{
				this.initialized = true;
			}
		}

		this.shiftToDest(); //shift position as necessary
		var block;
		block = this.blocks[C.BLOCK_RED];
		block.setPosition(
			this.targetX + C.CB_DISTANCE * Math.cos(A.degToRadianI(this.rotation)),
			this.targetY + C.CB_DISTANCE * Math.sin(A.degToRadianI(this.rotation)),
			this.z		  );
		block = this.blocks[C.BLOCK_BLUE];
		block.setPosition(
			this.targetX + C.CB_DISTANCE * Math.cos(A.degToRadianI(this.rotation + 90)),
			this.targetY + C.CB_DISTANCE * Math.sin(A.degToRadianI(this.rotation + 90)),
			this.z		  );
		block = this.blocks[C.BLOCK_YELLOW];
		block.setPosition(
			this.targetX + C.CB_DISTANCE * Math.cos(A.degToRadianI(this.rotation + 180)),
			this.targetY + C.CB_DISTANCE * Math.sin(A.degToRadianI(this.rotation + 180)),
			this.z		  );
		block = this.blocks[C.BLOCK_GREEN];
		block.setPosition(
			this.targetX + C.CB_DISTANCE * Math.cos(A.degToRadianI(this.rotation + 270)),
			this.targetY + C.CB_DISTANCE * Math.sin(A.degToRadianI(this.rotation + 270)),
			this.z		  );
	};

	controlBlock.shiftToDest = function()
	{
		var moved = false;
		//set the speed of the movement and if it's less than the minimum step(0.25), stop the movement
		if(this.x != this.targetX)
			this.dx = (this.targetX) / 5;
		if(this.y != this.targetY)
			this.dy = (this.targetY) / 5;
		if(Math.abs(this.dx) <= 0.21 )
			this.dx = 0;
		if(Math.abs(this.dy) <= 0.25)
			this.dy = 0;

		if(this.dx != 0 && this.dy != 0)
		{
			for(var color = 0; color < 4; color++)
			{
				//TODO -> create motion blur
				//................................
				//.......................................
			}
		}
	};

	controlBlock.rotate = function(direction)
	{
		this.rotateDir = direction;
		if(direction === C.TURN_R) //rotating left
		{
			this.rotationTarget = (this.rotationTarget + 90) % 360;
		}
		else if(direction === C.TURN_L)                     //rotating right
		{
			this.rotationTarget -= 90;
			if(this.rotationTarget < 0)
				this.rotationTarget += 360;
		}

		//TODO -> create motion shadows if rotating
		//................................
		//.......................................
	};

	controlBlock.move = function(direction)
	{
		var moved = false;
		switch(direction)
		{
			case C.MOVE_U:
				if(this.gridRow > 0)
				{
					this.gridRow--;
					moved = true;
				}
				break;
			case C.MOVE_UR:
				if(this.gridCol < 2)
				{
					this.gridCol++;
					moved = true;
				}
				if(this.gridRow > 0 )
				{
					this.gridRow--;
					moved = true;
				}
				break;
			case C.MOVE_R:
				if(this.gridCol < 2)
				{
					this.gridCol++;
					moved = true;
				}
				break;
			case C.MOVE_RD:
				if(this.gridCol <2)
				{
					this.gridCol++;
					moved = true;
				}
				if(this.gridRow < 2)
				{
					this.gridRow++;
					moved = true;
				}
				break;
			case C.MOVE_D:
				if(this.gridRow < 2)
				{
					this.gridRow++;
					moved = true;
				}
				break;
			case C.MOVE_DL:
				if(this.gridRow < 2)
				{
					this.gridRow++;
					moved = true;
				}
				if(this.gridCol > 0)
				{
					this.gridCol--;
					moved = true;
				}
				break;
			case C.MOVE_L:
				if(this.gridCol > 0)
				{
					this.gridCol--;
					moved = true;
				}
				break;
			case C.MOVE_LU:
				if(this.gridCol > 0)
				{
					this.gridCol--;
					moved = true;
				}
				if(this.gridRow > 0)
				{
					this.gridRow--;
					moved = true;
				}
				break;
		}
	};

	controlBlock.getBounds = function()
	{
		this.bounds.top    = this.y;
		this.bounds.left   = this.x;
		this.bounds.bottom = this.y + C.POS_WIDTH * 1.5,
		this.bounds.right  = this.x + C.POS_WIDTH * 1.5
		return this.bounds;
	};

	var spaceBg = new C3D.ShapeE(
		{
			app		: app1,
			shape   : 'plane',
			color   : 0x000000,
			width   : 4000,
			height  : 4000,
			x       : 0,
			y       : 0,
			z       : -1000,
			textureUrl : IMG_DIR + 'galaxy_bg_color.jpg',
			textureMode : 'no_shade',
			logic   : function()
			{
				this.setX(cameraE.camera.position.x);
				this.setY(cameraE.camera.position.y);
				this.setZ(cameraE.camera.position.z - 2000);
				this.obj.rotation.x = cameraE.camera.rotation.x;
				this.obj.rotation.y = cameraE.camera.rotation.y;
				this.obj.rotation.z = cameraE.camera.rotation.z;
			}
		});

	var cameraE = new BAMF.E(
	{
		init : function()
		{	this.camera = app1.renderer.camera;
			this.timer = 0;
			this.camera.position.z = 200;
			this.camera.position.y = -80;
			this.camera.position.x =  30;
			this.camera.rotation.z = Math.PI * 0.1;
			this.camera.rotation.x = Math.PI / 8;
		}
	});

	cameraE.camera.lookAt(
		{
			x : 0,
			y : 0,
			z : 0
		});
	cameraE.draw = function(){}; //just to override superclass
	cameraE.logic = function()
	{
		this.timer++;

		//space cam effect...
		this.camera.rotation.z += Math.cos(this.timer / 400) / 600;

		if(Key.state['CAM_D'] > 0)
			this.camera.rotation.x += 0.03

		if(Key.state['CAM_U'] > 0)
			this.camera.rotation.x -= 0.03;

		if(Key.state['CAM_L'] > 0)
			this.camera.rotation.y -= 0.03;

		if(Key.state['CAM_R'] > 0)
			this.camera.rotation.y += 0.03;

		if(Key.state['CAM_ZI'] > 0)
			this.camera.position.z += 0.03;


		if(Key.state['CAM_ZO'] > 0)
			this.camera.position.z -= 0.03;

		if(this.camera.rotation.x > Math.PI * 0.22)
		{
			this.camera.rotation.x = Math.PI * 0.22;
		}
		else if(this.camera.rotation.x < -Math.PI * 0.22)
		{
			this.camera.rotation.x = -Math.PI * 0.22;
		}

		if(this.camera.rotation.y > Math.PI * 0.22)
		{
			this.camera.rotation.y = Math.PI * 0.22;
		}
		else if(this.camera.rotation.y < -Math.PI * 0.22)
		{
			this.camera.rotation.y = -Math.PI * 0.22;
		}
	};

	//a color explosion
	//p.color
	//p.x, p.y, p.z
	var ColorExp = function(p)
	{
		var that = this;
		var anim;
		switch(p.color)
		{
			case C.BLOCK_RED:
				anim = C.ANIMS.CEXPL_RED;
				break;
			case C.BLOCK_GREEN:
				anim = C.ANIMS.CEXPL_GREEN;
				break;
			case C.BLOCK_YELLOW:
				anim = C.ANIMS.CEXPL_YELLOW;
				break;
			case C.BLOCK_BLUE:
				anim = C.ANIMS.CEXPL_BLUE;
				break;
		}

		var newObj = new C3D.SpriteE(
		{
			app			: app1,
			imgWidth    : 512,
			imgHeight   : 234,
			x           : p.x || 0,
			y           : p.y || 0,
			z           : p.z || 16,
			anims       : anim
		});

		newObj.logic = function(){that.logic.call(this);}; //attach behavior from prototype fn

		return newObj;
	};
	ColorExp.prototype.logic = function()
	{
		if(!this.hasRun)
		{
			console.log(this);
			this.hasRun = true;
		}
			if(this.animComplete == true)
		{
			this.obj.visible = false;
			this.destroy();
		}
	};

	var testSprite2 = new ColorExp(
		{
			x : 16,
			y : 16,
			z : 16,
			color : C.BLOCK_RED
		});


	//an enemy block object
	//p.direction
	//p.shaft
	//p.color
	var EnemyBlock = function(p)
	{
		var color;
		switch(p.color)
		{
			case C.BLOCK_RED:
				color = 0xFF0000;
				break;
			case C.BLOCK_GREEN:
				color = 0x00FF00;
				break;
			case C.BLOCK_YELLOW:
				color = 0xFFFF00;
				break;
			case C.BLOCK_BLUE:
				color = 0x0000FF;
				break;
		};

		var speed = 2;

		var x, y, dx, dy;
		switch(p.direction)
		{
			case C.MOVE_U:
				x = C.GRID_X + C.POS_WIDTH / 2 + (C.POS_WIDTH * p.shaft);
				y = 480;
				dx= 0;
				dy = -speed;
				break;
			case C.MOVE_D:
				x = C.GRID_X + C.POS_WIDTH / 2 + (C.POS_WIDTH * p.shaft);
				y = -240;
				dx= 0;
				dy = speed;
				break;
			case C.MOVE_L:
				x = 480;
				y = C.GRID_Y + (C.POS_WIDTH /2) + C.POS_WIDTH * p.shaft;
				dx = -speed;
				dy = 0;
				break;
			case C.MOVE_R:
				x = -240;
				y = C.GRID_Y + (C.POS_WIDTH /2) + C.POS_WIDTH * p.shaft;
				dx = speed;
				dy = 0;
				break;
		}

		//the object representing the enemy block to return
		var newObj = new C3D.ShapeE(
		{
			app		: app1,
			shape   : 'cube',
			color   : color,
			materialType : 'lambert',
			width   : C.BLOCK_WIDTH,
			height  : C.BLOCK_WIDTH,
			length  : C.BLOCK_WIDTH,
			x       : x,
			y       : y,
			z       : C.GRID_Z,
			logic   : function()
			{
				this.obj.position.x += this.dx;
				this.obj.position.y += this.dy;
				this.obj.rotation.x += 0.02;
				this.obj.rotation.y += 0.03;

				if(!this.hasCollided && Collision.objCollision(this, controlBlock) === true)
				{
					//now check for each color within the control block colliding
					for(var i = 0; i < 4; i++)
					{
						if(Collision.objCollision(this, controlBlock.blocks[i]) === true)
						{
							console.log('collided w ' + i + ' block');
							console.log('match = ' + (i == p.color));
							if(i == p.color)
							{
								var explosion = new ColorExp(
									{
										x : this.obj.position.x,
										y : this.obj.position.y,
										z : this.obj.position.z + 20,
										color : p.color
									});
								Game.score+= 100;
								HUDUpdate.updateScore();
							}else
							{
								if(Game.lives > 0)
								{
									Game.lives--;
									HUDUpdate.updateLives();
								}
								else
								{
									//TODO -> game over
								}
							}
							this.hasCollided = true;
							this.destroy();	//call to remove this entity
							break;
						}
					}
				}
			}
		});
		newObj.hasCollided = false;
		newObj.bounds = {};
		newObj.getBounds = function()
		{
			this.bounds.top = this.obj.position.y;
			this.bounds.left = this.obj.position.x;
			this.bounds.right = this.obj.position.x + C.BLOCK_WIDTH;
			this.bounds.bottom= this.obj.position.y + C.BLOCK_WIDTH;
			return this.bounds;
		};

		newObj.dx = dx;
		newObj.dy = dy;

		return newObj;
	};

	var eBlockFactory = new Pool(
		{
			createObj: function(p)
			{
				var newObj;

				if(p)//if instantiation parameters given, create object accordingly
				{
					newObj = new EnemyBlock(
					{
						direction : p.direction,
						shaft     : p.shaft,
						color     : p.color
					});
				}
				else //if no default parameters given, give our defaults
				{
					newObj = new EnemyBlock(
						{
							direction : Math.floor(Math.random() * 4),
							shaft     : Math.floor(Math.random() * 3),
							color     : Math.floor(Math.random() * 4)
						});
				}
				//return our new object!
				return newObj;
			}
		}
	);

	var cExpFactory = new Pool(
	{
		createObj: function(p)
		{
			var newObj;

			if(p)
			{
				newObj = new ColorExp(
					{
						color : p.color,
						x     : p.x,
						y     : p.y,
						z     : p.z
					}
				);

				return newObj;
			}
			else
			{
				throw 'color explosions require instantiation parameters';
			}
		}
	});

	var blockCreator = new BAMF.E(
		{
			app: app1,
			init: function()
			{
				this.draw = function(){};
				this.timer = 0;
			},
			logic : function()
			{
				this.timer += 1;
				if(this.timer % 100 == 0)
				{
					var newEBlock = eBlockFactory.createObj(
					{	direction: Math.floor(Math.random() * 4),
						shaft: Math.floor(Math.random() * 3),
						color: Math.floor(Math.random() * 4)
					});
				}
			}
		});

	app1.addEntity(cameraE);

	app1.start();
});