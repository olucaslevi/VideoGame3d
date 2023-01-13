import React, { Component } from 'react';
import io from 'socket.io-client';
import { useState,useEffect, useRef } from 'react';
// importin three
import * as THREE from 'three';
// importing cannon to physics
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
// import css
import './App.css';
// importing cannon-es
import { World } from 'cannon-es';
// animations
let mixer;
let mixOtherPlayer;
var socket = io.connect('localhost:3001');
let color;
let clock = new THREE.Clock();

export function App() {
   const [name, setName] = useState("");
   const [user, setUser] = useState(null);
   const [message, setMessage] = useState("");
   var messages = [];
   const [players, setPlayers] = useState([]);
   // const [typing, setTyping] = useState(false);
   var otherPlayers = [], otherPlayersId = [];
   var player, playerId, moveSpeed, turnSpeed;
   var playerData;
   var objects = [];
   var typing;

   function log (text,autor,color){
      if (color == undefined) color = 'black';
      if (autor == undefined) autor = 'Servidor';
      // document.getElementById("usernameError").innerHTML = `<span style='${color}'>**Message</span>`;
      const parent = document.getElementById("chat-list");
      const el = document.createElement('li'); // Create a <li> node num <ul>
      el.innerHTML = `<span style='color: ${color}'>${autor}: </span> ${text}`;
      parent.appendChild(el); // appends the <li> node to the <ul> node
      parent.scrollTop = parent.scrollHeight; // scrolls the chat box to the bottom
      // add to messages array
      // verify if message is > 5

      messages.push({text,autor,color});
      console.log(messages);
   }

   useEffect(() => {
      socket.on('message', (text,autor,color) => {
         if (text != undefined && autor != undefined && color != undefined){
            log(text,autor,color);
         }
      });
      socket.on('connect', function(){
         init();
         // get all players
         socket.emit('requestOldPlayers', {}); // pega todos os players online no servidor

      });
      function init () {
         const scene = new THREE.Scene(); /// creating scene
         const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
         const renderer = new THREE.WebGLRenderer();

         // ? physics
         const physicWorld = new CANNON.World({
            gravity: new CANNON.Vec3(0, -10, 0), // m/s² // setting gravity
          })
          const world = new World();
          const cannonDebugger = new CannonDebugger(scene, physicWorld, {
            color:'blue',
          })
         // * adding grid to scene
         // scene.add( new THREE.GridHelper( 100, 100 ) );
          // ? physics
         // *size, intensity, distance, decay
         // center canvas
         renderer.setSize(window.innerWidth/1.3, window.innerHeight/1.3);
         renderer.domElement.style.border = "1px solid black";
         renderer.domElement.style.margin = "auto";
         document.body.appendChild(renderer.domElement);

         const controls = new OrbitControls(camera, renderer.domElement);
         controls.target.set(0, 10, 0);

         // ? CREATE PLAYER
         var createPlayer = function(data){
            playerData = data;
            color = data.color;
            
            var cube_geometry = new THREE.BoxGeometry(data.sizeX, data.sizeY, data.sizeZ);
            var cube_material = new THREE.MeshBasicMaterial({color: color, wireframe: false});
            player = new THREE.Mesh(cube_geometry, cube_material);
      
            player.rotation.set(0,0,0);
      
            player.position.x = data.x;
            player.position.y = data.y;
            player.position.z = data.z;
      
            player.name = data.name;
            player.color = data.color;
            playerId = data.playerId;
            moveSpeed = data.speed;
            turnSpeed = data.turnSpeed;
            
            // body
            // cannon stuff
            const cubeShape = new CANNON.Box(new CANNON.Vec3(data.sizeX/2, data.sizeY/2, data.sizeZ/2));
            const cubeBody = new CANNON.Body({
               mass: 1,
               shape: cubeShape,
               position: new CANNON.Vec3(data.x, data.y, data.z),
               linearDamping: 0.9,
               angularDamping: 0.9,
            })
            physicWorld.addBody(cubeBody);
            player.body = (cubeBody.x, cubeBody.y, cubeBody.z);

            const loader = new GLTFLoader();
            loader.load('/Assets/player.gltf', function (gltf) {
               const root = gltf.scene;
               root.position.set(0, 0, 0);
               root.scale.set(1,1,1);
               player.add(root);
               mixer = new THREE.AnimationMixer(root);
               const action = mixer.clipAction(gltf.animations[0]);
               action.play();
            }, undefined, function (error) {
               console.error(error);
            });


            
            //draw name
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            context.font = "Bold 20px Arial";

            // color = data.color
            context.fillStyle = color;
            context.fillText(data.name, 110, 70);
            var texture = new THREE.Texture(canvas)
            texture.needsUpdate = true;
            var spriteMaterial = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(50,25);   
            player.add(sprite); // this centers the text
            players.push(player);
            objects.push( player );
            scene.add( player );
         };
         // ? CREATE PLAYER

         // ? CREATE OTHER PLAYER
         var addOtherPlayer = function(data){ 
            // get color and name
            let color = data.color
            let name = data.name
            let id = data.playerId

            const loader2 = new GLTFLoader();
            loader2.load('/Assets/player.gltf', function (gltf) {
               const root2 = gltf.scene;
               mixOtherPlayer = new THREE.AnimationMixer(root2);
               otherPlayer.add(root2);
               const action = mixOtherPlayer.clipAction(gltf.animations[0]);
               action.play();
            }, undefined, function (error) {
               console.error(error);
            });
            
            // add cube
            var cube_geometry = new THREE.BoxGeometry(data.sizeX, data.sizeY, data.sizeZ);
            var cube_material = new THREE.MeshBasicMaterial({color: color, wireframe: false});
            var otherPlayer = new THREE.Mesh(cube_geometry, cube_material);

            otherPlayer.position.x = data.x;
            otherPlayer.position.y = data.y;
            otherPlayer.position.z = data.z;

            // Create Cylinder Physics
            const shape = new CANNON.Box(new CANNON.Vec3(data.sizeX/2, data.sizeY/2, data.sizeZ/2))
            const body = new CANNON.Body({
               id: id,
               mass: 1,
               shape: shape,
               position: new THREE.Vector3(data.x, data.y, data.z),
               linearDamping: 0.9,
               angularDamping: 0.9,
            })

            physicWorld.addBody(body)
            otherPlayer.body = body

            // draw name
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            context.font = "Bold 20px Arial";
            context.fillStyle = color;
            context.fillText(name, 110, 70);
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(50, 25);
            otherPlayer.add(sprite); // this centers the text


            otherPlayersId.push( data.playerId );
            otherPlayers.push( otherPlayer );
            objects.push( otherPlayer );
            scene.add( otherPlayer );

         };
                  // ? CREATE OTHER PLAYER

         socket.on('createPlayer', function(data){
            createPlayer(data); // envia os dados do player para a função createPlayer
            socket.emit('requestNewPlayer',{}); // envia um update para o servidor p/ ele enviar para todos os outros players
            // socket.emit('updatePosition', playerData);
         });
         

         socket.on('removeOtherPlayer', function(data){
            // descomentar isso abaixo urgente
            // removeOtherPlayer(data);
         });
         var updatePlayerPosition = function(data){

            var somePlayer = playerForId(data.playerId);
            if(somePlayer){
               somePlayer.position.x = data.x;
               somePlayer.position.y = data.y;
               somePlayer.position.z = data.z;

               somePlayer.rotation.x = data.r_x;
               somePlayer.rotation.y = data.r_y;
               somePlayer.rotation.z = data.r_z;

               somePlayer.p_x = data.p_x;
               somePlayer.p_y = data.p_y;
               somePlayer.p_z = data.p_z;
               // cannon update
               somePlayer.body.position.x = data.x;
               somePlayer.body.position.y = data.y;
               somePlayer.body.position.z = data.z;

            }
         };
         socket.on('updatePosition', function(data){
            updatePlayerPosition(data);
         });
         var updatePlayerData = function(){
            playerData.x = player.position.x;
            playerData.y = player.position.y;
            playerData.z = player.position.z;

            playerData.r_x = player.rotation.x;
            playerData.r_y = player.rotation.y;
            playerData.r_z = player.rotation.z;

            playerData.p_x = player.position.x;
            playerData.p_y = player.position.y;
            playerData.p_z = player.position.z;

            // update body
            playerData.body = player.body;

         };


         socket.on('addOtherPlayer', function(data){
            addOtherPlayer(data);
         });

         socket.on('requestNewPlayer', (data) => {
            addOtherPlayer(data);
         });
         socket.on('login', (data) => {
            console.log('data eh', data); // aqui recebo o player atualizado (nome)
            
            
         });
         var removeOtherPlayer = function(data){
            scene.remove( playerForId(data.playerId) );
         };

         var playerForId = function(id){
            var index;
            for (var i = 0; i < otherPlayersId.length; i++){
               if (otherPlayersId[i] == id){
                  index = i;
                  break;
               }
            }
            return otherPlayers[index];
         };

         // ? light
         const light2 = new THREE.DirectionalLight(0xffffff, 0.7);
         light2.position.set(0, 1, 0);
         scene.add(light2);

         // * sunlight
         const sun = new THREE.AmbientLight(0xffffff,0.6, 100, 2);
         scene.add(sun);


         // ? Texture from ground plane
         let planesize = 100;
         // load a texture, set wrap mode to repeat

         const texture = new THREE.TextureLoader().load( 'https://threejsfundamentals.org/threejs/resources/images/checker.png' );
         texture.wrapS = THREE.RepeatWrapping;
         texture.wrapT = THREE.RepeatWrapping;
         const repeats = planesize/4;
         // do not blur texture
         texture.magFilter = THREE.NearestFilter;
         texture.repeat.set( repeats, repeats );

         // load texture
         const textureLoader = new THREE.TextureLoader();
         const texture2 = textureLoader.load('/Assets/texture.jpg');
         texture2.wrapS = THREE.RepeatWrapping;
         texture2.wrapT = THREE.RepeatWrapping;
         texture2.repeat.set( repeats, repeats);

         
         // ? axis helper
         const axesHelper = new THREE.AxesHelper(5);
         // scene.add(axesHelper);
         let loader = new GLTFLoader();
         // add scene map to scene
         loader.load('/Assets/mapa.gltf', function (gltf) {
            const rootMap = gltf.scene;
            scene.add(rootMap);
            rootMap.scale.set(300,300,300);
            rootMap.position.y = -8;
         }, undefined, function (error) {
            console.error(error);
         });



         // * GRASS PLANE
         const planeGeometry = new THREE.PlaneGeometry(1200, 1200, 1200, 1200);
         // soft green collor: 0x44aa88
         const planeMaterial = new THREE.MeshBasicMaterial({map:texture2, side: THREE.DoubleSide});
         const plane = new THREE.Mesh(planeGeometry, planeMaterial);
         plane.receiveShadow = true;
         plane.rotation.x = -0.5 * Math.PI;
         plane.position.y = -16;
         
         scene.add(plane);
         // add to objects
         objects.push(plane);
         // * GRASS PLANE

         // ? BACKGROUND AND FOG
         scene.background = new THREE.Color(0x20a357);
         scene.fog = new THREE.Fog(
            0x20a357, // color
            0, // near
            100, // far
         );
         // ? BACKGROUND AND FOG




         const radius = 1 // 

         // add sphere three
         const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32)
         const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
         const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
         sphere.castShadow = true
         sphere.receiveShadow = true
         scene.add(sphere)
         // add sphere to objects
         objects.push(sphere);

         
         const sphereBody = new CANNON.Body({ // sphereBody is a CANNON.Body 
           mass: 60, // kg
           shape: new CANNON.Sphere(radius),
         })
         // add sphere to physic
         physicWorld.addBody(sphereBody)
         // add sphere to sphereBody
         sphereBody.addShape(new CANNON.Sphere(radius))
         sphereBody.position.set(0, 10, 0) // m
         physicWorld.addBody(sphereBody)


         const groundBody = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane(),
            mass: 0,
          })
          groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // make it face up
          physicWorld.addBody(groundBody)


         // ? DRAW FPS
         const stats = new Stats();
         document.body.appendChild(stats.dom);
         // ? DRAW FPS

         // * camera lookAt
         camera.lookAt(0,0,0);
         // * camera update
         camera.updateProjectionMatrix();
         
         
         camera.position.z = 18;
         camera. position.y = 10;
         // camera rotation
         camera.rotation.z = 50;

         

         // * wasd movement
         document.addEventListener('keydown', (event) => {
            const keyName = event.key;
            if(player != null){
               if (keyName === 'w') {
                  if (typing) return;
                  // up arrow or 'w' - move forward
                  player.position.x -= moveSpeed * Math.sin(player.rotation.y);
                  player.position.z -= moveSpeed * Math.cos(player.rotation.y);
                  // cannon update
                  

                  updatePlayerData();
                  socket.emit('updatePosition', playerData);

               }
               if (keyName === 's') {
                  if (typing) return;
                              // down arrow or 's' - move backward
                  player.position.x += moveSpeed * Math.sin(player.rotation.y);
                  player.position.z += moveSpeed * Math.cos(player.rotation.y);

                  
                  updatePlayerData();
                  socket.emit('updatePosition', playerData);
               }
               if (keyName === 'a') {
                  if (typing) return;
                  // left arrow or 'a' - rotate left
                  player.position.x -= moveSpeed;
                  player.p_x -= moveSpeed;

                  updatePlayerData();
                  socket.emit('updatePosition', playerData);
               }
               if (keyName === 'd') {
                  if (typing) return;
                              // right arrow or 'd' - rotate right
                  player.p_z += moveSpeed;
                  player.position.x += moveSpeed;

                  updatePlayerData();
                  socket.emit('updatePosition', playerData);
               }
               if (keyName === ' ') {
                  player.position.y += moveSpeed;
                  updatePlayerData();
                  socket.emit('updatePosition', playerData);
               }
         }});

         // * if press enter, typing
         document.addEventListener('keypress', (event) => {
            const keyName = event.key;
            if (keyName === 'Enter') {
               typing = !typing;
               if (typing){
                  document.getElementById("chat-input").focus();
               } else {
                  document.getElementById("chat-input").blur();
               }
            }
            console.log(typing);
         });
         const update = () => { 
            // * update camera
            camera.updateProjectionMatrix();
            // * update controls
            controls.update();
            // * update stats
            stats.update();
         };
         const animate = () => { // animation loop
            update();
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            physicWorld.fixedStep();
            // cannonDebugger.update()
            // mixer update

            if (mixer) mixer.update(clock.getDelta());
            if (mixOtherPlayer) mixOtherPlayer.update(clock.getDelta());

         }
         animate();
      }

    }, []);


   function handleChange(event) {
      setName(event.target.value);
   }


   function handleClick() { // envio apenas o username
      if (name != "") {
         if (name.length > 3 && name.length < 10) {
            socket.emit('login', name);
            document.getElementById("username").style.display = "none";
            document.getElementById("buttonSubmit").style.display = "none";
            document.getElementById("chat-form").style.display = "block";
         }else{
            alert("Nome muito curto");
         }
      }else{
         alert("Nome inválido");
      }
   }
   function handleExit() {
      
   }
   function handleMessageChange(event) {
      setMessage(event.target.value);
   }
   function handleSendMessage(e) {
      e.preventDefault();
      if (message != "") {
         socket.emit('message', message, name);
      }
      // set value to empty
      setMessage("");
      document.getElementById("chat-input").value = "";
   }
   
   
   return (
      
      <div className="App" >
         <header className="App-header" z-index="15000   ">
            <h1>Game</h1>
            <div>
               <label>Press Enter to chat and WASD to mode in 3d environment </label><br/>
               <input id="username" type='text' maxLength={12} placeholder='username' onChange={handleChange}></input><br/>
               <button id="buttonSubmit" type='submit' onClick={handleClick}>Entrar !</button>
            </div>
            <div id="root">
               <div id="chat-div">
                    <ul id="chat-list"></ul>
                    <form id="chat-form" hidden="hidden">
                        <input type="text" id="chat-input" autoComplete="off" onChange={handleMessageChange}/>
                        <button type="click" id="submit" onClick={handleSendMessage}>falar</button>
                        {/* <button type="submit" id="btnSair" onClick={handleExit} >Sair</button> */}
                    </form>
                </div>
            </div>
         </header>
      </div>
   );
}
export default App; 