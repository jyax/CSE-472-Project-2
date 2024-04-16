import * as three from 'three'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {uniform } from 'three/nodes'

const scene = new three.Scene();
const camera = new three.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000 );

const renderer = new three.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// const geometry = new three.BoxGeometry(1, 1, 1);
// const material = new three.MeshBasicMaterial( {color: 0x00ff00 } );
// const cube = new three.Mesh( geometry, material );
// scene.add ( cube );

const particleCount = 10000;

const particles = new three.BufferGeometry();
const positions = []

for (let i = 0; i < particleCount; i++)
{
    positions.push(
        Math.random() - 0.8 * 10,   // x
        Math.random() - 0.8 * -10,  // y
        Math.random() - 0.5 * 20    // z
    );
}

particles.setAttribute('position', new three.Float32BufferAttribute(positions, 3));

const material = new three.PointsMaterial({
    color: 0xffff00,
    size: 0.1
});

const particleSystem = new three.Points(particles, material);
scene.add(particleSystem);

camera.position.z = 5;

let mouse = new three.Vector2();
let raycaster = new three.Raycaster();
const forceRadius = 2;
let force = 0.05;
let sizeValue = 0.12;

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
function animate() {
    requestAnimationFrame( animate );

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(particleSystem);

    if (intersects.length > 0)
    {
        const positions = particleSystem.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            let dx = positions[i] - intersects[0].point.x;
            let dy = positions[i + 1] - intersects[0].point.y;
            let dz = positions[i + 2] - intersects[0].point.z;
            let distance = Math.sqrt(dx**2 + dy**2 + dz**2);

            if (distance < forceRadius)
            {
                positions[i] += dx / distance * force;
                positions[i + 1] += dy / distance * force;
                positions[i + 2] += dz / distance * force;
            }
        }
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;

    // Basic Gravity Movement
    // const positions = particleSystem.geometry.attributes.position.array;
    // for (let i = 1; i < positions.length; i += 3)
    // {
    //     positions[i] -= 0.05;
    // }

    const gravity = uniform(- .0098);
    const gui = new GUI();

    gui.add(gravity, 'value', - .0098, 0, 0.0001).name('gravity');
    gui.add({ size: sizeValue }, 'size', 0.05, 1, 0.01).name('size').onChange(updateSize);
    gui.add({ force: force }, 'force', 0.05, 0.5, 0.01).name('force').onChange(updateForce);

    renderer.render( scene, camera );
}

animate();