import Scene from "./Scene";
import {createEffect, createSignal, Show} from "solid-js";
import {createWS} from "@solid-primitives/websocket";
import Panel from "./Panel";
import ModelModal from "./ModelModal"

function App() {
  let id = 0

  const [data, setData] = createSignal([[0, 0, 0, 0, 0]]);
  const [mode, setMode] = createSignal("inactive")
  const [model, setModel] = createSignal("base")
  const [modelList, setModelList] = createSignal([])
  const [modalVisibility, setModalVisibility] = createSignal(false)
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
    }
  })

  // TOOD: post start&end request
  const start_calibration = () => {
    // ws = createWS("ws://localhost:8081/calibration/" + model) TODO
    ws = createWS("ws://localhost:8081/calibration/all")
    ws.addEventListener("message", e => {
      const response = JSON.parse(e.data)
      console.log(response);
      setCalibrationState(response.action)
    })
    ws.addEventListener("close", e => {
      setCalibrationState("")
      setMode("inactive")
    })

    // TODO: make this a signal so that can be set by the user
    let gestures = [
      [16, 0, 0, 0, 0],
      [0, 16, 0, 0, 0],
      [0, 0, 16, 0, 0],
      [0, 0, 0, 16, 0],
      [0, 0, 0, 0, 16],
      [16, 16, 16, 16, 16],
      [16, 0, 0, 16, 16],
    ]


    createEffect(() => {
      // console.log(accum())
      if (accum() >= gestures.length * 5 * 60) {
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

      setData([gestures[section].map(element => pos * element)])

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
      <h1 style={{position: "absolute"}}>{mode() + calibrationState()}</h1>
      <Panel mode={mode} switchMode={switchMode} toggleModalVisibility={toggleModalVisibility}/>
      <Scene curls={data} mode={mode} setMode={setMode}/>
      <Show when={modalVisibility() === true} fallback={<div/>}>
        <ModelModal model={model} setModel={setModel} modelList={modelList}/>
      </Show>
    </>
  );
}

export default App;
