SrcTools =
{
	TAB : '     ',
	getScopedStr : function(str, scopeLvl)
	{
		var returnStr = '';
		for(var i = 0; i < scopeLvl; i++)
		{
			returnStr+= SrcTools.TAB;
		}
		returnStr += str;

		return returnStr;
	},
	writeLnToW: function(str, scopeLvl, w)
	{
		for(var i = 0; i < scopeLvl; i++)
			w.document.write(SrcTools.TAB);
		w.document.writeln(str);
	},
	writeToStr : function(str, destStr)
	{
		destStr += str;
	},
	writeLnToStr : function(str, scopeLvl, destStr)
	{
		console.log('writeLnToStr started at ' + destStr);
		for(var i = 0; i < scopeLvl; i++)
			destStr += SrcTools.TAB;
		destStr+= str + '\n';
		console.log('writeLnToStr ended at ' + destStr);
	},
	writeToW: function(str, w)
	{
		w.document.write(str);
	}
}