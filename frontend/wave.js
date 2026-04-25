// wave.js
// Premium Three.js Particle Wave Background

function initParticleWave() {
    // 1. Setup Canvas Container
    const container = document.createElement('div');
    container.id = 'three-canvas-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.zIndex = '-2'; 
    container.style.pointerEvents = 'none'; 
    document.body.appendChild(container);

    // 2. Setup Three.js Scene, Fog, Camera, Renderer
    const scene = new THREE.Scene();
    
    // Slightly reduced fog to let more distant dots shine through
    scene.fog = new THREE.FogExp2(0x050505, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    
    // Moved camera further back and higher to make the wave feel distant
    camera.position.z = 1400;
    camera.position.y = 500;
    camera.position.x = 0;
    
    const lookAtPos = new THREE.Vector3(0, -100, -200);
    camera.lookAt(lookAtPos);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 3. Create a smooth circular glow texture using Canvas API
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(canvas);

    // Removed Light Source (Star) per request

    // 5. Setup Particles Configuration
    const SEPARATION = 70; // Distance between particles
    const AMOUNTX = 120;   // Much wider grid
    const AMOUNTY = 80;    // Deeper grid
    const numParticles = AMOUNTX * AMOUNTY;

    const positions = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    // Custom colors: Bright White and Vibrant Light Blue for better visibility
    const colorWhite = new THREE.Color(0xffffff);
    const colorBlue = new THREE.Color(0x88ccff);

    let i = 0, j = 0, c = 0;

    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
            positions[i + 1] = 0; // y
            positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // z
            
            const mixedColor = colorWhite.clone().lerp(colorBlue, Math.random());
            colors[c] = mixedColor.r;
            colors[c + 1] = mixedColor.g;
            colors[c + 2] = mixedColor.b;
            
            scales[j] = 1;

            i += 3;
            j++;
            c += 3;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // 6. Custom Shader Material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            textureMap: { value: particleTexture }
        },
        vertexShader: `
            attribute float scale;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                // Size attenuation formula (particles get smaller further away)
                // Increased multiplier to make particles much more visible
                gl_PointSize = scale * (400.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D textureMap;
            varying vec3 vColor;
            void main() {
                vec4 texColor = texture2D(textureMap, gl_PointCoord);
                gl_FragColor = vec4(vColor, 1.0) * texColor;
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 7. Animation Variables
    let count = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 8. Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Calculate smooth camera parallax based on mouse position
        targetX = mouseX * 0.3; // subtle movement for distant feel
        targetY = mouseY * 0.15;
        
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY + 500 - camera.position.y) * 0.05;
        camera.lookAt(lookAtPos);

        const posArray = particles.geometry.attributes.position.array;
        const scaleArray = particles.geometry.attributes.scale.array;
        
        let i = 0, j = 0;
        
        // Execute the Uniform Wave logic
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                
                // UNIFORM WAVES: 
                // We heavily rely on the X-axis (ix) with a low multiplier (0.1) for broad waves.
                // We add a tiny bit of Y-axis (iy) to keep it feeling like an ocean rather than straight lines.
                posArray[i + 1] = (Math.sin((ix - count) * 0.1) * 80) +
                                  (Math.sin((iy - count) * 0.05) * 20);
                
                // Larger scale pulsing for better visibility
                scaleArray[j] = (Math.sin((ix - count) * 0.1) + 1) * 10 +
                                (Math.sin((iy - count) * 0.05) + 1) * 8;
                            
                i += 3;
                j++;
            }
        }

        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.scale.needsUpdate = true;

        renderer.render(scene, camera);
        
        count += 0.04; // Smooth, slow flow speed
    }

    animate();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticleWave);
} else {
    initParticleWave();
}
