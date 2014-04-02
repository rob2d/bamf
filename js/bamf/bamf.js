
/** requestAnimFrame wrapper function
 *       created by Paul Irish
 * http://www.paulirish.com/2011/requestanimationframe-for-smart-animating */
window.requestAnimFrame = (function()
{
	return  window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(/* function */ callback, /* DOMElement */ element)
		{
			window.setTimeout(callback, 1000 / 50);
		};
})();


/**
 * @class the main BAMF application module which takes care of
 * timing, setting up the div as well as Entities and sound. This module
 * is contained within the bamf.js file and is called with require.js by defining
 * it as 'bamf/bamf'
 * @module  BAMF
 * @exports BAMF
 * @requires BAMFAudio
 */
define(['bamf/key'],
function()
{	/**
	 * @constructor
	 * @alias module:BAMF
	 * @class
	 * @param {Object} params  parameters supplied to the constructor
	 * @param {HTMLElement} params.$canvas the HTML canvas element to bind this app to
	 * @param {Number} params.virtualW the width in pixels of the app's working area
	 * @param {Number} params.virtualH the height in pixels of the app's working area
 	 * @param { Input | Input[] }  params.input the input modules/device(s) to listen in on this app when it is created
	 * @param {Object} params.settings settings given to this app
	 * @param {Boolean} params.settings.fullScreen whether the app goes into fullScreen or not
	 * @param {Number} params.settings.scale if this is set, fullScreen is by default off and assigned
	 */
	var BAMF = function(params)
	{	/** registered input modules; they implement a runLogic() method which is run before entities have their logic checked
		 * @type {Array(Input)} */
		this.inputModules = [];

		if(params.input instanceof Array)
		{   this.inputModules.push(params.input);
		}
		else if(params.input instanceof Object)
		{	this.inputModules.push(params.input);
		}

		this.lastEvent = new Date();

		/** app config object
		 * @type {Object} **/
		this.settings =
		{   fullScreen : params.fullScreen || false,
			scale      : params.scale || 1.0
		};
		this.rtRemovedEs = [];

		//set up the window size & parameters
		this.virtualW = params.virtualW || 400;
		this.virtualH = params.virtualH || 400;

		this.bounds =
		{   top   : 0,
			left  : 0,
			right : this.virtualW,
			bottom: this.virtualH
		}

		this.renderer = params.renderer;
		this.renderer.app = this;
		this.renderer.virtualW = this.virtualW;
		this.renderer.virtualH = this.virtualH;
		this.renderer.bounds   = this.bounds;

		this.scenes = [];
		this.scene = new BAMF.Scene({app : this});

		var that = this;
		//listen for window resize events
		window.addEventListener('resize',
			function(){that.renderer.refreshSize();});
	};

	/** set the index of the scene this app should be running
	 * @method */
	BAMF.prototype.setScene = function(index)
	{	if(this.scenes[index])
		{	this.scene = this.scenes[index]; }
		else console.log("could not set the scene as it doesn\'t exist!");
	};

	/** add a Scene and link it to this app
	 * @method */
	BAMF.prototype.addScene = function(scene)
	{	this.scenes.push(scene);
		this.scene.app = this;
	};

	/**
	 * app logic which is run during each "tick"
	 * @method */
	BAMF.prototype.runLogic = function()
	{   var entities = this.scene.entities;
		this.renderer.preLogicRender();	//clear the scene
		for(var i = 0, n = this.inputModules.length; i < n; i++)
			this.inputModules[i].detectionLogic();//run input detection logic

		for(var i = 0, n = entities.length; i < n; i++)
		{	var e = entities[i];
			if(e.logic) e.logic();
			if(e.draw)  e.draw();
		}

		var app = this;
		window.requestAnimFrame(function(){app.runLogic();});
	};

	/**
	 * initialize and begin the app's logic loop!
	 * @method */
	BAMF.prototype.start = function()
	{	var that = this;
		this.renderer.refreshSize();
		this.runLogic();
	};


	/**
	 * adds an entity to the current scene running
	 * @param {BAMF.E} entity the entity to add
	 * @method
	 * @returns {*}
	 */
	BAMF.prototype.addEntity = function(entity)
	{	return this.scene.add(entity);
	}

	BAMF.prototype.addInput = function(i)
	{	this.inputModules.push(i);
	};

	/**
	 * @class Represents a Scene in a BAMF app, generally responsible for managing
	 * (adding, retrieving, removing) entities to be run and displayed at any given time
	 * @param {Object} p properties passed to the constructor
	 * @param {BAMF} p.app the application to associate this with(optional, can be added later)
	 */
	BAMF.Scene = function(p)
	{   this.app = p.app || undefined;
		this.entities = [];
	}

	BAMF.Scene.prototype =
	{	/**
		  * add an entity to the scene
		  * @return the app's recorded entity ID of the entity just added
		  * @method
		  **/
		add: function(entity)
		{   entity.destroyed = false;     //flag which represents whether the entity is still active!
			if(!entity.app)
				entity.app = this.app;	//attach the entity to this app if one doesn't exist
			this.entities.push(entity);
			var eID = this.entities.length - 1;
			/** entity ID; an index for the object within the BAMF App to retrieve from the global array*/
			entity.eID = eID;
			return eID;
		},
		/**
		 * retrieve an entity based on it's ID
		 * @param {Number} eID ID number of entity to fetch
		 * @returns {BAMF.E} the entity with the proper ID or <b>undefined</b> if the entity was destroyed/doesn't exist
		 * @method
		 */
		getEntityById : function(eID)
		{   return this.entities[eID]; },

		/**
		 * remove a Scene from an app
		 * @param {Number} eID ID number of entity to remove
		 * @returns {Boolean} whether the entity existed(and was successfully removed) or not.
		 * @method
		 */
		remove : function(eID)
		{
			if(this.getEntityById(eID))
			{
				var entities = this.entities;
				entities[eID] = entities[entities.length];
				delete entities[entities.length];
				return true;
			}
			else return false;
		},

		/**  the level currently loaded into the scene.
		 * 	By default, we use one that requires a minimal footprint, but
		 * 	if a scene specifies a real scrolling level, we use the
		 * 	appropriate map data.
		 * @type {BAMF.Level}
		 **/
		level :
		{
			getScrollX : function(){ return 0; },
			getScrollY : function(){ return 0; }
		}
	};

	/**
	 * A Renderer interface, allows the BAMF App to display itself onto an element on a page
	 * @param p
	 * @constructor
	 * @abstract
	 */
	BAMF.Renderer = function(p)
	{
	};

	BAMF.Renderer.prototype =
	{   /** return the rectangle which represents this Renderer's drawing surface
	 	 * 	@abstract
	 	 * 	@method
	 	 */
		getBounds : function()
		{ throw new Error('the Renderer must implement a getBounds() method in its extending class!'); },
		/**
		 * reacts when a window changes size; in case the window is fullscreen and changes or there
		 * is some overriding functionality within the Renderer
		 * @abstract
		 * @method
		 */
		refreshSize : function()
		{ throw new Error('the Renderer must implement a refreshSize() method in its extending class!'); },
		/**
		 * clear the screen for re-rendering
		 * @abstract
		 * @method
		 */
		preLogicRender : function()
		{ throw new Error('the Renderer must implement a preLogicRender() method in its extending class!'); }
	};

	/**
	 * Creates a new Entity with the given parameter object literal
	 * @class the base Entity class which can exist independently in an BAMF App. This class must be extended to be
	 * of any use aside from simple time based logic updates as it does not have a draw() method
	 * @param {Object} p parameters to supply the constructor
	 * @param {Number} p.x initial x position
	 * @param {Number} p.y initial y position
	 * @param {Function} p.init the code which initializes this app's behavior
	 * @param {Function} p.logic the behavioral logic for this app during each synchronized app update
	 * @param {BAMF} p.app the BAMF application this entity is associated with
	 * @abstract
	 **/
	BAMF.E = function(p)
	{
		/**
		 * whether or not an entity has loaded fully yet
		 * @type {*|boolean} */
		this.isLoaded = this.isLoaded || false;

		/** the behavior logic for this app during each logic update of the app
		 * @type {Function} */
		this.logic = p.logic || undefined;

		/**
		 *  the BAMF app that this entity is running on
		 * @type {BAMF} */
		this.app    = p.app || undefined;

		if(this.app)
			this.eID = this.app.addEntity(this);

		if(p.init)
			p.init.call(this);
	};

	/**
	 * Draw this entity on the associated app's rendering context
	 * (typically provided with the library)
	 *  @method
	 *  @abstract
	 */
	BAMF.E.prototype.draw = function()
	{
		throw new Error('draw() must be implemented by the E subclass!');
	};

	/**
	 * An input entity interface
	 * @constructor
	 */
	BAMF.Input =
	{
	};

	BAMF.Input.prototype =
	{  /**
	 	* The logic run with events for detecting input
	 	* @abstract
	 	* @method
	 	*/
		detectionLogic : function()
		{ throw new Error('detectionLogic() must be implemented by the Input subclass!'); }
	};


	/**
	 * creates a new Level
	 * @class Represents the scrollable area and status of a BAMF app and allows for setting up tile maps
	 * efficiently
	 * @param {Object} p parameters to supply the constructor
	 * @param {Number} p.scrollX initial x scroll position
	 * @param {Number} p.scrollY initial y scroll position
	 * @param {Number} p.tileW width of individual tiles
	 * @param {Number} p.tileH height of individual tiles
	 * @param {BAMF} p.app the BAMF application this entity is associated with
	 * @constructor
	 */
	BAMF.Level = function(p)
	{
		this.scrollX = p.scrollX || 0,
		this.scrollY = p.scrollY || 0,
		this.tileMap = p.tileMap || {},
		this.tileW   = p.tileW || 16,
		this.tileH   = p.tileH || 16,
		this.app     = p.app;				//must be defined!
	};

	BAMF.Level.prototype =
	{
		/** retrieve leftmost horizontal scroll position
		 * @method*/
		getScrollX : function()
		{
			return this.scrollX;
		},
		/** retrieve topmost vertical scroll position
		 * @method*/
		getScrollY: function()
		{
			return this.scrollY;
		},
		/** set the scroll position of the leftmost pixel on screen
		 * @method*/
		setScrollX : function(x)
		{
			if(this.x < 0)
				x = 0;
			this.scrollX = x;
		},
		/** change the scroll position of the topmost pixel on screen
		 * @method*/
		setScrollY : function(y)
		{
			if(y < 0)
				y = 0;
		}
	};
	return BAMF; 	//return the BAMF variable/namespace as module
});