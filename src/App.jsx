import Scene from "./Scene";
import {createEffect, createSignal, Show} from "solid-js";
import {createWS} from "@solid-primitives/websocket";
import Panel from "./Panel";
import ModelModal from "./ModelModal"

function App() {
  let id = 0

  const [data, setData] = createSignal([[0, 0, 0, 0, 0]]);
  const [mode, setMode] = createSignal("inactive")
  const [model, setModel] = createSignal(0)
  const [modalVisibility, setModalVisibility] = createSignal(false)

  let ws = null
  let switchMode = (targetMode) => {
    switch (mode()) {
      case "inactive":
        setMode(targetMode)
        break
      case "recognition":
        if (ws !== null) {
          ws.send("close")
          ws.close();
          console.log(ws);
        }
        break
      case "calibration":
        break
    }
  }

  let toggleModalVisibility = () => {
    setModalVisibility(!modalVisibility())
  }

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
    ws = createWS("ws://localhost:8081/infer/" + model)
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
      <Panel mode={mode} switchMode={switchMode} toggleModalVisibility={toggleModalVisibility}/>
      <Scene curls={data} mode={mode} setMode={setMode}/>
      <Show when={modalVisibility() === true} fallback={<div/>}>
        <ModelModal model={model} setModel={setModel}/>
      </Show>
    </>
  );
}

export default App;
