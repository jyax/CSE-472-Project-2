import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const particleCount = 10000;
const particles = new THREE.BufferGeometry();
const positions = [];
const colors = [];  // Array to hold the colors for each vertex

const initialColor = { color: '#50C878' };  // Emerald Green color
const color = new THREE.Color(initialColor.color);

for (let i = 0; i < particleCount; i++) {
    positions.push(
        (Math.random() - 0.5) * 10,   // x
        (Math.random() - 0.5) * 10,  // y
        (Math.random() - 0.5) * 10    // z
    );
    colors.push(color.r, color.g, color.b);  // Push initial color for each particle
}

particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true
});

const particleSystem = new THREE.Points(particles, material);
scene.add(particleSystem);

camera.position.z = 5;

let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
const forceRadius = 2;
let force = 0.05;
let sizeValue = 0.05;  // size value
let gravity = -0.0033;  // gravity value

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove, false);

function updateForce(value) {
    force = value;
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
    const colors = particleSystem.geometry.attributes.color.array;
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
            let dz = positions[i + 2] - intersects[0].point.z;
            let distance = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);

            if (distance < forceRadius) {
                positions[i] += dx / distance * force;
                positions[i + 1] += dy / distance * force;
                positions[i + 2] += dz / distance * force;
            }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Apply gravity to all particles
    const posArray = particleSystem.geometry.attributes.position.array;
    for (let i = 1; i < posArray.length; i += 3) {
        posArray[i] += gravity;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

animate();

const gui = new GUI();
gui.addColor(initialColor, 'color').name('Particle Color').onChange(updateColor);
gui.add({ gravity: gravity }, 'gravity', -0.0098, 0, 0.0001).name('Gravity').onChange(updateGravity);
gui.add({ size: sizeValue }, 'size', 0.05, 1, 0.01).name('Size').onChange(updateSize);
gui.add({ force: force }, 'force', 0.05, 0.5, 0.01).name('Force').onChange(updateForce);