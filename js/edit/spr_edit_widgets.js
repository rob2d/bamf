/** @title */

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob)
{
  // Great success! All the File APIs are supported.
} else
{
  alert('The File APIs are not fully supported so some widgets cannot load properly. Please upgrade your browser.');
}

/**
 *  @class
 *  widget which allows a user to customize an image list component
 *  @param {Object} params set of parameters to supply
 *  @param.$domE {HtmlElement} the DOMelement that this image frame lister is associated with
 *  @param.selectFn {Function} function to call when an image is selected(img data is sent as an object to the fn)
 **/
var ImgFrameLister = function(params)
{
	var that = this;    	//the magical JS reference to myself! :D

	//find/define DOM elements
	this.$domE = params.$domE;   //parent given with params
	this.$uploader;
	this.$thumbList;
	this.$thumbScroller;
	this.imgFrames = [];
	//called when an object is changed
	this.selectFn = params.selectFn || undefined;
	/** called when the imgList is changed, passing the image frame data to the function as the first parameter */
	this.onListChange = params.onListChange;

	YUI().use('node', 'scrollview',
	function(Y)
	{
		var yDomE = Y.one(that.$domE);
		that.$uploader = yDomE.one('.img_uploader')._node;
		var eHeight =  yDomE.getStyle('top') - that.$uploader.offsetHeight;
		yDomE.setStyle('height', eHeight);

		that.$thumbList= yDomE.one('.thumb_list')._node;
		that.$thumbList.setAttribute('id', 'thumb_list_1');
		that.$uploader.addEventListener('change', that, false);

		that.scrollView = new Y.ScrollView(
		{
			srcNode: '#' + that.$thumbList.id,
			height: (that.$domE.offsetHeight - that.$uploader.offsetHeight),
			flick: {
				minDistance:10,
				minVelocity:0.3,
				axis: "y"
					}
		});
		var content = that.scrollView.get("contentBox");
		//append enough content for scrollbar to appear; a hot-fix for YUI ScrollView
		for(var i = 0; i < 300; i++)
			content.append(i + '<br/>');

		that.scrollView.render();
		content.empty();

		content.delegate("click", function(e) {
			// Prevent links from navigating as part of a scroll gesture
			if (Math.abs(scrollView.lastScrolledAmt) > 2) {
				e.preventDefault();
				Y.log("Link behavior suppressed.")
			}
		}, "a");

		content.delegate("mousedown", function(e) {
			// Prevent default anchor drag behavior, on browsers which let you drag anchors to the desktop
			e.preventDefault();
		}, "a");
	});

	window.addEventListener('resize', function(){that.refreshListView();}, true);
}

ImgFrameLister.prototype =
{
	refreshListView : function()
	{
		//clear and then create the images in the Thumbnail List!
		if(this.scrollView)
		{
			var content = this.scrollView.get('contentBox');
			content.empty();
			if(this.imgFrames)
			{
				for(var i = 0; i < this.imgFrames.length; i++)
				{
					this.addDOMImg(i, this.imgFrames[i].src);
				};
			}

			var that = this;
			YUI().use('node', function(Y)
			{
				var yDomE = Y.one(that.$domE);
				that.$uploader = yDomE.one('.img_uploader')._node;
				var eHeight =  yDomE.getStyle('top') - that.$uploader.offsetHeight;
				content.setStyle('height', eHeight);
			});
			this.onListChange(this.imgFrames);
			this.selectImgIndex(-1);	//reset selection
		}
	},
	addDOMImg : function(imgIndex, src)
	{
		var that = this;
		var domID = this.$domE.id;

		var thumbBox = document.createElement('div');
		thumbBox.className = 'thumb_box';
		thumbBox.setAttribute('id', domID + '_thumb_box_' + imgIndex);
		thumbBox.setAttribute('img_index', imgIndex);

		var thumbFrameP = document.createElement('p');
		thumbFrameP.className = 'thumb_frame_no';
		thumbFrameP.innerHTML = imgIndex;
		var thumbImg = document.createElement('img');
		thumbImg.className='thumb_frame';
		thumbImg.src = src;
		thumbImg.setAttribute('id', domID + '_thumb_' + imgIndex);

		thumbBox.onclick = function()
		{
			//selecting the image as a new selection
			if(this.className == 'thumb_box')
			{
				this.className = 'thumb_box thumb_box_s';
				that.selectImgIndex(this.getAttribute('img_index'));
			}
		}

		thumbBox.appendChild(thumbImg);
		thumbBox.appendChild(thumbFrameP);

		if(imgIndex < this.imgFrames.length - 1)
		{
			var thumbShiftDown = document.createElement('div');
			thumbShiftDown.className = 'thumb_shift_down';
			thumbBox.appendChild(thumbShiftDown);
			thumbShiftDown.onclick = function()
			{
				that.swapImgs(imgIndex, imgIndex + 1);
				that.refreshListView();
				that.selectImgIndex(imgIndex + 1);
			};
		}
		if(imgIndex > 0)
		{
			var thumbShiftUp = document.createElement('div');
			thumbShiftUp.className = 'thumb_shift_up';
			thumbBox.appendChild(thumbShiftUp);
			thumbShiftUp.onclick = function()
			{
				that.swapImgs(imgIndex, imgIndex - 1);
				that.refreshListView();
				that.selectImgIndex(imgIndex - 1);
			};
		}
		var content = this.scrollView.get('contentBox');
		content.append(thumbBox);
		this.scrollView.syncUI();
	},
	swapImgs : function(i1, i2)
	{
		if(this.imgFrames[i1] && this.imgFrames[i2])
		{
			var imgFrame1 = this.imgFrames[i1];
			this.imgFrames[i1] = this.imgFrames[i2];
			this.imgFrames[i2] = imgFrame1;
		}
		this.refreshListView();
	},

	/**set whether to enable or disable images
	 * @function
	 * @param {boolean} enabled whether to enable the image or not*/
	setEnabled : function(enabled)
	{
		if(this.$uploader)
			this.$uploader.disabled = !enabled;
	},
	/** handle an uploaded image */
	handleEvent : function(e)
	{
		console.log(e);
		var files = e.target.files; //get ref to selected file(s)
		var that = this;
		for(var i = 0, f; f = files[i]; i++)
		{
			var reader = new FileReader();
			//closure to capture the info
			reader.onload = (function(theFile)
			{
				return function(e)
				{
					//var animIndex = AnimListHdlr.$selector.selectedIndex;
					if(!that.imgFrames)
					{
						that.imgFrames = [];
					}
					that.imgFrames.push
					({  //Create an ImageFrameData object!
						xO: 0,
						yO: 0,
						src:e.target.result,
						srcFName: fileName
					});
					that.refreshListView();
					var newImgIndex = that.imgFrames.length - 1;
				};
			})(f);
			//read in the image as a data URL & call above closure
			reader.readAsDataURL(f);
			console.log('handling a file select');
		}

		var filePath = this.$uploader.value,
			fileName = filePath.replace(/^.*(\\|\/|\:)/, '');
		//reset files contained in the image uploader
		this.value='';
	},

	getImgIndex : function()
	{
		return this.selectedIndex;
	},
	selectImgIndex : function(index)
	{
		this.selectedIndex = index;
		var domID = this.$domE.id;
		var imgCount = this.imgFrames.length;
		for(var i = 0; i < imgCount; i++)
		{
			var $thumbBox = document.getElementById(domID + '_thumb_box_' + i);
			if(i == index)
				$thumbBox.className = 'thumb_box thumb_box_s';
			else
				$thumbBox.className = 'thumb_box';
		}
		if(this.selectFn)
		{
			this.selectFn(this.imgFrames[index]);
		}
	}
};

/**
 *
 * @param params parameters supplied to create this image preview frame
 * @param params.onSetXOffset a function which is called when the set X offset input value is changed
 * @param params.onSetYOffset a function which is called when the set Y offset input value is changed
 * @returns {{setImg: Function, setXOffset: Function, setYOffset: Function}}
 * @constructor
 */
var ImgFPreview = function(params)
{
	var that = this;
	var img = undefined;

	//callback functions!
	this.onSetXOffset = params.onSetXOffset;
	this.onSetYOffset = params.onSetYOffset;

	//load and adjust the main dom element
	this.$domE = params.$domE;
	this.$domE.style.overflowX = 'scroll';
	this.$domE.style.overflowY = 'scroll';
	this.$zoomIn = document.getElementById(this.$domE.id + '_zi');
	this.$zoomOut = document.getElementById(this.$domE.id + '_zo');
	this.$zoomRange = document.getElementById(this.$domE.id + '_r');
	this.$frameStepBack = document.getElementById(this.$domE.id + '_step_b');
	this.$frameStepFwd = document.getElementById(this.$domE.id + '_step_f');

	this.$offsetX = document.getElementById(this.$domE.id + '_xo');
	this.$offsetY = document.getElementById(this.$domE.id + '_yo');

	this.$offsetX.addEventListener('change', function()
	{
		var value = parseInt(that.$offsetX.value);
		if(typeof value === 'number' && value % 1 == 0)
		{
			that.setXOffset(value);
		}
		else
		{
			that.$offsetX.value = 0;
			that.setXOffset(0);
		}
	});

	this.$offsetY.addEventListener('change', function()
	{
		var value = parseInt(that.$offsetY.value);
		if(typeof value === 'number' && value % 1 == 0)
		{
			that.setYOffset(value);
		}
		else
		{
			that.$offsetY.value = 0;
			that.setYOffset(0);
		}
	});

	this.$zoomIn.addEventListener('click', function(e){e.preventDefault(); that.zoomIn();});
	this.$zoomOut.addEventListener('click', function(e){e.preventDefault(); that.zoomOut();});
	this.$zoomRange.addEventListener('change', function()
	{
		var zoomStep = parseInt(that.$zoomRange.value);
		that.setZoomStep(zoomStep);
	});
	this.$frameStepBack.addEventListener('click', function(e)
	{
		e.preventDefault();
		params.previousFrame();
	});

	this.$frameStepFwd.addEventListener('click', function(e)
	{
		e.preventDefault();
		params.nextFrame();
	});
	//create & attach the canvas where we'll display image previews
	this.$canvas = document.createElement('canvas');
	this.$canvas.setAttribute('id', this.$domE.id + '_canvas');
	this.$domE.appendChild(this.$canvas);

	this.zoom = 1.0;
	this.img = undefined;

	return {
		setFrameData : function(imgData){that.setFrameData(imgData);},
		getImgData   : function(){ return that.imgData;}
	};
};

ImgFPreview.prototype =
{
	MAX_ZOOM: 5,
	setImg : function(newImgUrl)
	{
		if(newImgUrl)
		{
			this.img = new Image();
			this.img.src = newImgUrl;
			this.$canvas.width  = this.img.width;
			this.$canvas.height = this.img.height;

			this.$offsetX.disabled = false;
			this.$offsetY.disabled = false;
		}
		else
		{
			this.img = undefined;
			this.$offsetX.disabled = true;
			this.$offsetY.disabled = true;
		}
		this.setZoomStep(3.0);
		this.refreshPreview();
	},
	setFrameData : function(imgData)
	{
		console.log('setFrameData imgData is');
		console.log(imgData);
		this.imgData = imgData;
		if(imgData)
		{
   			this.setImg(imgData.src);
			this.$offsetX.value = imgData.xO;
			this.$offsetY.value = imgData.yO;
		}
		else
			this.setImg(undefined);
	},
	refreshPreview : function()
	{
		var ctx = this.$canvas.getContext('2d');
		ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);

		if(this.img)
		{
			ctx.drawImage(this.img, 0, 0);
		}

		if(this.imgData)
		{
			var xCenter = this.imgData.xO;
			var yCenter = this.imgData.yO;

			ctx.strokeStyle = '#aaaaaa';
			//draw offset drawing point!
			ctx.globalCompositeOperation = 'lighter'; //enable src + dest drawing colors
			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.arc(xCenter, yCenter, 5, 0, Math.PI * 2, false);
			ctx.closePath();
			ctx.stroke();
			ctx.globalCompositeOperation = 'source-over'; //reset composite op
		}
	},
	setXOffset : function(xO)
	{
		//  modify the data, call the callback function defined in constructor,
		// then refresh view
		this.imgData.xO = xO;
		this.onSetXOffset(xO);   	//the callback
		this.refreshPreview();
	},
	setYOffset : function(yO)
	{
		//  modify the data, call the callback function defined in constructor,
		// then refresh view
		this.imgData.yO = yO;
		this.onSetYOffset(yO);   	//the callback
		this.refreshPreview();
	},
	setZoom : function(zoom)
	{
		this.zoom = zoom;
		if(this.img)
		{
			this.$canvas.style.width = (this.img.width  * zoom) + 'px';
			this.$canvas.style.height= (this.img.height * zoom) + 'px';
		}
		this.$zoomRange.value = this.getZoomStep();
	},
	getZoomStep : function()
	{
		switch(this.zoom)
		{
			case 0.25: return 1; break;
			case 0.5 : return 2; break;
			case 1.0 : return 3; break;
			case 2.0 : return 4; break;
			case 4.0 : return 5; break;
		}
	},
	setZoomStep : function(step)
	{
		var zoom;
		switch(step)
		{
			case 1:
				zoom = 0.25;
				this.$zoomIn.disabled = false;
				this.$zoomOut.disabled = true;
				break;
			case 2:
				zoom = 0.50;
				this.$zoomIn.disabled = false;
				this.$zoomOut.disabled = false;
				break;
			case 3:
				zoom = 1.00;
				this.$zoomIn.disabled = false;
				this.$zoomOut.disabled = false;
				break;
			case 4:
				zoom = 2.00;
				this.$zoomIn.disabled = false;
				this.$zoomOut.disabled = false;
				break;
			case 5:
				zoom = 4.00;
				this.$zoomIn.disabled = true;
				this.$zoomOut.disabled = false;
				break;
			default:
				console.log('cannot set zoom step'); return;
		}
		this.setZoom(zoom);
	},
	zoomIn : function()
	{
		var step = this.getZoomStep();
		if(step < this.MAX_ZOOM)
		{
			step++;
			this.setZoomStep(step);
		}
	},
	zoomOut : function()
	{
		var step = this.getZoomStep();
		if(step > 1)
		{
			step--;
			this.setZoomStep(step);
		}
	}
};