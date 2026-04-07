import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export function CosmosCanvas({ users, myId, onMove }) {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const avatarsRef = useRef({});
  const keysRef = useRef({ w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });

  const usersRef = useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const propsMyIdRef = useRef(myId);
  useEffect(() => {
    propsMyIdRef.current = myId;  
  }, [myId]);

  useEffect(() => {
    // Initialize our Pixi world
    const app = new PIXI.Application({
      resizeTo: canvasRef.current, 
      backgroundColor: 0x1e293b,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    
    appRef.current = app;
    canvasRef.current.appendChild(app.view);

    // Create a 'world' container that moves with the camera
    const world = new PIXI.Container();
    app.stage.addChild(world);

    // Create a background layer inside the world
    const bgTexture = PIXI.Texture.from('/office_map.png');
    const background = new PIXI.Sprite(bgTexture);
    background.anchor.set(0);
    world.addChild(background);

    const MAP_WIDTH = 1200;
    const MAP_HEIGHT = 800;
    background.width = MAP_WIDTH;
    background.height = MAP_HEIGHT;

    // Resize world to fit the container precisely
    function fitToScreen() {
      const scale = Math.min(app.screen.width / MAP_WIDTH, app.screen.height / MAP_HEIGHT);
      world.scale.set(scale);
      // Center it
      world.x = (app.screen.width - MAP_WIDTH * scale) / 2;
      world.y = (app.screen.height - MAP_HEIGHT * scale) / 2;
    }

    fitToScreen();
    app.renderer.on('resize', fitToScreen);

    // Setup input listeners for movement
    const onKeyDown = (e) => { 
      const key = e.key.toLowerCase();
      if (keysRef.current[key] !== undefined) keysRef.current[key] = true; 
      if (keysRef.current[e.key] !== undefined) keysRef.current[e.key] = true; 
    };
    
    const onKeyUp = (e) => { 
      const key = e.key.toLowerCase();
      if (keysRef.current[key] !== undefined) keysRef.current[key] = false; 
      if (keysRef.current[e.key] !== undefined) keysRef.current[e.key] = false; 
    };
    
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Main ticker loop
    app.ticker.add((delta) => {
      const currentUsers = usersRef.current;
      const currentId = propsMyIdRef.current;
      
      let dx = 0;
      let dy = 0;
      // Movement speed (normalized for frame-rate and map size)
      const moveSpeed = 6 * delta;
      
      const activeKeys = keysRef.current;
      if (activeKeys.w || activeKeys.ArrowUp) dy -= moveSpeed;
      if (activeKeys.s || activeKeys.ArrowDown) dy += moveSpeed;
      if (activeKeys.a || activeKeys.ArrowLeft) dx -= moveSpeed;
      if (activeKeys.d || activeKeys.ArrowRight) dx += moveSpeed;

      // Update local position
      if ((dx !== 0 || dy !== 0) && currentId && currentUsers[currentId]) {
        const myPs = currentUsers[currentId];
        // Calculate and bound new position (clamped inside the map)
        const targetX = Math.max(0, Math.min(MAP_WIDTH, myPs.x + dx));
        const targetY = Math.max(0, Math.min(MAP_HEIGHT, myPs.y + dy));
        onMove(targetX, targetY);
      }
      
      // Render all avatars
      Object.values(currentUsers).forEach(user => {
        let avatar = avatarsRef.current[user.id];
        
        if (!avatar) {
          avatar = createAvatar(user, world);
          avatarsRef.current[user.id] = avatar;
        }

        // Smooth movement tween
        avatar.x += (user.x - avatar.x) * 0.25;
        avatar.y += (user.y - avatar.y) * 0.25;

        // Visual proximity ring for the current user
        if (user.id === currentId && !avatar.ring) {
          avatar.ring = new PIXI.Graphics();
          avatar.ring.lineStyle(1.5, 0xffffff, 0.4);
          avatar.ring.drawCircle(0, 0, 150);
          avatar.addChildAt(avatar.ring, 0);
          // Simple visual breathing effect for the ring
          avatar._pulse = 0;
        }

        if (avatar.ring) {
          avatar._pulse = (avatar._pulse || 0) + 0.05 * delta;
          avatar.ring.alpha = 0.2 + Math.sin(avatar._pulse) * 0.05;
        }
      });

      // Cleanup left users
      Object.keys(avatarsRef.current).forEach(id => {
        if (!currentUsers[id]) {
          world.removeChild(avatarsRef.current[id]);
          delete avatarsRef.current[id];
        }
      });
    });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      app.renderer.off('resize', fitToScreen);
      
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        appRef.current = null;
      }
    };
  }, []);
 

  // Function to create standard avatar graphics
  const createAvatar = (user, container) => {
    const avatar = new PIXI.Container();
    avatar.x = user.x;
    avatar.y = user.y;

    const body = new PIXI.Graphics();
    body.beginFill(parseInt(user.color.replace('#', '0x')) || 0x3b82f6);
    body.drawCircle(0, 0, 24);
    body.endFill();
    body.lineStyle(3, 0xffffff, 0.8);
    body.drawCircle(0, 0, 24);

    const nameText = new PIXI.Text(user.name, {
      fontFamily: 'Inter, sans-serif',
      fontSize: 14,
      fill: 0xffffff,
      align: 'center',
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowDistance: 2,
    });
    nameText.anchor.set(0.5);
    nameText.y = -35; 

    avatar.addChild(body);
    avatar.addChild(nameText);
    
    container.addChild(avatar);
    return avatar;
  };

  return <div ref={canvasRef} className="absolute inset-0 z-0 h-full w-full overflow-hidden" />;
}
