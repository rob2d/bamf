/**
 * @module Canvas2D
 * @exports module:Canvas2D
 * @augments BAMF.Renderer
 */
define(['bamf/bamf'], function(BAMF)
{
	/**
	 *
	 * @constructor
	 * @alias module:Canvas2D
	 *
	 * @param {module:BAMF} app the app associated with this canvas instance
	 */
	var Canvas2D = function(p)
	{	this.app = p.app || undefined;
		this.$canvas = p.$canvas || undefined;

		/** a reference context we use to draw on our rendering canvas
		 * @type {Canvas2DContext} */
		this.context  = this.$canvas.getContext('2d');

		var that = this;
		//listen for window resize events
		window.addEventListener('resize',
			function(){that.refreshSize();});
	};

	/** update the app size, taking into account it's settings and the window it is run in
	 * @method */
	Canvas2D.prototype.refreshSize = function()
	{	var canvasStyleW,
			canvasStyleH;

		if(this.app.settings && this.app.settings.fullScreen)
		{	/** calculate the
			 *  necessary w/h depending on users screen and aspect ratio */
			var windowAR = window.innerWidth / window.innerHeight,     //get the aspect ratio of window
				appViewAR   = this.virtualW / this.virtualH, //use app's ratio for calculations

				canvasStyleW = (windowAR > appViewAR) ? window.innerHeight * appViewAR : window.innerWidth,
				canvasStyleH = (windowAR > appViewAR) ? window.innerHeight : window.innerWidth / appViewAR;

			this.app.settings.scale = canvasStyleH / this.virtualH;
		}
		else
		{	canvasStyleW = this.virtualW;
			canvasStyleH = this.virtualH;
			if(this.app.settings)
				this.app.settings.scale = 1.0;
		}

		this.$canvas.style.width =  canvasStyleW + "px";
		this.$canvas.style.height = canvasStyleH + "px";
		this.$canvas.width = canvasStyleW;
		this.$canvas.height = canvasStyleH;

		if(window.innerWidth > canvasStyleW)
			this.$canvas.style.left = ((window.innerWidth - canvasStyleW) / 2) + 'px';
		else
			this.$canvas.style.left = '0px';
		if(window.innerHeight > canvasStyleH)
			this.$canvas.style.top = ((window.innerHeight - canvasStyleH) / 2) + 'px';
		else
			this.$canvas.style.top = '0px';
		this.context.scale(this.app.settings.scale, this.app.settings.scale);
	}

	/** clears the screen
	 *  @method
	 */
	Canvas2D.prototype.preLogicRender = function()
	{   this.context.clearRect(0, 0, this.virtualW, this.virtualH);
	};

	/** returns a rectangle representing the bounds of this Canvas Renderer
	 *  @method
	 */
	Canvas2D.prototype.getBounds = function()
	{ return this.bounds; };

	/**
	 * creates a new Image Entity with the given parameter object literal
	 * @class An Entity displayed by using an image in the BAMF app
	 * @param {Object} p parameters to supply the constructor
	 * @param {Object} p.img an image that graphically is displayed for this entity
	 * @param {number} p.x  initial x position
	 * @param {number} p.y initial y position
	 * @param {Function} p.init the code which initializes this app's behavior
	 * @param {Function} p.logic the behavioral logic for this app during each synchronized app update

	 * @param {BAMF} p.app the BAMF application this entity is associated with
	 * @augments BAMF.E
	 */
	Canvas2D.ImgE = function(p)
	{
		var that = this;
		this.img = new Image();
		this.img.src = p.img.src;
		this.img.onload = function()
		{	that.fullyLoaded = true;
		}
		this.drawXO = p.img.xO || 0;
		this.drawYO = p.img.yO || 0;

		BAMF.E.call(this, p);	//make this an entity! JS magic
	};

	Canvas2D.ImgE.prototype =
	{
		/** @method */
		draw : function()
		{
			var app = this.app,
			ctx = app.renderer.context;
			var xDraw = Math.round(this.x - this.drawXO) - app.scene.level.getScrollX(),
				yDraw = Math.round(this.y - this.drawYO) - app.scene.level.getScrollY();
			ctx.drawImage(this.img, xDraw, yDraw, this.img.width, this.img.height);
		},

		/**
		 * returns the rectangle which defines the boundary of this renderer
		 * @method */
		getBounds : function()
		{
			return {
				top :    this.y - this.drawYO,
				left :   this.x - this.drawXO,
				right :  this.x - this.drawXO + this.img.width,
				bottom : this.y - this.drawYO + this.img.height
			};
		}
	};

	/**
	 *  @class used on an animation object literal to make it an Anim object to be used by an Anim Entity;
	 *  loads image files for this animation. Used via object.apply(BAMF.Anim);
	 *  This is actually done automatically in AnimE objects in their constructor
	 *  @property {Number} frameLength how fast will the object's animations last(noted in seconds using float values)
	 *  @property {Number} cycleTo  at what frame does the animation loop to after the first successful play?
	 *  (note: setting cycleTo to the same number as frame length ensures the anim only plays once!)
	 *  @property {Number} imgs an array of image sources
	 *  @property {String} imgs.src source image location, imgs.xO image x offset, imgs.yO image y offset
	 *  @property {Number} imgIndices what indexes of the image array to use(optional, if not supplied we just iterate through the img normally
	 */
	BAMF.Anim = function()
	{	//populate our image array for this object
		for(var i = 0; i < this.imgs.length; i++)
		{
			this.imgs[i].imgData = new Image();
			this.imgs[i].imgData.src = this.imgs[i].src;
		}
	};


	/**
	 * creates a new Entity with the given parameter object literal
	 * @class An Animateable Entity to use with an BAMF app
	 * @param {Object} p parameters to supply the constructor
	 * @param {Object} p.anims a collection of animation object literals for this entity
	 * @param {String} p.anims.default the default animation name to run when the app starts
	 * @param {Number} p.x initial x position
	 * @param {Number} p.y initial y position
	 * @param {BAMF} p.app the BAMF application this entity is associated with
	 * @augments BAMF.E */
	Canvas2D.AnimE = function(p)
	{	for(var pName in p.anims)
	{
		if(pName != 'init')
		{
			p.anims[pName].name = pName;
			BAMF.Anim.apply(p.anims[pName]); //complete the anim functionality
		}
	}
		this.anims = p.anims;
		this.animComplete = false;  //by default an anim has not completed
		this.drawXO = 0,
			this.drawYO = 0;   //supply default parameters for offsets

		this.frameIndex = 0;
		this.frameLength = 0;   //store the default animation speed locally so it can be changed
		this.animLastTick = new Date().getTime(); //default last tick was now

		//set the default anim to the array's 'init' property
		if(this.anims.init)
			this.setAnim(this.anims.init);

		BAMF.E.call(this, p);	//make this an entity! JS magic
	};

	Canvas2D.AnimE.prototype =
	{
		/** @method */
		draw : function()

		{	var app = this.app,
			ctx = app.renderer.context;
			var xDraw = Math.round(this.x + this.drawXO) - this.app.scene.level.getScrollX(),
				yDraw = Math.round(this.y + this.drawYO) - this.app.scene.level.getScrollY();
			ctx.drawImage(this.img, xDraw, yDraw, this.img.width, this.img.height);
			this.animate(0.02);
		},
		/**
		 *  handle the logic for animating an AnimE entity during every call
		 * @method */
		animate : function(deltaTime)
		{
			//add the time that goes by related to how long each frame is
			var prevFrame = this.frameIndex;
			this.frameIndex += (deltaTime /this.frameLength);
			while(this.frameIndex >= this.anim.frameCount)
			{
				this.animComplete = true;
				this.frameIndex = (this.frameIndex - this.anim.frameCount) + this.anim.cycleTo;
			}

			if(Math.floor(prevFrame) != Math.floor(this.frameIndex))
				this.refreshImg();
		},
		/** change the current animation of this object
		 * @method*/
		setAnim : function(animName, frameIndex)
		{
			this.anim = this.anims[animName];
			//get quick reference to the frame count dependant on whether there's an indices array!
			this.anim.frameCount = this.anims[animName].indices ?
				this.anim.indices.length : this.anim.imgs.length;
			this.frameIndex = frameIndex || 0;  //0 is default when no 2nd arg provided
			this.animComplete = false;          //anim hasn't cycled once yet
			this.frameLength = this.anim.frameLength;    //store the default animation speed locally so it can be changed
			this.refreshImg();
		},
		/** refresh the image depending on the variables currently in this object
		 * @method*/
		refreshImg : function()
		{
			var index = (!this.anim.indices) ? Math.floor(this.frameIndex) :
				this.anim.infdices[ Math.floor(this.frameIndex)];
			this.img 	= this.anim.imgs[index].imgData;
			this.drawXO = this.anim.imgs[index].xO || 0;
			this.drawYO = this.anim.imgs[index].yO || 0;
		}
	};

	/**
	 * creates a new Text Entity with the given parameter object literal
	 * @class An entity which displays text in a BAMF App.
	 * @param {Object} p parameters to supply the constructor
	 * @param {String} p.txt the string of text this entity initially contains/displays
	 * @param {number} p.x initial x position
	 * @param {number} p.y initial y position
	 * @param {Function} p.init the code which initializes this entity's behavior
	 * @param {Function} p.logic the behavioral logic for this entity during each synchronized app update
	 * @param {String} p.color the CSS representation of the color of this entity to draw with
	 * @param {BAMF} p.app the BAMF application this entity is associated with
	 * @augments BAMF.E
	 */
	Canvas2D.TxtE = function(p)
	{	/**
	 	* The actual text to display
	 	* @type {String}
	 	*/
		this.txt = p.txt || "";

		/**
		 * The color to draw this text on the app
		 * @type {string}
		 */
		this.color = p.color || '#FFFFFF';

		/** whether or not the text entity scrolls/zooms along with a level
		 * @type {Boolean}*/
		this.fixedPos = p.fixedPos || true;

		BAMF.E.call(this, p);	//make this an entity! JS magic
	};

	//note: html5 drawing method is as follows:
	//void strokeText(in DOMString text, in float x, in float y, [optional] in float maxWidth)
	Canvas2D.TxtE.prototype =
	{	draw : function()
		{	var app = this.app,
			ctx = app.renderer.context;

			var xDrawPos   = Math.round(this.x),
				yDrawPos   = Math.round(this.y),
				xScrOffset = !this.fixedPos ? app.level.getScrollX() : 0,
				yScrOffset = !this.fixedPos ? app.level.getScrollY() : 0;

			var xDraw = xDrawPos - xScrOffset,
				yDraw = yDrawPos - yScrOffset;

			ctx.font = '14px'
			ctx.fillStyle = this.color;
			ctx.lineWidth = 1;
			ctx.fillText(this.txt, xDraw, yDraw);
		}
	};

	return Canvas2D;
});