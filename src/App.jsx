import Scene from "./Scene";
import {createEffect, createSignal, Show} from "solid-js";
import {createWS} from "@solid-primitives/websocket";
import Panel from "./Panel";
import ModelModal from "./ModelModal"
import {Spinner} from '@papanasi/solid';
import '@papanasi/solid/papanasi.css';
import './loading.css'

function App() {
  let id = 0

  // TODO: make this a signal so that can be set by the user
  let defaultGestures = [
    [16, 0, 0, 0, 0],
    [2, 12, 2, 2, 2],
    [2, 2, 12, 2, 2],
    [2, 2, 4, 12, 4],
    [2, 2, 2, 6, 10],
    [12, 16, 16, 16, 16],
    // [12, 0, 0, 12, 12],
    // [0, 0, 12, 12, 0],
    [16, 0, 0, 0, 0],
    [2, 12, 2, 2, 2],
    [2, 2, 12, 2, 2],
    [2, 2, 4, 12, 4],
    [2, 2, 2, 6, 10],
    [12, 16, 16, 16, 16],
    // [12, 0, 0, 12, 12],
    // [0, 0, 12, 12, 0],
  ]


  const [data, setData] = createSignal([[0, 0, 0, 0, 0]]);
  const [mode, setMode] = createSignal("inactive")
  const [model, setModel] = createSignal("tmp")
  const [newModel, setNewModel] = createSignal("tmp")
  const [modelList, setModelList] = createSignal([])
  const [modalVisibility, setModalVisibility] = createSignal(false)
  const [gestures, setGestures] = createSignal(defaultGestures)
  const [calibrationState, setCalibrationState] = createSignal("")
  const [accum, setAccum] = createSignal(0)

  const fetchModelList = async () => {
    await fetch('http://127.0.0.1:8081/models/',)
      .then(response => response.json())
      .then(data => setModelList(data['models']))
  }


  let ws = null
  let switchMode = (targetMode) => {
    switch (mode()) {
      case "inactive":
        setMode(targetMode)
        break
      case "calibration":
      case "recognition":
      case "test":
        if (ws !== null) {
          ws.send("close")
          ws.close();
          console.log(ws);
        }
        break
    }
  }

  let toggleModalVisibility = () => {
    setModalVisibility(!modalVisibility())
    if (modalVisibility()) {
      fetchModelList().then(r => {
      })
    }
  }


  createEffect(() => {
    console.log(calibrationState());
    switch (calibrationState()) {
      case "calibration finished":
        switchMode("inactive")
        break
    }
  })


  createEffect(() => {
    console.log(mode());
    switch (mode()) {
      case "recognition":
        start_infer()
        break
      case "calibration":
        start_calibration()
        break
      case "test":
        start_test()
        break
    }
  })

  const start_calibration = () => {
    ws = createWS("ws://localhost:8081/calibration/" + model())
    let data = JSON.stringify({
      "type": "start",
      "gestures": gestures(),
      "new_model_name": newModel(),
    })
    ws.send(data)
    ws.addEventListener("message", e => {
      const response = JSON.parse(e.data)
      console.log(response);
      setCalibrationState(response.action)
    })
    ws.addEventListener("close", e => {
      setCalibrationState("")
      setMode("inactive")
    })

    createEffect(() => {
      // console.log(accum())
      if (accum() >= gestures().length * 5 * 60) {
        let data = JSON.stringify({
          "type": "stop",
          "start_time": start_time,
          "stop_time": stop_time,
        })
        console.log(data);
        switch (calibrationState()) {
          case "start calibration":
            ws.send(data)
            clearInterval(intervalFunc)
            break
        }
      }
    })

    setAccum(0)
    const start_time = Date.now()
    let stop_time = null
    const intervalFunc = setInterval(() => {
      let section = Math.floor(accum() / 300)
      let fp = (accum() / 300) - section
      let pos = 0
      if (fp > 0.9) {
        pos = (1 - fp) * 10
      } else if (fp > 0.5) {
        pos = 1
      } else if (fp > 0.4) {
        pos = (fp - 0.4) * 10
      }

      setData([gestures()[section].map(element => pos * element)])

      setAccum(Math.floor(Date.now() - start_time) / 16.666666)
      stop_time = Date.now()
    }, 16.666666)

  }


  const start_test = () => {
    ws = createWS("ws://localhost:8081/test/" + model())
    ws.addEventListener("close", e => {
      setMode("inactive")
    })

    let repeats = 2

    createEffect(() => {
      // console.log(accum())
      if (accum() >= gestures().length * repeats * 5 * 60) {
        clearInterval(intervalFunc)
        switchMode('inactive')
      }
    })

    setAccum(0)
    const start_time = Date.now()
    let stop_time = null
    const intervalFunc = setInterval(() => {
      let section = Math.floor(accum() / 300)
      let fp = (accum() / 300) - section
      let pos = 0
      if (fp > 0.9) {
        pos = (1 - fp) * 10
      } else if (fp > 0.5) {
        pos = 1
      } else if (fp > 0.4) {
        pos = (fp - 0.4) * 10
      }

      setData([gestures()[section % gestures().length].map(
        element => pos * element)]
      )

      setAccum(Math.floor(Date.now() - start_time) / 16.666666)
      stop_time = Date.now()
    }, 16.666666)

  }


  const start_infer = () => {
    ws = createWS("ws://localhost:8081/infer/" + model())
    ws.addEventListener("message", e => {
      const response = JSON.parse(e.data)
      setData(response.prediction)
    })
    ws.addEventListener("close", e => {
      setMode("inactive")
    })
  }

  return (
    <>
      {/*<h1 style={{position: "absolute"}}>{mode() + calibrationState()}</h1>*/}
      <Panel mode={mode} switchMode={switchMode} model={model} setNewModel={setNewModel}
             toggleModalVisibility={toggleModalVisibility}/>
      <Show when={calibrationState() === "start calibration"} fallback={<div/>}>
        <Spinner full variant="primary"/>
      </Show>
      <Scene curls={data} mode={mode} setMode={setMode}/>
      <Show when={modalVisibility() === true} fallback={<div/>}>
        <ModelModal model={model} setModel={setModel} modelList={modelList}/>
      </Show>
    </>
  );
}

export default App;
