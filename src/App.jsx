import Scene from "./Scene";
import {createEffect, createSignal, Show} from "solid-js";
import createWebsocket from "@solid-primitives/websocket";
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
    console.log(model())
  })

  createEffect(() => {
    console.log(mode());
    switch (mode()) {
      case "recognition":
        infer_connect()
        break
      case "calibration":
        calibrate_connect()
        break
    }
  })

  const [infer_connect, infer_disconnect] = createWebsocket(
    "ws://localhost:8081/infer/" + model,
    (msg) => {
      const response = JSON.parse(msg.data)
      setData(response.prediction)
    },
    (msg) => {
      console.log(msg)
      setMode("inactive")
    },
    [],
    5,
    5000
  );

  const [calibrate_connect, calibrate_disconnect, send, state] = createWebsocket(
    "ws://localhost:8081/calibrate/" + model,
    (msg) => {
      const response = JSON.parse(msg.data)
      setData(response.prediction)
    },
    (msg) => {
      console.log(msg)
      setMode("inactive")
    },
    [],
    5,
    5000
  );


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
