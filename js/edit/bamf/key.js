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
	var Key = {
	_pressed: {},

	/** the keycode assigned to a LEFT input action
	 * @type Number
	 * @instance
	 * @default 37
	 */
	LEFT:  37,

	/** the keycode assigned to a UP input action
	 *  @type Number
	 *  @instance
	 *  @default 16
	 */
	UP:    16,

	/** the key assigned to a RIGHT input action
	 * @type Number
	 * @instance
	 * @default 39
	 */
	RIGHT: 39,

	/** the key assigned to a RIGHT input action
	 * @type Number
	 * @instance
	 * @default 40
	 */
	DOWN:  40,

	/** the key assigned to a ACTION 1 input action
	 * @type Number
	 * @instance
	 * @default 32
	 */
	A1:    32,

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
	state : {
		KEY_LEFT:  0,
		KEY_RIGHT: 0,
		KEY_UP   : 0,
		KEY_DOWN : 0,
		KEY_A1   : 0
	},

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
	{	//detect key presses/holds
		if(Key.isDown(Key.UP))
			Key.state.KEY_UP = ++Key.state.KEY_UP < 2 ? 1 : 2;
		else Key.state.KEY_UP = 0;

		if(Key.isDown(Key.DOWN))
			Key.state.KEY_DOWN = ++Key.state.KEY_DOWN < 2 ? 1 : 2;
		else Key.state.KEY_DOWN = 0;

		if(Key.isDown(Key.LEFT))
			Key.state.KEY_LEFT = ++Key.state.KEY_LEFT < 2 ? 1 : 2;
		else Key.state.KEY_LEFT = 0;

		if(Key.isDown(Key.RIGHT))
			Key.state.KEY_RIGHT = ++Key.state.KEY_RIGHT < 2 ? 1 : 2;
		else Key.state.KEY_RIGHT = 0;

		if(Key.isDown(Key.A1))
			Key.state.KEY_A1 = ++Key.state.KEY_A1 < 2 ? 1 : 2;
		else Key.state.KEY_A1 = 0;
	}};

	//add window event listeners for registered keys before returning this module
	window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
	window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

	//return the Key module!
	return Key;
});