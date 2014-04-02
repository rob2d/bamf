/**
 * @module Key
 * @exports Key
 * @augments BAMF.Input
 */

define([], function()
{   /**
	 * @alias module:Key
	 * @class Stores key press states. This module is contained within the key.js file and is called with require.js by defining
	 * it as 'bamf/key'
	 */
	var Key =
{
	/** collection of key constants defined */
	keys : [],
	_pressed: {},

	/** the constant value assigned to a KEY PRESSED input condition on a key
	 * @type Number
	 * @instance
	 * @constant
	 */
	KEY_PRESSED : 1,

	/** the constant value assigned to a KEY HELD(after/excluding KEY PRESSED) input condition on a key
	 * @type Number
	 * @instance
	 * @constant
	 */
	KEY_HELD    : 2,

	/**
	 * stores the state of each of the keys pressed within the app
	 *  @type Object
	 *  @default all keys are set to 0 -> !(Key.KEY_PRESSED || Key.KEY_HELD)
	 *  @instance
	 */
	state : {},

	/**
	 *  whether a key on a keyboard is currently pressed/held
	 *  @method
	 *  @memberOf Key
	 *  @instance
	 *  @param {Number} keyCode the numerical code corresponding to the key tested
	 *  @returns {Boolean} <b>true</b> if key down, <b>false</b> if not
	 */
	isDown : function(keyCode) {
		return this._pressed[keyCode];
	},
	onKeydown : function(event) {
		this._pressed[event.keyCode] = true;
	},
	onKeyup : function(event) {
		delete this._pressed[event.keyCode];
	},
	/** detect which keys are pressed at the moment */
	detectionLogic : function()
	{
		for(key in Key.keys)
		{
			var keyValue = Key.keys[key];
			if(Key.isDown(keyValue))
				Key.state[key] = ++Key.state[key] < 2 ? 1 : 2;
			else Key.state[key] = 0;
		}
	},
	/** define a constant to use for a key, which will then be registered in Key.state[keyName]
	 *  and automatically check the char codes for the keys during game logic.
	 * @param keyName
	 * @param keyConstant
	 */
	define : function(keyName, keyConstant)
	{
		Key.keys[keyName]  = keyConstant;
		Key.state[keyName] = 0;
	}

};

	//add window event listeners for registered keys before returning this module
	window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
	window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

	//return the Key module!
	return Key;
});