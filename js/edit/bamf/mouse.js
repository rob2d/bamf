/** TODO -> add a resize or app move event which re-calculates things,
 *  not essential atm */
/**
 *  @class Mouse object, which is used to detect screen taps on an app as well as where the mouse position is when considering app's position & scale.
 * @module  Mouse
 * @exports Mouse
 * @requires BAMF
 */
  define(['bamf/bamf', 'bamf/canvas2d'], function(BAMF, Canvas2D)
{
	/**
	 *  @constructor
	 *  @alias module:Mouse
	 *  @class
	 *  @param {Object} p parameters supplied to the constructor
	 *  @param {BAMF} p.app BAMF app the mouse object is attached to
	 *  */
	var Mouse =  function(p)
	{
		var that = this;
		this.app = p.app;

		var appTW, appTH, appW, appH, appX, appY;

		var refreshAppAttrs = function()
		{   	appTW = p.app.virtualW,
				appTH = p.app.virtualH,
				appW  = parseInt(p.app.renderer.$canvas.offsetWidth),
				appH  = parseInt(p.app.renderer.$canvas.offsetHeight),
				appX  = p.app.renderer.$canvas.offsetLeft,
				appY  = p.app.renderer.$canvas.offsetTop;

		};
		refreshAppAttrs();
		window.addEventListener('resize', function(){refreshAppAttrs();});

		//recalculate in case our app resizes
		var zoomX = appTW / appW,
			zoomY = appTH / appH;

		var mouseX = 0, mouseY = 0;

		var clickEvents = [];	//stores the mouse click events

		/** an entity to be used in BAMF apps which attaches to scenes and
		 *  then listens for clicks to be tested in object logic.
		 *  It contains a member named 'clickEvent' which contains {appX, appY}
		 *  variables if a user has clicked on the object
		 *  @memberOf Mouse
		 **/
		var SceneClickListener = function()
		{   /** stores the most recent click event in the form of {appX, appY} */
			this.clickEvent = undefined;
		};

		SceneClickListener.prototype.logic = function()
		{
			this.clickEvent = undefined;
			if(clickEvents.length > 0)
			{   this.clickEvent = clickEvents.pop();  //get most recent click event
				clickEvents.length = 0;				  //clear the array
			};
		};

		// track mouse move events within the window to provide for getX() and getY()
		window.document.addEventListener('mousemove', function(e)
		{
			mouseX = e.clientX;
			mouseY = e.clientY;
		});

		//track app's click events, passing the x coordinate relative to the app
		this.app.renderer.$canvas.addEventListener('mousedown', function(e)
		{
			clickEvents.push({appX : (e.offsetX) / zoomX, appY : (e.offsetY) / zoomY});
		});

		var returnObj = {
			/**
			 * gets the current x position of the mouse in relation to the app and its scale
			 * @memberOf module:Mouse
			 * @method
			 * @returns {number}
			 */
			getX : function(){ return (mouseX - appX) / zoomX; },
			/**
			 * gets the current y position of the mouse in relation to the app and its scale
			 * @memberOf module:Mouse
			 * @method
			 * @returns {number}
			 */
			getY : function(){
				return (mouseY - appY) / zoomY; },
			SceneClickListener : SceneClickListener
		};

		return returnObj;
	}
	return Mouse;
});