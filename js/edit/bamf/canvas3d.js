define(['lib/three'], function()
	{
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
		 * @param {number}
		 */
		var Canvas3D = function(p)
		{
			this.app = p.app || undefined;
			this.camParams = {};
			this.camParams.left = p.camLeft || window.innerWidth / -2;
			this.camParams.right = p.camRight || window.innerWidth / 2;
			this.camParams.top   = p.camTop  || window.innerHeight / 2;
			this.camParams.bottom   = p.camBottom  || window.innerHeight / -2;
			this.camParams.nearClipping = p.camNearClipping || -2000;
			this.camParams.farClipping  = p.camFarClipping || 1000;

			this.camParams.rotateX = p.camRotateX || (-45 * (Math.PI / 180));  //rotate axis by -45 degrees by default
			this.camParams.y = p.camY || 100; //by default make it looking down
			this.camera = new THREE.OrthographicCamera(
				this.camParams.left,
				this.camParams.right,
				this.camParams.top,
				this.camParams.bottom,
				this.camParams.nearClipping,  //near clipping plane
				this.camParams.farClipping	//far clipping plane
			);

			this.scene = new THREE.Scene();	//a default Three.js scene for entities on THAT renderer
			var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(25, 100, 100, 100, 25, 5, false),
								new THREE.MeshBasicMaterial({color: 0x372AFF}));

			cylinder.x = 400;	//position to the right a bit
			this.scene.add(cylinder);

			this.camera.position.y = this.camParams.y;
			this.camera.rotation.x += this.camParams.rotateX;
			this.renderer = new THREE.CanvasRenderer();

			// white spotlight shining from the side, casting shadow

			var spotLight = new THREE.SpotLight( 0xffffff );
			spotLight.position.set( 100, 1000, 100 );

			spotLight.castShadow = true;

			spotLight.shadowMapWidth = 1024;
			spotLight.shadowMapHeight = 1024;

			spotLight.shadowCameraNear = 500;
			spotLight.shadowCameraFar = 4000;
			spotLight.shadowCameraFov = 30;

			scene.add( spotLight );

			//set it's size
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			var element = p.$canvasDiv;
			element.appendChild(this.renderer.domElement);
		};

		Canvas3D.prototype =
		{	refreshSize : function()
			{	this.renderer.setSize(window.innerWidth, window.innerHeight);
			},
			/** update the rendering during each logic loop */
			preLogicRender : function()
			{	console.log('preLogicRender running');
				this.renderer.render(this.scene, this.camera);
				this.camera.rotation.x += 0.1;
			}
		};
		//----------------------------------------------------------------------//
		Canvas3D.MeshE = function(p)
		{

		};
	return Canvas3D;
	}
);