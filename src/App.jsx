import Scene from "./Scene";
import {createEffect, createSignal, on, Show} from "solid-js";
import {createWS} from "@solid-primitives/websocket";
import Panel from "./Panel";
import ModelModal from "./ModelModal"

function App() {
  let id = 0

  const [data, setData] = createSignal([[0, 0, 0, 0, 0]]);
  const [mode, setMode] = createSignal("inactive")
  const [model, setModel] = createSignal(0)
  const [modalVisibility, setModalVisibility] = createSignal(false)

  let toggleModalVisibility = () => {
    setModalVisibility(!modalVisibility())
  }

  createEffect(() => {
    console.log(mode());
    switch (mode()) {
      case "recognition":
        infer_connect()
        break
      case "calibration":
        // calibrate_connect()
        start_calibration()
        break
    }
  })

  // TOOD: post start&end request
  const start_calibration = () => {
    let accum = 0
    let intervalFunc = setInterval(() => {
      let finger = Math.floor(accum / 300)
      let fp = (accum / 300) - finger
      console.log(finger, fp)
      let pos = 0
      if (fp > 0.9) {
        pos = (1 - fp) * 160
      } else if (fp > 0.5) {
        pos = 16
      } else if (fp > 0.4) {
        pos = (fp - 0.4) * 160
      }
      switch (finger) {
        case 0:
          setData([[pos, 0, 0, 0, 0]])
          break
        case 1 :
          setData([[0, pos, 0, 0, 0]])
          break
        case 2 :
          setData([[0, 0, pos, 0, 0]])
          break
        case 3:
          setData([[0, 0, 0, pos, 0]])
          break
        case 4 :
          setData([[0, 0, 0, 0, pos]])
          break
        case 5 :
          setData([[pos, pos, pos, pos, pos]])
          break
        default :
          return
      }
      ++accum
    }, 16)
    if (accum > 1800) {
      console.log("fuck");
      clearInterval(intervalFunc)
    }
  }

  const start_infer = () => {
    const ws = createWS("ws://localhost:8081/infer/" + model)
    createEffect(on(ws.message, msg => {
      const response = JSON.parse(msg.data)
      setData(response.prediction)
    }))
    createEffect(on(ws.close, msg => {
        console.log(msg)
        setMode("inactive")
      },
    ))
  }

  return (
    <>
      <Panel mode={mode} setMode={setMode} toggleModalVisibility={toggleModalVisibility}/>
      <Scene curls={data} mode={mode} setMode={setMode}/>
      <Show when={modalVisibility() === true} fallback={<div/>}>
        <ModelModal model={model} setModel={setModel}/>
      </Show>
    </>
  );
}

export default App;
