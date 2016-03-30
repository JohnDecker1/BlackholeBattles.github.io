/*
 * Game Core - Demo 5 (Shadows)
 *
 * A simple example that implements THREE.js shadows (same as game.core.demo1.js but with some advancements)
 */

window.game = window.game || {};

window.game.core = function () {
    var _lights = {
        list: [],  
        
        gravity: .1,
        
        // methods
        create: function() {
            
			// create however many lights you want
            var numberOfLights = 20;
            
            for (var i = 0; i < numberOfLights; i++) {
                var newLight = {
                    obj3d: null,
                    light: null,
                    marker: null,
                
                    isActive: false,
                
                    isGrounded: false,
                    mass: 1,
                                    
                    velocity: {
                        x: 0,
                        y: 0,
                        z: 2
                    }
                
                    
                };
                _lights.list.push(newLight);
                var index = _lights.list.length - 1;
                
                _lights.list[index].light = new THREE.PointLight(window.game.static.colors.green, 0.0, 400);
                _lights.list[index].marker = new THREE.Mesh( new THREE.SphereGeometry(.5, 32, 16), new THREE.MeshBasicMaterial( { color: window.game.static.colors.green } ) );
                _lights.list[index].obj3d = new THREE.Object3D();
                _lights.list[index].obj3d.add(_lights.list[index].light);
                _lights.list[index].obj3d.add(_lights.list[index].marker);
                _lights.list[index].obj3d.position.set(0, 0, -20);
                _three.scene.add(_lights.list[index].obj3d);
                
                
            }
            
            
        },
        
        update: function () {
            // go through each light and update its position using the velocities (and changing the z velocity by the gravity)
            
            for (var i = 0; i < _lights.list.length; i++) {
                
                if (_lights.list[i].isActive === true && _lights.list[i].obj3d !== null) {
                
                    //system.log("Trying index " + i + ": ");
                    
                    
                    
                    // update coordinates
                    _lights.list[i].obj3d.position.x = _lights.list[i].obj3d.position.x + _lights.list[i].velocity.x;
                    _lights.list[i].obj3d.position.y = _lights.list[i].obj3d.position.y + _lights.list[i].velocity.y;
                    _lights.list[i].velocity.z -= _lights.gravity;
                    _lights.list[i].obj3d.position.z = _lights.list[i].obj3d.position.z + _lights.list[i].velocity.z;
                
                    // check to see if the light is out of bounds
                    // if so, reset it to intensity 0 and move it under the floor again and mark it inactive
                    if (_lights.list[i].obj3d.position.z < -20) {
                        _lights.list[i].obj3d.position.set(0, 0, -20);
                        _lights.list[i].light.intensity = 0.0;
                        _lights.list[i].isActive = false;
                        //console.log("Resetting light #" + i);
                    }   
                                    
                }
                
            }
            
        },
        reset: function () {
            for (var i = 0; i < _lights.list.length; i++) {
                    
                _lights.list[i].obj3d.position.set(0, 0, -20);
                _lights.list[i].light.intensity = 0.0;
                _lights.list[i].isActive = false;
                        
            }
        },
        readd: function () {
            for (var i = 0; i < _lights.list.length; i++) {
                    
                _three.scene.add(_lights.list[i].obj3d);
                        
            }
            
        }
    };
	var _game = {
		// Attributes
		player: {
			// Attributes

			// Player entity including mesh and rigid body
			model: null,
			mesh: null,
			shape: null,
			rigidBody: null,
			// Player mass which affects other rigid bodies in the world
			mass: 3,

			// HingeConstraint to limit player's air-twisting
			orientationConstraint: null,

			// Jump flags
			isGrounded: false,
			jumpHeight: 38,

			// Configuration for player speed (acceleration and maximum speed)
			speed: 1.5,
			speedMax: 45,
			// Configuration for player rotation (rotation acceleration and maximum rotation speed)
			rotationSpeed: 0.007,
			rotationSpeedMax: 0.04,
			// Rotation values
			rotationRadians: new THREE.Vector3(0, 0, 0),
			rotationAngleX: null,
			rotationAngleY: null,
			// Damping which means deceleration	(values between 0.8 and 0.98 are recommended)
			damping: 0.9,
			// Damping or easing for player rotation
			rotationDamping: 0.8,
			// Acceleration values
			acceleration: 0,
			rotationAcceleration: 0,
			// Enum for an easier method access to acceleration/rotation
			playerAccelerationValues: {
				position: {
					acceleration: "acceleration",
					speed: "speed",
					speedMax: "speedMax"
				},
				rotation: {
					acceleration: "rotationAcceleration",
					speed: "rotationSpeed",
					speedMax: "rotationSpeedMax"
				}
			},

			// Third-person camera configuration
			playerCoords: null,
			cameraCoords: null,
			// Camera offsets behind the player (horizontally and vertically)
			cameraOffsetH: 80,
			cameraOffsetV: 10,

			// Keyboard configuration for game.events.js (controlKeys must be associated to game.events.keyboard.keyCodes)
			controlKeys: {
				forward: "w",
				backward: "s",
				left: "a",
				right: "d",
				jump: "space"
			},
			
			// Methods
			create: function () {
				// Create a global physics material for the player which will be used as ContactMaterial for all other objects in the level
				_cannon.playerPhysicsMaterial = new CANNON.Material("playerMaterial");

				// Create a player character based on an imported 3D model that was already loaded as JSON into game.models.player
				_game.player.model = _three.createModel(window.game.models.player, 12, [
					new THREE.MeshPhongMaterial({ color: window.game.static.colors.cyan, shading: THREE.FlatShading }),
					new THREE.MeshPhongMaterial({ color: window.game.static.colors.green, shading: THREE.FlatShading })
				]);

				// Create the shape, mesh and rigid body for the player character and assign the physics material to it
				_game.player.shape = new CANNON.Box(_game.player.model.halfExtents);
				_game.player.rigidBody = new CANNON.RigidBody(_game.player.mass, _game.player.shape, _cannon.createPhysicsMaterial(_cannon.playerPhysicsMaterial));
				_game.player.rigidBody.position.set(0, 0, 50);
				_game.player.mesh = _cannon.addVisual(_game.player.rigidBody, null, _game.player.model.mesh);
				
				// Enable shadows
				_game.player.mesh.castShadow = true;
				_game.player.mesh.receiveShadow = true;

				// Create a HingeConstraint to limit player's air-twisting - this needs improvement
				_game.player.orientationConstraint = new CANNON.HingeConstraint(_game.player.rigidBody, new CANNON.Vec3(0, 0, 0), new CANNON.Vec3(0, 0, 1), _game.player.rigidBody, new CANNON.Vec3(0, 0, 1), new CANNON.Vec3(0, 0, 1));
				_cannon.world.addConstraint(_game.player.orientationConstraint);

				_game.player.rigidBody.postStep = function() {
					// Reset player's angularVelocity to limit possible exceeding rotation and
					_game.player.rigidBody.angularVelocity.z = 0;

					// update player's orientation afterwards
					_game.player.updateOrientation();
				};

				// Collision event listener for the jump mechanism
				_game.player.rigidBody.addEventListener("collide", function(event) {
					// Checks if player's is on ground
					if (!_game.player.isGrounded) {
						// Ray intersection test to check if player is colliding with an object beneath him
						_game.player.isGrounded = (new CANNON.Ray(_game.player.mesh.position, new CANNON.Vec3(0, 0, -1)).intersectBody(event.contact.bi).length > 0);
					}
				});
                
                // initialize the lights array
                //_lights.list
			},
			update: function() {
				// Basic game logic to update player and camera
				_game.player.processUserInput();
				_game.player.accelerate();
				_game.player.rotate();
				_game.player.updateCamera();

				// Level-specific logic
				_game.player.checkGameOver();
			},
			updateCamera: function() {
				// Calculate camera coordinates by using Euler radians from player's last rotation
				_game.player.cameraCoords = window.game.helpers.polarToCartesian(_game.player.cameraOffsetH, _game.player.rotationRadians.z);

				// Apply camera coordinates to camera position
				_three.camera.position.x = _game.player.mesh.position.x + _game.player.cameraCoords.x;
				_three.camera.position.y = _game.player.mesh.position.y + _game.player.cameraCoords.y;
				_three.camera.position.z = _game.player.mesh.position.z + _game.player.cameraOffsetV;

				// Place camera focus on player mesh
				_three.camera.lookAt(_game.player.mesh.position);
			},
			updateAcceleration: function(values, direction) {
				// Distinguish between acceleration/rotation and forward/right (1) and backward/left (-1)
				if (direction === 1) {
					// Forward/right
					if (_game.player[values.acceleration] > -_game.player[values.speedMax]) {
						if (_game.player[values.acceleration] >= _game.player[values.speedMax] / 2) {
							_game.player[values.acceleration] = -(_game.player[values.speedMax] / 4);
						} else {
							_game.player[values.acceleration] -= _game.player[values.speed];
						}
					} else {
						_game.player[values.acceleration] = -_game.player[values.speedMax];
					}
				} else {
					// Backward/left
					if (_game.player[values.acceleration] < _game.player[values.speedMax]) {
						if (_game.player[values.acceleration] <= -(_game.player[values.speedMax] / 2)) {
							_game.player[values.acceleration] = _game.player[values.speedMax] / 4;
						} else {
							_game.player[values.acceleration] += _game.player[values.speed];
						}
					} else {
						_game.player[values.acceleration] = _game.player[values.speedMax];
					}
				}
			},
			processUserInput: function() {
				// Jump
				if (_events.keyboard.pressed[_game.player.controlKeys.jump]) {
					//_game.player.jump();
                    _game.player.shoot();
				}

				// Movement: forward, backward, left, right
				if (_events.keyboard.pressed[_game.player.controlKeys.forward]) {
					_game.player.updateAcceleration(_game.player.playerAccelerationValues.position, 1);

					// Reset orientation in air
					if (!_cannon.getCollisions(_game.player.rigidBody.index)) {
						_game.player.rigidBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), _game.player.rotationRadians.z);
					}
				}

				if (_events.keyboard.pressed[_game.player.controlKeys.backward]) {
					_game.player.updateAcceleration(_game.player.playerAccelerationValues.position, -1);
				}

				if (_events.keyboard.pressed[_game.player.controlKeys.right]) {
					_game.player.updateAcceleration(_game.player.playerAccelerationValues.rotation, 1);
				}

				if (_events.keyboard.pressed[_game.player.controlKeys.left]) {
					_game.player.updateAcceleration(_game.player.playerAccelerationValues.rotation, -1);
				}
			},
			accelerate: function() {
				// Calculate player coordinates by using current acceleration Euler radians from player's last rotation
				_game.player.playerCoords = window.game.helpers.polarToCartesian(_game.player.acceleration, _game.player.rotationRadians.z);

				// Set actual XYZ velocity by using calculated Cartesian coordinates
				_game.player.rigidBody.velocity.set(_game.player.playerCoords.x, _game.player.playerCoords.y, _game.player.rigidBody.velocity.z);

				// Damping
				if (!_events.keyboard.pressed[_game.player.controlKeys.forward] && !_events.keyboard.pressed[_game.player.controlKeys.backward]) {
					_game.player.acceleration *= _game.player.damping;
				}
			},
			rotate: function() {
				// Rotate player around Z axis
				_cannon.rotateOnAxis(_game.player.rigidBody, new CANNON.Vec3(0, 0, 1), _game.player.rotationAcceleration);

				// Damping
				if (!_events.keyboard.pressed[_game.player.controlKeys.left] && !_events.keyboard.pressed[_game.player.controlKeys.right]) {
					_game.player.rotationAcceleration *= _game.player.rotationDamping;
				}
			},
			jump: function() {
				// Perform a jump if player has collisions and the collision contact is beneath him (ground)
				if (_cannon.getCollisions(_game.player.rigidBody.index) && _game.player.isGrounded) {
					_game.player.isGrounded = false;
					_game.player.rigidBody.velocity.z = _game.player.jumpHeight;
				}
			},
            shoot: function() {
                // find the first available shot
                var light = null;
                
                // this *should* iterate through each light in the list and find the index of the first non-active one
                for (var i = 0; i < _lights.list.length && light === null; i++){
                    if (!_lights.list[i].isActive)
                        light = i;
                }
                
                //console.log("Completed the loop with index " + light);

                // exit early because there was no available shot
                if (light === null)
                    return;
                
                // set the position, intensity, and status of the light
                _lights.list[light].isActive = true;
                _lights.list[light].obj3d.position.set( _game.player.rigidBody.position.x, _game.player.rigidBody.position.y, _game.player.rigidBody.position.z );
                
                // get the X & Y coordinates based off of the Z rotation using desired length + rotation
                var cartesianCoords = window.game.helpers.polarToCartesian(50, _game.player.rotationRadians.z)
                
                _lights.list[light].velocity.x = -1.0 * cartesianCoords.x; //headingVector.x;//_game.player.rigidBody.position.x;
                _lights.list[light].velocity.y = -1.0 * cartesianCoords.y; //headingVector.y;//_game.player.rigidBody.position.y;
                _lights.list[light].velocity.z = 1;
                _lights.list[light].light.intensity = 1.0;
                
                //console.log("x:" + _lights.list[light].velocity.x + ", y:" + _lights.list[light].velocity.y);
                //console.log("You shot!");
                
                
                
                
            },
			updateOrientation: function() {
				// Convert player's Quaternion to Euler radians and save them to _game.player.rotationRadians
				_game.player.rotationRadians = new THREE.Euler().setFromQuaternion(_game.player.rigidBody.quaternion);

				// Round angles
				_game.player.rotationAngleX = Math.round(window.game.helpers.radToDeg(_game.player.rotationRadians.x));
				_game.player.rotationAngleY = Math.round(window.game.helpers.radToDeg(_game.player.rotationRadians.y));

				// Prevent player from being upside-down on a slope - this needs improvement
				if ((_cannon.getCollisions(_game.player.rigidBody.index) &&
					((_game.player.rotationAngleX >= 90) ||
						(_game.player.rotationAngleX <= -90) ||
						(_game.player.rotationAngleY >= 90) ||
						(_game.player.rotationAngleY <= -90)))
					)
				{
					// Reset orientation
					_game.player.rigidBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), _game.player.rotationRadians.z);
				}
			},
			checkGameOver: function () {
				// Example game over mechanism which resets the game if the player is falling beneath -800
				if (_game.player.mesh.position.z <= -800) {
					_game.destroy();
				}
			}
		},
		level: {
			// Methods
			create: function() {
				// Create a solid material for all objects in the world
				_cannon.solidMaterial = _cannon.createPhysicsMaterial(new CANNON.Material("solidMaterial"), 0, 0.1);

				// Define floor settings
				var floorSize = 10000;
				var floorHeight = 20;

				// Add a floor
				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(floorSize, floorSize, floorHeight)),
					mass: 0,
					position: new CANNON.Vec3(0, 0, -floorHeight),
					meshMaterial: new THREE.MeshPhongMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				// Add some boxes
				var count = 0;
				while(count < 10) {

					_cannon.createRigidBody({
						shape: new CANNON.Box(new CANNON.Vec3(40, 400, 20)),
						mass: 0,
						position: new CANNON.Vec3(Math.floor((Math.random() * 1000) + 50),Math.floor((Math.random() * 1000) + 50), 20),
						meshMaterial: new THREE.MeshPhongMaterial({color: window.game.static.colors.cyan}),
						physicsMaterial: _cannon.solidMaterial
					});

					_cannon.createRigidBody({
						shape: new CANNON.Box(new CANNON.Vec3(40, 40, 20)),
						mass: 0,
						position: new CANNON.Vec3(-1 * Math.floor((Math.random() * 1000) + 50),Math.floor((Math.random() * 1000) + 50), 20),
						meshMaterial: new THREE.MeshPhongMaterial({color: window.game.static.colors.cyan}),
						physicsMaterial: _cannon.solidMaterial
					});

                    _cannon.createRigidBody({
						shape: new CANNON.Box(new CANNON.Vec3(400, 40, 20)),
						mass: 0,
						position: new CANNON.Vec3(-1 * Math.floor((Math.random() * 1000) + 50),Math.floor((Math.random() * 1000) + 50), 20),
						meshMaterial: new THREE.MeshPhongMaterial({color: window.game.static.colors.cyan}),
						physicsMaterial: _cannon.solidMaterial
					});
                    
                    _cannon.createRigidBody({
						shape: new CANNON.Box(new CANNON.Vec3(40, 40, 20)),
						mass: 0,
						position: new CANNON.Vec3(Math.floor((Math.random() * 1000) + 50),Math.floor(-1 * (Math.random() * 1000) + 50), 20),
						meshMaterial: new THREE.MeshPhongMaterial({color: window.game.static.colors.cyan}),
						physicsMaterial: _cannon.solidMaterial
					});
                    
                    _cannon.createRigidBody({
						shape: new CANNON.Box(new CANNON.Vec3(40, 400, 20)),
						mass: 0,
						position: new CANNON.Vec3(Math.floor(-1 * (Math.random() * 1000) + 50),Math.floor(-1 * (Math.random() * 1000) + 50), 20),
						meshMaterial: new THREE.MeshPhongMaterial({color: window.game.static.colors.cyan}),
						physicsMaterial: _cannon.solidMaterial
					});
                    
					count++;
				}

				// Grid Helper
				//var grid = new THREE.GridHelper(floorSize, floorSize / 10);
				//grid.position.z = 0.5;
				//grid.rotation.x = window.game.helpers.degToRad(90);
				//_three.scene.add(grid);
			}
		},
        

		// Methods
		init: function(options) {
			// Setup necessary game components (_events, _three, _cannon, _ui)
			_game.initComponents(options);

			// Create player and level
			_game.player.create();
			_game.level.create();

			// Initiate the game loop
			_game.loop();
		},
		destroy: function() {
			// Pause animation frame loop
			window.cancelAnimationFrame(_animationFrameLoop);

			// Destroy THREE.js scene and Cannon.js world and recreate them
			_cannon.destroy();
			_cannon.setup();
			_three.destroy();
			_three.setup();

			// Recreate player and level objects by using initial values which were copied at the first start
			_game.player = window.game.helpers.cloneObject(_gameDefaults.player);
			_game.level = window.game.helpers.cloneObject(_gameDefaults.level);

			// Create player and level again
			_game.player.create();
			_game.level.create();      
            
            // readd the lights to the scene
            _lights.readd();

			// Continue with the game loop
			_game.loop();
		},
		loop: function() {
			// Assign an id to the animation frame loop
			_animationFrameLoop = window.requestAnimationFrame(_game.loop);

			// Update Cannon.js world and player state
			_cannon.updatePhysics();
			_game.player.update();
            
            // Update the lights
            //_lights.update();

			// Render visual scene
			_three.render();
            
            // Update the lights
            _lights.update();
		},
		initComponents: function (options) {
			// Reference game components one time
			_events = window.game.events();
			_three = window.game.three();
			_cannon = window.game.cannon();
			_ui = window.game.ui();

			// Setup lights for THREE.js
			_three.setupLights = function () {
				var hemiLight = new THREE.HemisphereLight(window.game.static.colors.black, window.game.static.colors.black, 0.6);
				hemiLight.position.set(0, 0, -1);
				_three.scene.add(hemiLight);

				var pointLight = new THREE.PointLight(window.game.static.colors.white, 0.2);
				pointLight.position.set(0, 0, 500);
				//_three.scene.add(pointLight);
				
				// Shadow casting light
				var spotLight = new THREE.SpotLight(window.game.static.colors.black);
				spotLight.position.set(1100, 1100, 200);
				
				spotLight.castShadow = true;
				spotLight.shadowDarkness = 0.5;
				
				spotLight.shadowMapWidth = 1024;
				spotLight.shadowMapHeight = 1024;
				
				spotLight.shadowCameraNear = 250;
				spotLight.shadowCameraFar = 3000;
				spotLight.shadowCameraFov = 70;
				
				spotLight.shadowCameraVisible = false;
				
				_three.scene.add(spotLight);
                
                _lights.create();
			};

			// Initialize components with options
			_three.init(options);
			_cannon.init(_three);
			_ui.init();
			_events.init();
			
			// Enable shadows for THREE.js
			_three.renderer.shadowMapEnabled = true;
			_three.renderer.shadowMapType = THREE.PCFSoftShadowMap;

			// Add specific events for key down
			_events.onKeyDown = function () {
				//if (!_ui.hasClass("infoboxIntro", "fade-out")) {
				//	_ui.fadeOut("infoboxIntro");
				//}
			};
		}
	};

	// Internal variables
	var _events;
	var _three;
	var _cannon;
	var _ui;
	var _animationFrameLoop;
	// Game defaults which will be set one time after first start
	var _gameDefaults = {
		player: window.game.helpers.cloneObject(_game.player),
		level: window.game.helpers.cloneObject(_game.level)
	};

	return _game;
};