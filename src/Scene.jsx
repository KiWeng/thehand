import * as THREE from "three"

import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js"
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js"
import {Hand} from "./hand.js"

function Scene(props) {
// const stats = new Stats()
// stats.showPanel(0)
// document.body.appendChild(stats.dom) TODO
    let camera,
        clock,
        scene,
        renderer,
        controls,
        predictHand,
        predict_curl_data

    /**
     * initWaves() TODO: move to a separate component
     */
    init()
    animate()

    function init() {
        camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / 2 / window.innerHeight,
            0.001,
            20,
        )
        camera.position.set(-0.75, 0.7, 1.25)
        scene = new THREE.Scene()

        clock = new THREE.Clock()


        new GLTFLoader().load(
            "assets/vr_glove/vr_glove_right_model.glb",
            function (gltf) {
                predictHand = new Hand(gltf.scene, predict_curl_data)
                scene.add(predictHand.hand_model)
                predictHand.hand_model.position.y = 0.1
                predictHand.hand_model.position.z = 0.05
                predictHand.showHelper(scene)
            },
            undefined,
            (error) => {
                console.error(error)
            },
        )

        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById("canvas"),
        })
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(window.innerWidth / 2, window.innerHeight)
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.outputEncoding = THREE.sRGBEncoding

        const light1 = new THREE.AmbientLight(0xffffff)
        scene.add(light1)
        scene.background = new THREE.Color(0xffffff)


        controls = new OrbitControls(camera, document.getElementById("canvas"))
        controls.enableDamping = true
        controls.update()

        window.addEventListener("resize", onWindowResize)
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / 2 / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth / 2, window.innerHeight)
    }

    function animate() {
        stats.begin()
        requestAnimationFrame(animate)
        /*
        curl: 50hz pre 1000 (20s) post 1000 (20s)
        emg: 2000hz->50hz pre 1000 post 1000 diff 10
         */
        // if (frame_count + 2 < progress) frame_count += 1
        // predictHand.updateHandPose(frame) TODO
        controls.update() // required if damping enabled

        render()
        stats.end()
    }

    function render() {
        renderer.render(scene, camera)
    }


    return (
        <>
            <canvas id="canvas"></canvas>
        </>
    )
}

export default Scene;