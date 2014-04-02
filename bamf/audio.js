/**
 * @module  BAMFAudio
 * @exports BAMFAudio
 * @requires BufferLoader
 */
define(['bamf/buffer_loader'],
function(bL)
{
	/**
	 * @class Audio resource pool for all BAMF Apps running on a page
	 * @alias module:BAMFAudio
	 */
	var BAMFAudio =
	{
		ctx : undefined,
		sndBuffers : undefined,
		readyState : false,
		/**
		 * initialize the BAMF Audio module, providing the url of the sounds
		 * you wish to provide
		 * @param {String[]} sndSrcs an array of String URLs where we can locate our
		 * sound resources
		 * @method
		 */
		init : function(sndSrcs)
		{
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			BAMFAudio.ctx = new AudioContext();

			/** save sounds into the sndBuffers var when they are finished loading asynchronously */
			var finishedLoading = function(bufferList)
			{ BAMFAudio.sndBuffers = bufferList;
				BAMFAudio.readyState = true; };

			var sndDir = "..\\snd\\";
			/** load all sound buffers into RAM then call the finishedLoading method */
			var bufferLoader = new bL(BAMFAudio.ctx, sndSrcs, finishedLoading);
			bufferLoader.load();
		},
		/**
		 * play a sound, using the index as the position from which you declared the sound
		 * in the init function
		 * @param {Number} sndIndex the index of our sound resource as loaded
		 * @method
		 */
		playSnd : function(sndIndex)
		{
			if(BAMFAudio.readyState)
			{
				var src = BAMFAudio.ctx.createBufferSource();
				src.buffer = BAMFAudio.sndBuffers[sndIndex];
				src.connect(BAMFAudio.ctx.destination);
				src.start(sndIndex);
			}
		}
	};
	return BAMFAudio;
});