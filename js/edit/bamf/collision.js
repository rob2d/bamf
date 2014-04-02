/**
 * @module  Collision
 * @exports Collision

 * @requires BAMF
 */
define(['bamf/bamf'], function(BAMF)
{   /**
 	  * The Collision module provides convenient methods for testing the collision
	  * of objects in BAMF apps.
	  * @alias module:Collision
 	  * @requires module:BAMF
 	 **/
	var Collision = {
		/**
		 * check whether there is a collision between 2 objects.
		 * note: objects have to be constructed with the Collidable interface;
		 * in other words it must have a getBounds() method which returns a rectangle
		 * in the form of {left, top, right, bottom}
		 * @method
		 * @param {Collidable} obj1
		 * @param {Collidable} obj2
		 * @returns {Boolean} whether or not there is a collision
		 */
		objCollision : function(obj1, obj2)
		{
			return rectCollision(obj1.getBounds(), obj2.getBounds());
		},
		/**
		 * check whether there is a collision between 2 rectangles.
		 * These rectangles should have a member for top, bottom, left, right
		 * specified
		 * @method
		 * @param {Rectangle} bounds1
		 * @param {Rectangle} bounds2
		 * @returns {Boolean} whether or not there is a collision
		 */
		rectCollision : function(bounds1, bounds2)
		{
			if(bounds1.left > bounds2.right || bounds1.right < bounds2.left ||
				bounds1.top > bounds2.bottom || bounds1.bottom < bounds2.top)
			{
				return false;
			}
			return true;
	 	}
	};

	return Collision;
});