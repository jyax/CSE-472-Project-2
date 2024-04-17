import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { range, texture, mix, uv, color, positionLocal, timerLocal, SpriteNodeMaterial } from 'three/nodes';

let scene, camera, renderer;

let mouseRadius = 0.25;
let mouseForce = 0.05;
let sizeValue = 0.04;
let gravity = -0.0033;

const particleCount = 10000;
const particles = new THREE.BufferGeometry();
const positions = [];
const colors = [];
const initialColor = { color: '#50C878' };  // Emerald Green color
const color1 = new THREE.Color(initialColor.color);

const gui = new GUI();
gui.addColor(initialColor, 'color').name('Particle Color').onChange(updateColor);
gui.add({ gravity: gravity }, 'gravity', -0.0098, 0, 0.0001).name('Gravity').onChange(updateGravity);
gui.add({ size: sizeValue }, 'size', 0.05, 1, 0.01).name('Size').onChange(updateSize);
gui.add({ force: mouseForce }, 'force', 0.05, 0.5, 0.01).name('Force').onChange(updateForce);
gui.add({ radius: mouseRadius }, 'radius', 0.25, 2.5, 0.25).name('Mouse Radius').onChange(updateMouseRadius);
const smokeParams = { enabled: true };
gui.add(smokeParams, 'enabled').name('Enable Smoke').onChange(function (value) {
    smokeParticles.visible = value;


// Scene Management
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Particles
const smokeColor = mix( color( 0x2c1501 ), color( 0x222222 ), positionLocal.y.mul( 3 ).clamp() );
const textureLoader = new THREE.TextureLoader();
const smokeTexture = textureLoader.load('smoke1.png');

for (let i = 0; i < particleCount; i++) {
    positions.push(
        (Math.random() - 0.5) * 10, // X
        (Math.random() - 0.5) * 10, // Y
        0                           // Z
    );
    colors.push(color1.r, color1.g, color1.b);  // Push initial color for each particle
    colors.push(smokeColor.r, smokeColor.g, smokeColor.b);

}

particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true
});

const smokeMaterial = new THREE.PointsMaterial({
    size: 0.4,
    vertexColors: true,
    map: smokeTexture,
    depthWrite: false,
    transparent: true,

});

const smokeParticles = new THREE.Points(particles, smokeMaterial);
scene.add(smokeParticles);

const particleSystem = new THREE.Points(particles, material);
scene.add(particleSystem);

let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();


function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove, false);

function updateForce(value) {
    mouseForce = value;
}

function updateMouseRadius(value) {
    mouseRadius = value;
}

function updateSize(value) {
    sizeValue = value;
    particleSystem.material.size = sizeValue;
}

function updateGravity(value) {
    gravity = value;
}

function updateColor(value) {
    const newColor = new THREE.Color(value);
    const colors = particleSystem.geometry.attributes.color1.array;
    for (let i = 0; i < colors.length; i += 3) {
        colors[i] = newColor.r;
        colors[i + 1] = newColor.g;
        colors[i + 2] = newColor.b;
    }
    particleSystem.geometry.attributes.color.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(particleSystem);

    if (intersects.length > 0) {
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            let dx = positions[i] - intersects[0].point.x;
            let dy = positions[i + 1] - intersects[0].point.y;
            let distance = Math.sqrt(dx ** 2 + dy ** 2);

            if (distance < mouseRadius) {
                positions[i] += dx / distance * mouseForce;
                if (positions[i + 1] += dy / distance * mouseForce > -3.82) {
                    positions[i + 1] += dy / distance * mouseForce;
                }
                positions[i + 2] += 0;
            }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Apply gravity to all particles

    const posArray = particleSystem.geometry.attributes.position.array;
    for (let i = 1; i < posArray.length; i += 3) {
        if (posArray[i] > -3.82) {
            posArray[i] += gravity;
        }
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;


    renderer.render(scene, camera);
}

animate();