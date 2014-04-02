/** Simple BAMF Ping-Pong App Demo */

require(
	['bamf/bamf', 'bamf/canvas2d', 'bamf/key', 'bamf/angle-2d', 'bamf/collision', 'bamf/mouse'],
	function(BAMF, Canvas2D, Key, A2D, Collision, Mouse)
{
	var APP_W = 400,
		APP_H = 400;

	var $canvasElement = document.getElementById('imm_canvas_1');

	//create a BAMF App instance
	var app1 = new BAMF(
	{	virtualW    : APP_W,
		virtualH    : APP_H,
		renderer    : new Canvas2D({ $canvas : $canvasElement }),
		input       : Key,
		fullScreen  : true
	});

	var mouse1 = new Mouse({app : app1});

	//resources defined for this app
	var Rsc =
	{
		Paddle :
		{
			img : {src:'../img/paddle.png', xO: 10, yO: 30},
			init: function(player)
			{
				return function()
				{
					this.player = player;
					this.x      = player == 0 ? 40 : APP_W - 40;
					this.y      = player == 0 ? APP_H / 4 * 1 : APP_H / 4 * 2
				};
			},
			logic: function()
			{	var b = this.getBounds();
				var ballB= ball1.getBounds();

				//player 1 paddle logic
				if(this.player == 0)
			   	{	this.y = mouse1.getY();

					//collision with the ball
					if(Collision.rectCollision(b, ballB))
					{
						if(ball1.dx < 0 && ballB.left <= b.right)
						{
							if(ball1.dy < 0)
								ball1.setAngle(ball1.angle + 90);
							else
								ball1.setAngle(ball1.angle - 90)
						}
						ball1.speed += 0.025;
					}
			   	}

				//player 2 paddle logic
				else if(this.player == 1)
				{
					//collision with the ball
					if(Collision.rectCollision(b, ballB))
					{
						if(ball1.dx > 0 && ballB.right >= b.left)
						{
							if(ball1.dy < 0)
								ball1.setAngle(ball1.angle - 90);
							else
								ball1.setAngle(ball1.angle + 90);
							ball1.speed += 0.02;
						}
					}
				}

				if(this.y > APP_H - this.drawYO)
					this.y = APP_H - this.drawYO;
				else if(this.y < this.drawYO)
					this.y = this.drawYO;
			}
		},
		Ball   :
		{
			img :  {src:'../img/ball.png', xO: 16, yO: 16},
			init:  function()
			{
				this.angle = 45;
				this.speed = 2.5;
				this.setAngle = function(a)
				{
					while(a < 0)
					{ a+= 360; }
					if(a >= 360)
					{ a %= 360;}
					this.angle = a;
				};
			},
			logic: function()
			{   var move = A2D.angleToPoint(this.angle, this.speed);
				this.dx = move.x;
				this.dy = move.y;
				this.x += this.dx;
				this.y -= this.dy;

				var bounds = this.getBounds(),
					appBounds = this.app.renderer.getBounds();

				if(bounds.left < appBounds.left && move.x < 0) 			//colliding with left wall
				{   do
				{
					bounds = this.getBounds();
					this.x++;
				}while(bounds.left < appBounds.left);

					this.setAngle(this.angle + (move.y > 0 ? -90 : 90));
				}

				if(bounds.right > appBounds.right && move.x > 0)   			//colliding with right wall
				{   while(bounds.right > appBounds.right)
				{
					bounds = this.getBounds();
					this.x--;
				}
					this.setAngle(this.angle + (move.y > 0 ? 90 : -90));
				}

				if(bounds.top < appBounds.top && move.y > 0)  			//colliding with top wall
				{   do
					{   bounds = this.getBounds();
						this.y++;
					}while(bounds.top < appBounds.top);

					this.setAngle(this.angle + (move.x < 0 ? 90 : -90));
				}

				if(bounds.bottom > appBounds.bottom && move.y < 0)  			//colliding with bottom wall
				{   do
				{   bounds= this.getBounds();
					this.y--;
				}while(bounds.bottom > appBounds.bottom);
					this.setAngle(this.angle + (move.x < 0 ? -90 : 90));
				}
			}
		}
	};

	//instantiate our ball entity
	var ball1 = new Canvas2D.ImgE(
	{
		img: Rsc.Ball.img,
		x: 300, y: 200,
		init : Rsc.Ball.init,
		logic: Rsc.Ball.logic,
		app  : app1
	});


	//create our two paddles, taggging them in the init function with their player number!
	var paddle1 = new Canvas2D.ImgE(
		{   app   : app1,
			x     : 10,
			y     : APP_H / 2,
			img   : Rsc.Paddle.img,
			logic : Rsc.Paddle.logic,
			init  : Rsc.Paddle.init(0)
		});


	var paddle2 = new Canvas2D.ImgE(
		{   app   : app1,
			x     : 10,
			y     : APP_H / 2,
			img   : Rsc.Paddle.img,
			logic : Rsc.Paddle.logic,
			init  : Rsc.Paddle.init(1)
		});

	//keeps track of current variables
	//NOTE: this feature has not been implemented yet. TODO
	var game =
	{	score : [0, 0],
	    status: 'start' 		//can be start, game, game_over
	};

	app1.start();
});