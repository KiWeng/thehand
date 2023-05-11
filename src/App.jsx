import Scene from "./Scene";
import {createEffect, createSignal} from "solid-js";
import createWebsocket from "@solid-primitives/websocket";
import Panel from "./Panel";

function App() {
  let id = 0

  const [data, setData] = createSignal([[0, 0, 0, 0, 0]]);
  const [mode, setMode] = createSignal("inactive")
  const [model, setModel] = createSignal(0)


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
      <Panel mode={mode} setMode={setMode}/>
      <Scene curls={data} mode={mode} setMode={setMode}/>
    </>
  );
}

export default App;
