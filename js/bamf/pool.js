define([], function()
{
	var Pool = function(p)
	{
		/** array of contained available objects to pool from */
		this.objects = [];

		this.retrieveObj = function()
		{
			var returnObj =  (this.objects > 0) ? this.objects.pop() : this.createObj();
			returnObj.destroyed = false;
		};
		/**assign the function to retrieve a new object,
		 * can be given parameters, but must accept being called without arguments as well! */
		this.createObj = p.createObj || function(){throw 'must define createObj method for Pool!';};

		this.addToPool = function(obj)
		{   if(obj.destroy) obj.destroy();	//call destroy method if applicable
			/** add this object to our list of pooled objects */
			this.objects.push(obj);
		};
	};
	return Pool;
});