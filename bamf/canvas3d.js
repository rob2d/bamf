define(['bamf/bamf', 'lib/three'], function(BAMF)
	{
		debugRefreshTextureScope = undefined;
		debugAnimateScope = undefined;
		/**
		 * A 3D Renderer for the BAMP API. NOTE: this is a WIP, constructed just for a
		 * demonstration and entities do not yet properly exist to instantiate
		 * @constructor
		 * @alias module:Canvas3D
		 *
		 * @param {module:BAMF} app the app associated with this canvas instance
		 * @param {HTMLElement} $canvasDiv Which element to draw the canvas inside of/attach it to(note, this cannot be a canvas!)
		 * @param {number} camLeft the left edge of the camera
		 * @param {number} camRight the right edge of the camera
		 * @param {number} camTop the top edge of the camera
		 * @param {number} camBottom the bottom edge of the camera
		 * @param {number} camNearClipping the near clipping point of this camera
		 * @param {number} camFarClipping the far clipping point of this camera
		 * @param {number} camRotateX rotation of the X axis(in radians)
		 * @param {number} camRotateY rotation of the Y axis(in radians)
		 * @param {number} camRotateZ rotation of the Z axis(in radians)
		 * @param {Object} resources  resources the app can use to load a texture
		 * @param {Image[]}  resources.textures textures the app can use
		 *
		 * @param {number}
		 */
		var Canvas3D = function(p)
		{
			this.app = p.app || undefined;
			this.$canvasDiv = p.$canvasDiv;
			this.camParams = {};
			this.camParams.left = p.camLeft || 800 / -2;
			this.camParams.right = p.camRight || 800 / 2;
			this.camParams.top   = p.camTop  || 800 / 2;
			this.camParams.bottom   = p.camBottom  || 800 / -2;
			this.camParams.nearClipping = p.camNearClipping || -2000;
			this.camParams.farClipping  = p.camFarClipping || 2000;

			this.camParams.rotateX = p.camRotateX || (-45 * (Math.PI / 180));  //rotate axis by -45 degrees by default
			this.camParams.y = p.camY || 100; //by default make it looking down
			this.camera = new THREE.OrthographicCamera( this.camParams.left, this.camParams.right,
														this.camParams.top, this.camParams.bottom,
														this.camParams.nearClipping, this.camParams.farClipping
			);

			this.camera.lookAt(0, 100, 0);

			this.camManager = new Canvas3D.CameraManagerE({canvas3d : this});

			this.scene = new THREE.Scene();	//a default Three.js scene for entities on THAT renderer

			this.camera.position.y = this.camParams.y;
			this.camera.rotation.x += this.camParams.rotateX;

			this.camera.lookAt(
				{
					x : 0,
					y : 0,
					z : 0
				});
			this.renderer = new THREE.WebGLRenderer();

			// directional lighting
			var directionalLight = new THREE.DirectionalLight(0xffffbb);
			directionalLight.position.set(100, 400, 600).normalize();
			directionalLight.castShadow = true;
			directionalLight.shadowCameraVisible = true;

			directionalLight.shadowMapWidth = 512;
			directionalLight.shadowMapHeight = 512;

			this.scene.add(directionalLight);
			// directional lighting
			var directionalLight = new THREE.DirectionalLight(0x201030, 2.5);
			directionalLight.position.set(-75, -300, -200).normalize();
			this.scene.add(directionalLight);

			// add subtle ambient lighting
			var ambientLight = new THREE.AmbientLight(0x010308);
			this.scene.add(ambientLight);



			  /*
			// spotlight
			var spotLight = new THREE.SpotLight(0xFFFFFF, 2.5, 40);
			this.scene.add(spotLight);
             */

			var element = p.$canvasDiv;
			element.appendChild(this.renderer.domElement);
		};

		/**
		 *  @class used on an animation object literal to make it either still frames or an animatable object to be used by a 3D Anim Entity
		 *  or a Sprite;
		 *  loads image files for this animation. Used via object.apply(BAMF.Anim);
		 *  This is actually done automatically in AnimE objects in their constructor
		 *  @property {Number} frameLength how fast will the object's animations last(noted in seconds using float values)
		 *  @property {Number} cycleTo  at what frame does the animation loop to after the first successful play?
		 *  (note: setting cycleTo to the same number as frame length ensures the anim only plays once!)
		 *  @property {Number} imgs an array of image sources
		 *  @property {Number} texIndices what indexes of the image array to use(optional, if not supplied we just iterate through the img normally
		 */
		Canvas3D.TextureSet = function()
		{	//populate our image array for this object
			if(this.textures)
			{
				for(var i = 0, n = this.textures.length; i < this.textures.length; i++)
				{
					var texture = this.textures[i]; 	//for each texture, set it's map variable to load via it's already given url attribute
					texture.map = THREE.ImageUtils.loadTexture(texture.url);
				}
			}
		};

		Canvas3D.prototype =
		{	refreshSize : function()
			{	this.renderer.setSize(this.$canvasDiv.offsetWidth, this.$canvasDiv.offsetHeight);
			},
			/** update the rendering during each logic loop */
			preLogicRender : function()
			{	this.renderer.render(this.scene, this.camera);
			}
		};

		Canvas3D.CameraManagerE = function(p)
		{   this.c3d = p.canvas3d || undefined;
			this.cameras = [];

			//assign a new camera
			//temporary/ TODO --> the canvas3d has a Three.js camera but not a real bamf 3dcamera, fix soon
			this.camera = (p.camera instanceof Array ? p.camera[0] : p.camera) || undefined;
			if(!this.camera)
			{	this.camera = this.addCamera();	}

		};

		Canvas3D.CameraManagerE.prototype =
		{   //select the camera to be given to the C3D renderer
			selectCamera : function(index)
			{   var camera = this.cameras[index];
				if(camera)
				{
					this.c3d.setCamera(camera);
					return true;
				}
				else
				{
					console.log('error! can\'t set the camera to the index selected');
					return false;
				}
			},
			addCamera : function()
			{
				var that = this;
				if(arguments.length == 0)
				{   	//if no arguments, create and return a new camera
					var newCamE = new Canvas3D.Camera(
					{
						camManager : that

					});
					that.cameras.push(newCamE);
					return newCamE;
				}
				else	//otherwise add all necessary cameras
				{
					for(var i = 0; i < arguments.length; i++)
					{
						that.cameras.push(arguments[i]);
					}
				}
			}

		};

		Canvas3D.Camera = function(p)
		{
			this.camManager = p.camManager || undefined;
		};

		Canvas3D.AnimTextureE = function(p)
		{
			var that = this;

			var returnObj = new Canvas3D.ShapeE(p);
			returnObj.frameIndex = 0;
			//append all animations to this object and instantiate them
			returnObj.anims = p.anims;
			for(var animName = 0 in returnObj.anims)
			{
				if(animName != 'init')
					Canvas3D.TextureSet.apply(returnObj.anims[animName]);
			}
			//-----------------------------------------------------------------------------------//

			returnObj.draw = function()
			{ that.draw.call(returnObj); };

			//apply all of the AnimE prototype functions to the return instance Canvas3D.ShapeE
			returnObj.animate = function(deltaTime)
			{ that.animate.call(returnObj, deltaTime); };

			returnObj.refreshTexture = function(frameIndex)
			{ that.refreshTexture.call(returnObj, frameIndex); };

			returnObj.setAnim = function(animName, frameIndex)
			{ that.setAnim.call(returnObj, animName, frameIndex); };

			//set the default anim to the array's 'init' property
			if(returnObj.anims.init)
				returnObj.setAnim(p.anims.init);
			//-----------------------------------------------------------------------------------//

			return returnObj;
		};

		Canvas3D.AnimTextureE.prototype.animate = function(deltaTime)
		{
			//add the time that goes by related to how long each frame is
			var prevFrame =this.frameIndex;
			this.frameIndex += (deltaTime /this.frameLength);
			while(this.frameIndex >= this.anim.frameCount)
			{
				this.animComplete = true;
				this.frameIndex = (this.frameIndex - this.anim.frameCount) + this.anim.cycleTo;
			}

			if(Math.floor(prevFrame) != Math.floor(this.frameIndex))
			this.refreshTexture(this.frameIndex);
		};

		Canvas3D.AnimTextureE.prototype.draw = function()
		{
			this.animate(0.02);
		};

		Canvas3D.AnimTextureE.prototype.setAnim = function(animName, frameIndex)
		{
			this.anim = this.anims[animName];
			//get quick reference to the frame count dependant on whether there's an indices array!
			this.anim.frameCount = this.anims[animName].indices ?
				this.anim.indices.length : this.anim.textures.length;
			this.frameIndex = this.frameIndex || frameIndex || 0;  //0 is default when no 2nd arg provided
			this.animComplete = false;          //anim hasn't cycled once yet
			this.frameLength = this.anim.frameLength;    //store the default animation speed locally so it can be changed
			this.refreshTexture(this.frameIndex);
		},

		Canvas3D.AnimTextureE.prototype.refreshTexture = function(frameIndex)
		{
			var index = (!this.anim.indices) ? Math.floor(frameIndex) :
					this.anim.indices[Math.floor(frameIndex)];
			var texture = undefined;
			if(this.anim.textures)
				texture = this.anim.textures[index];
			if(texture)
			{
				this.obj.material.map =  texture.map;
				this.obj.material.needsUpdate = true;	//call for update
			}
		};


		//----------------------------------------------------------------------//
		/**
		 *
		 * @param p
		 * @param p.app associated BAMF app
		 * @param p.textureUrl location of the sprite image(if no animations provided)
		 * @param p.imgWidth width of the sprite
		 * @param p.imgHeight height of the sprite
		 * @constructor
		 */
		Canvas3D.SpriteE = function(p)
		{
			this.canvas3D = p.app.renderer || undefined;
			var material;
			if(p.textureUrl)
			{
				var texture =  { map : THREE.ImageUtils.loadTexture(p.textureUrl) };
				material = new THREE.SpriteMaterial({map : texture.map, color: 0xffffff });
			}
			else
			{
				material = new THREE.SpriteMaterial({color : 0xffffff});
			}
			//append all animations to this object and instantiate them
			this.anims = p.anims;
			for(var animName = 0 in this.anims)
			{
				if(animName != 'init')
					Canvas3D.TextureSet.apply(this.anims[animName]);
			}
			this.obj = new THREE.Sprite(material);
			this.obj.scale.x = p.imgWidth || 1.0;
			this.obj.scale.y = p.imgHeight|| 1.0;
			this.obj.scale.z = 1.0;
			this.obj.position.x = p.x || 0;
			this.obj.position.y = p.y || 0;
			this.obj.position.z = p.z || -16;
			this.obj.renderDepth = -10;


			//set the default anim to the array's 'init' property
			if(this.anims.init)
				this.setAnim(p.anims.init);

			this.canvas3D.scene.add(this.obj);
			BAMF.E.call(this, p);
			p.app.addEntity(this);
		};	Canvas3D.SpriteE.prototype =
		{   //define all methods for a C3D.Sprite...
			draw : function()
			{
				this.animate(0.02);
			},
			refreshTexture : function(frameIndex)
			{
				var index = (!this.anim.indices) ? Math.floor(frameIndex) :
					this.anim.indices[Math.floor(frameIndex)];
				var texture = undefined;
				if(this.anim.textures)
					texture = this.anim.textures[index];
				if(texture)
				{
					this.obj.material.map =  texture.map;
					this.obj.material.needsUpdate = true;	//call for update
					var image = texture.map.image;
					this.obj.scale.x = image.width;
					this.obj.scale.y = image.height;
				}
			},
			setAnim : function(animName, frameIndex)
			{
				this.anim = this.anims[animName];
				//get quick reference to the frame count dependant on whether there's an indices array!
				this.anim.frameCount = this.anims[animName].indices ?
					this.anim.indices.length : this.anim.textures.length;
				this.frameIndex = this.frameIndex || frameIndex || 0;  //0 is default when no 2nd arg provided
				this.animComplete = false;          //anim hasn't cycled once yet
				this.frameLength = this.anim.frameLength;    //store the default animation speed locally so it can be changed
				this.refreshTexture(this.frameIndex);
			},
			animate : function(deltaTime)
			{
				//add the time that goes by related to how long each frame is
				var prevFrame =this.frameIndex;
				this.frameIndex += (deltaTime /this.frameLength);
				while(this.frameIndex >= this.anim.frameCount)
				{
					this.animComplete = true;
					this.frameIndex = (this.frameIndex - this.anim.frameCount) + this.anim.cycleTo;
				}

				if(Math.floor(prevFrame) != Math.floor(this.frameIndex))
					this.refreshTexture(this.frameIndex);
			},
			destroy : function()
			{
				this.app.scene.remove(this);
				this.app.renderer.scene.remove(this);
			}
		};

		//----------------------------------------------------------------------//
		Canvas3D.ShapeE = function(p)
		{
			this.canvas3D = p.app.renderer || undefined;

			var geometry;
			switch(p.shape)
			{
				case 'cube':
					var width = p.width  || 100;
					var height= p.height || 100;
					var length= p.length || 100;
					geometry = new THREE.CubeGeometry(width, height, length);
					break;
				case 'sphere':
					var radius = p.radius || 50;
					var xSegments = p.xSegments || 20;
					var ySegments = p.ySegments || 20;
					geometry = new THREE.SphereGeometry(radius, xSegments, ySegments);
					break;
				case 'tetrahedron' :
					var height = p.height || 200;
					geometry = new THREE.TetrahedronGeometry(height);
					break;
				case 'plane' :
					var width = p.width;
					var height= p.height;
					geometry  = new THREE.PlaneGeometry(width, height);
					break;
				default:
					break;

			}

			//-------------------- set up the material -------------------------//
			 var meshParams =
			{
				color        : (p.color || 0xFFFFFF),
				shininess    : 0,
				reflectivity : 0
			};
			if(p.textureUrl)
				meshParams.map = new THREE.ImageUtils.loadTexture(p.textureUrl);

			var material;
			if(p.materialType)
			{
			 	switch(p.materialType)
				{
					case 'phong':
						material = new THREE.MeshPhongMaterial(meshParams);
						break;
					case 'lambert':
						material = new THREE.MeshLambertMaterial(meshParams);
						break;
					case 'normal':
						material = new THREE.MeshNormalMaterial(meshParams);
						break;
					case 'basic':
						material = new THREE.MeshBasicMaterial(meshParams);
						break;
					default:
						material = new THREE.MeshLambertMaterial(meshParams);
						break;
				}
			}
			else{
				material = new THREE.MeshBasicMaterial(meshParams);
			}

			//instantiate our object
			this.obj = new THREE.Mesh(geometry, material);

			this.obj.position.x = p.x || 0;
			this.obj.position.y = p.y || 0;
			this.obj.position.z = p.z || 0;
			this.obj.castShadow = true;
			this.obj.receiveShadow = true;

			this.canvas3D.scene.add(this.obj);
			BAMF.E.call(this, p);
			p.app.addEntity(this);
		};
		/** remove this element from the current scene
		 * @method */
		Canvas3D.ShapeE.prototype.destroy = function()
		{
			this.canvas3D.scene.remove(this.obj);
			this.app.scene.remove(this);
		};
		/** set the x,y,z coordinates of the shape
		 * @method */
		Canvas3D.ShapeE.prototype.setPosition = function(x, y, z)
		{
			this.obj.position.x = x;
			this.obj.position.y = y;
			this.obj.position.z = z;
		};
		Canvas3D.ShapeE.prototype.setX = function(x){ this.obj.position.x = x; };
		Canvas3D.ShapeE.prototype.setY = function(y){ this.obj.position.y = y; };
		Canvas3D.ShapeE.prototype.setZ = function(z){ this.obj.position.z = z; };
	//-----------------------------------------------------------------------//
		Canvas3D.LightE = function(p)
		{
			BAMF.E.call(this, p);
			p.app.addEntity(this);
		}

	return Canvas3D;
	}
	//----------------------------------------------------------------------//
);