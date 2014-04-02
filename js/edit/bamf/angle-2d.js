/** module which provides convenient functions for converting between
 *  cartesian points and angles in 2D as well as some other common
 *  trigonometric functions
 *  @module Angle2D
 *  @author Robert Concepcion III
 *  @date 11/13/2013
 */
define([], function(){
	//-------------------------------------------------------------------------//
	//          PRE-COMPUTATIONS FOR FASTER RETRIEVALS
	//-------------------------------------------------------------------------//
	//indexes for degree to radian conversion values
	var dToR = [];

	for(var i = 0; i < 360; i++)
	{
		dToR[i] =  i * (Math.PI / 180);
	}
	//-------------------------------------------------------------------------//
	return {        //MODULE DEFINITION
		/** convert points to angle */
		pointToAngle : function(x, y)
		{
			return this.radianToDeg(Math.atan(y/x));
		},
		angleToPoint  : function(angle, distance)
		{
			var radians = this.degToRadians(angle);
			return {
						x : Math.cos(radians)  * distance,
						y : Math.sin(radians)  * distance
				   }
		},

		/** calculates the length of a coordinate from center(0,0)
		 *  using simple euclidean distance */
		calcPointDist : function(x, y)
		{
			return Math.sqrt(x * x + y * y);
		},

		/** convert radians to degrees;
		 *  NOTE: only use ths when performance is not essential,
		 *  as there is overhead from calling a function
		 * @param radians
		 * @returns {number} radians converted to (360) degrees
		 */
		radianToDeg : function(radians)
		{
			return radians / (Math.PI / 180);
		},

		/** convert degrees to radians;
		 *  note: only use this when performance is not essential,
		 *  as there is overhead from calling a function, otherwise use degToRadianI
		 * @param radians
		 * @returns {number} radians converted to (360) degrees
		 */
		degToRadians : function(degrees)
		{
		 	return degrees * (Math.PI / 180);
		},

		 /** convert degrees to radians;
		 *  note: this version uses a precomputed index and is less precise but faster
		 *  as there is overhead from calling a function, otherwise use degToRadian
		 * @param degrees
		 * @returns {number} radians converted from an angle
		 */
		degToRadianI : function(angle)
		{
			var aIndex = Math.floor(angle) % 360;
			return dToR[aIndex];
		}
	};
});