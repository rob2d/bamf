var App =
{
	init: function()
	{
		YUI().use('dialogs', function(Y)
		{
			App.prompter = {};
			App.prompter.input =  (function()
			{
				return Y.Dialogs.createPrompter({srcNode: '#input_prompt_box'});
			})();
			App.prompter.input.response = Y.one('#prompter_input_response');
			var imgLister, imgPreview, animManager;

			//initialize the image previewing widget!
			imgPreview = new ImgFPreview(
			{
				$domE: document.getElementById('img_f_previewer'),
				previousFrame : function()
				{
					var index = imgLister.getImgIndex();
					index--;
					if(index >= 0)
						imgLister.selectImgIndex(index);
					else
						console.log('selected bad index');
				},
				nextFrame : function()
				{
					var index = imgLister.getImgIndex();
					index++;
					if(index < imgLister.imgFrames.length)
						imgLister.selectImgIndex(index);
					else
					{
						console.log('selected bad index');
					}
				},
				/** set animation manager's current frame offset to correspond to input */
				onSetXOffset : function(xO)
				{
					animManager.getSelectedImgData().xO = xO;
				},
				/** set animation manager's current frame offset to correspond to input */
				onSetYOffset : function(yO)
				{
					animManager.getSelectedImgData().yO = yO;
				}
			}
		);

			//initialize the image lister
			imgLister = new ImgFrameLister(
				{
					$domE: document.getElementById('img_lister_1'),
					selectFn: function(imgData)
					{
						if(imgData)
						{
							console.log('ln 273: ' + imgData);	//debug line
							imgPreview.setFrameData(imgData);
						}
					},
					onListChange : function(imgData)
					{
						if(imgData)
							animManager.setAnimImgData(imgData);
						else
							animManager.setAnimImgData(null);
					}
				});

			//animation select list handler
			//params are:
			//$selector
			//$frameLengthRange
			//$frameLengthTxtDiv
			//$cycleToInput
			//$useIndicesCb
			//$useIndicesInput
			//$renameAnimBtn
			//$deleteAnimBtn
			//$saveBtn
			//$loadBtn
			var AnimManager = function(params)
			{
				var that = this;
				for(var prop in params)       	//apply all values in parameters to 'this'
				{
					this[prop] = params[prop];
				};

				this.animData = [];
				this.selectedAnim = 0;

				this.$selector.addEventListener('change', function()
				{ that.selectAnimIndex(that.$selector.selectedIndex); });

				this.$frameLengthRange.addEventListener('change', function()
				{
					var newValue = that.$frameLengthRange.value;
					var animIndex = that.$selector.selectedIndex;
					that.animData[animIndex].frameLength = newValue;
					that.$frameLengthTxtDiv.innerHTML = newValue;
				});

				this.$cycleToInput.addEventListener('change', function()
				{
					var newValue = that.$cycleToInput.value;
					var animIndex = that.$selector.selectedIndex;
					that.animData[animIndex].cycleTo = newValue;
				});

				this.$useIndicesCb.addEventListener('change', function()
				{
					that.$useIndicesInput.disabled = !that.$useIndicesCb.checked;
					var animIndex = that.$selector.selectedIndex;
					if(that.$useIndicesCb.checked)
						that.animData[animIndex].indices = that.$useIndicesInput.value.split(',');
					else
						that.animData[animIndex].indices = undefined;
				});
				this.$useIndicesInput.addEventListener('change', function()
				{
					// TODO -> input validation
					var animIndex = that.$selector.selectedIndex;
					that.animData[animIndex].indices = that.$useIndicesInput.value.split(',');
				});

				this.$renameAnimBtn.addEventListener('click', function(e)
				{
					console.log('rename clicked');
					e.preventDefault();
					App.prompter.input.showPrompt('Enter a new name for this animation',
						'Rename animation', function(e)
						{
							e.preventDefault();
							animManager.renameCurrentAnim(App.prompter.input.response.get('value'));
							this.hide();
						});
				});
				this.$deleteAnimBtn.addEventListener('click', function(e)
				{
					e.preventDefault();
					that.deleteCurrentAnim();
				});

				this.$generateJsBtn.addEventListener('click', function(e)
				{
					e.preventDefault();
					//relative filepath to append in code...
					var relFilePath = document.getElementById('file_rel_dir').value;

					var url = window.location.href;
					var thisDir = url.substring(0, url.lastIndexOf("/") + 1);
					var w = window.open('', '.js code',
						'width =480, height=400, location=yes, resizable=no, scrollbars');
					SrcTools.writeLnToW('<pre>', 0, w);
					var printStr = '';
					printStr+= that.generateJs();
					console.log('printStr: ' + printStr);
					SrcTools.writeLnToW(printStr + '', 0, w);
					SrcTools.writeLnToW('</pre>', 0, w);
				});


				this.$playAnimBtn.addEventListener('click', function(e)
				{	e.preventDefault();
					w = window.open();
					//WRITE CODE TO A NEW WINDOW ----------------------------------------------------
					SrcTools.writeLnToW("<script>", 0, w);
					SrcTools.writeLnToW("var logic = function(){};", 0, w);
					SrcTools.writeLnToW("var init = function(){};", 0, w);
					SrcTools.writeLnToW("var anims = {" + that.generateJs(true) + "};", 0, w);
					SrcTools.writeLnToW("</script>", 0, w);
					SrcTools.writeLnToW("<script data-main='../js/edit/anim_previewer.js' src='../js/require.js' ></script>", 0, w);
					SrcTools.writeLnToW("<canvas id='preview_app'></canvas>", 0, w);
				});
				this.$saveBtn.addEventListener('click', function(e)
				{
					e.preventDefault();
					that.saveAnim();
				});

				this.$loadBtnUi.addEventListener('change', function(e)
				{
					e.preventDefault();
					var fileReader = new FileReader();
					console.log('loaded something..');

					var animDataBmd, relPathBmd;	//the files we are looking for specifically(encoded as ASCII)

					//process a zip file loaded
					fileReader.onload = function(fLE)
					{
						var validFile = true;
						//search for necessary files within the zip:
						//	1) anim_data.bmd, rel_path.bmd
						var zipLoaded = new JSZip(fLE.target.result);

						for(var nameOfFile in zipLoaded.files)
						{
							var fileInZip = zipLoaded.files[nameOfFile];
							switch(nameOfFile)
							{
								case 'anim_data.bmd':
									animDataBmd = fileInZip.asText();
									console.log(animDataBmd);
									break;
								case 'rel_path.bmd':
									relPathBmd = fileInZip.asText();
									break;
							}
						}

						if(!animDataBmd || (!relPathBmd  && relPathBmd !== ""))
						{
							validFile = false;
						}

						if(!validFile)
						{
							window.alert('invalid file name specified!');
						}
						else{
							that.loadData(animDataBmd, relPathBmd);
						}

					};

					//check the zip files selected from load button dialog
					var files = e.target.files;
					for(var i = 0, f; f = files[i]; i++)
					{
						if(f.type !== 'application/zip' && f.type != 'application/x-zip-compressed')
						{
							window.alert('sorry, invalid file type selected! cannot load filetype: "' + f.type + '"');
							return;
						}
						else
						{   //we can assume at least there's a valid zip file
							fileReader.readAsArrayBuffer(f);
							console.log('threw a file to fileReader, waiting for a callback');
						}
					}
				});

				this.selectAnimIndex(-1);
			};

			AnimManager.prototype =
			{
				createAnim : function(animName)
				{
					if(this.animNameExistsAt(animName) == -1)      //if anim name doesn't exist
					{                                              //push some new data
						this.animData.push({
								animName : animName,
								frameLength : 0.5,
								cycleTo     : 0,
								useIndices  : false
							});
					}
					else            								//otherwise flag an error :D
					{
						//TODO -> better error prompt
						window.alert('please specify an animation name that doesn\'t already exist!');
					}

					this.refreshAnims();
					this.selectAnimIndex(this.animData.length - 1);
				},

				renameCurrentAnim : function(newName)
				{
					if(this.animNameExistsAt(newName) == -1) 	//make sure the anim name specified doesn't exist
					{
						var iSelected = this.$selector.selectedIndex;
						this.animData[iSelected].animName = newName;
						this.refreshAnims();
					}else
					{
						//TODO -> better error prompt
						window.alert('could not rename the animation, the new name you specified already exists!');
					}
				},

				deleteCurrentAnim : function()
				{
					console.log('delete anim btn clicked');
					var iSelected = this.$selector.selectedIndex;

					var confirm = true; 					//TODO -> some prompter code D:
					if(confirm)
					{
						this.animData.splice(iSelected, 1);  				//remove the anim data
						this.refreshAnims();                                //refresh list
						this.selectAnimIndex(this.$selector.selectedIndex);	//refresh view with new anim in focus
					}
				},

				/**
				 *
				 * @param name
				 * @returns {number} -1 the index of the animation name where it exists, or -1 if it doesn't
				 */
				animNameExistsAt : function(name)
				{
					for(var i = 0; i < this.animData.length; i++)
					{
						if(this.animData[i].animName == name)
						{
							return i;
						}
					}
					return -1;	//if the animation name doesn't exist, return -1
				},
				refreshAnims : function()
				{
					var selectionIndex = this.$selector.selectedIndex;
					while(this.$selector.options[0])
					{
						this.$selector.remove(0);
					}

					var dataLength = this.animData.length;  //quick lookup for anim data array

					//if at least 1 anim exists, we can save and generate code
					this.$saveBtn.disabled = (dataLength == 0);
					this.$generateJsBtn.disabled = (dataLength == 0);

					//create anim options
					for(var i = 0; i < dataLength; i++)
					{
						var option = document.createElement('option');
						option.text = this.animData[i].animName;
						this.$selector.options.add(option);
					}

					this.$selector.disabled = !(this.$selector.options.length > 0);
					if(selectionIndex >= 0) 	//reselect the index we had before
					{
						this.$selector.selectedIndex = selectionIndex;
					}
				},
				setAnimImgData : function(imgData)
				{
					var index = this.$selector.selectedIndex;
					if(this.animData[index]) 	//in the case we're creating a new anim
						this.animData[index].imgFrames = imgData;
				},
				selectAnimIndex : function(i)
				{
					this.$selector.selectedIndex = i;
					var validSelection = (i != undefined && i >= 0);
					if(validSelection)
					{
						//update the GUI to reflect the attributes of the animation
						this.$frameLengthRange.value = this.animData[i].frameLength;
						this.$frameLengthTxtDiv.innerHTML = this.animData[i].frameLength;
						this.$cycleToInput.value = this.animData[i].cycleTo;
						this.$useIndicesCb.checked = (this.animData[i].indices != undefined);
						if(this.animData[i].indices)
							this.$useIndicesInput.value = this.animData[i].indices.join(', ');
						else
							this.$useIndicesInput.value = '0';

						if(this.animData[i].imgFrames)
						{
							imgLister.imgFrames = this.animData[i].imgFrames;
						}
						else
						{
							imgLister.imgFrames = [];
						}
						imgLister.refreshListView();
					} else
					{
						imgLister.imgFrames = [];
					}
					//refresh UI components that involve image frame previews
					imgLister.selectImgIndex(-1);	//reset img lister selection
					imgPreview.setFrameData(undefined);
					imgLister.refreshListView();

					//enable/disable relevant DOM stuff
					this.$frameLengthRange.disabled = !validSelection;
					this.$cycleToInput.disabled     = !validSelection;
					this.$cycleToInput.disabled     = !validSelection;
					this.$useIndicesCb.disabled     = !validSelection;
					this.$useIndicesInput.disabled  =(!validSelection || !this.$useIndicesCb.checked);
					this.$renameAnimBtn.disabled    = !validSelection;
					this.$deleteAnimBtn.disabled    = !validSelection;
					this.$imgUploader.disabled      = !validSelection;
					this.$playAnimBtn.disabled      = !validSelection;
				},
				getSelectedImgData : function()
				{
					var selectedAnim = this.animData[animManager.$selector.selectedIndex];
					var selectedData = selectedAnim.imgFrames[imgLister.selectedIndex];
					return selectedData;
				},
				/** generate a javascript object literal from all of our anim data to use with the BAMF
				 *  API
				 * @param {boolean} isPreview whether or not we are generating for previewing(in which we'd just use the actual image data from browser)
				 * @returns {string}
				 */
				generateJs : function(isPreview)
				{
					var jsStr = '';
					var relFilePath = document.getElementById('file_rel_dir').value;
					var length = this.animData.length;
					for(var i = 0; i < length; i++)
					{
						var a = this.animData[i];
						jsStr += SrcTools.getScopedStr(a.animName + ": ", 0) + '\n';
						jsStr += SrcTools.getScopedStr("{", 0) + '\n';
						jsStr += SrcTools.getScopedStr("frameLength: " + a.frameLength + ", ", 1) + '\n';
						jsStr += SrcTools.getScopedStr("cycleTo: " + a.cycleTo + ",", 1) + '\n';
						jsStr += SrcTools.getScopedStr("imgs:[", 1) + '\n';
						for(var j = 0; j < a.imgFrames.length; j++)
						{   //write source src, x offsets and y offsets of the current image frame iterated on
							var frame = a.imgFrames[j];
							jsStr += SrcTools.getScopedStr("{ " + "src: '" + (relFilePath ? "//" : "") + (isPreview ? frame.src : frame.srcFName) +
								"', xO: " + frame.xO + ", yO: " + frame.yO +  "},", 2) + '\n';
						}

						jsStr += SrcTools.getScopedStr("]" + (a.indices ? ", " : " "), 2) + '\n';
						if(a.indices)
						{
							jsStr += SrcTools.getScopedStr("indices: [ ", 1);
							for(var j = 0; j < a.indices.length; j++)
							{
								var entry = a.indices[j];
								jsStr += entry + ((j == a.indices.length - 1) ? " " : ", " );
							}
							jsStr += SrcTools.getScopedStr(']', 0) + '\n';
						}
						jsStr += SrcTools.getScopedStr("},", 0) + '\n';
					}
					// TODO -> support customizing initial animation
					var selectedAnim = this.$selector.selectedIndex;
					jsStr += SrcTools.getScopedStr('init : "' + this.animData[selectedAnim].animName + '"');

					return jsStr;
				},
				saveAnim : function()
				{
					var zip = new JSZip();
					zip = zip.file('anim_data.bmd', JSON.stringify(this.animData));
					var relFilePath = document.getElementById('file_rel_dir').value;
					zip = zip.file('rel_path.bmd', relFilePath);
					var content   = zip.generate();
					//go to download
					location.href="data:application/zip;base64," + content;
				},
				/** loads data from two strings, the animation data, and the path data */
				loadData : function(animData, path)
				{
					this.animData = JSON.parse(animData);
					this.refreshAnims();
					this.selectAnimIndex(0);
				}
			};
			var DomElems =
			{
				$selector     :	document.getElementById('anim_list'),
				$frameLengthRange : document.getElementById('frame_length_input'),
				$frameLengthTxtDiv : document.getElementById('frame_length_val'),
				$cycleToInput     : document.getElementById('cycle_to_input'),
				$useIndicesCb    : document.getElementById('use_indices_cb'),
				$useIndicesInput  : document.getElementById('use_indices_txt'),
				$renameAnimBtn    : document.getElementById('rename_anim_btn'),
				$deleteAnimBtn    : document.getElementById('delete_anim_btn'),
				$imgUploader      : document.getElementById('img_uploader_1'),
				$generateJsBtn    : document.getElementById('generate_js_btn'),
				$playAnimBtn      : document.getElementById('play_anim_btn'),
				$saveBtn          : document.getElementById('file_save_btn'),
				$loadBtn          : document.getElementById('file_load_btn'),
				$loadBtnUi        : document.getElementById('load_file_input')
			};

			animManager = new AnimManager(DomElems);
			var $animBtn = document.getElementById('new_anim_btn');
			$animBtn.addEventListener('click', function(e)
			{
				e.preventDefault();
				App.prompter.input.response.set('value', '');
				App.prompter.input.showPrompt('Enter a name for this new animation you wish to create',
												'Create a New Anim', function(e)
					{
						e.preventDefault();
						animManager.createAnim(App.prompter.input.response.get('value'));
						this.hide();
					});
			});
			App.imgLister = imgLister;	//DEBUG stuff
			App.animManager = animManager;
			App.initDOM(); 	//at the end of YUI library scoped code, initialize all DOM elements
		});
	},
	/** do DOM work after YUI is finished loading its libraries
	 *  to let a user know everything is safe to go ahead and play! */
	initDOM : function()
	{
		//remove the loading dialog!
		document.getElementById('loading_dialog').remove();
		//enable buttons that were initially turned off
		document.getElementById('new_anim_btn').disabled = false;
		document.getElementById('file_load_btn').disabled = false;
	}
};

console.log(App);
App.init();