import Scene from "./Scene";
import {createSignal} from "solid-js";
import createWebsocket from "@solid-primitives/websocket";

const example_data = {
  "action": "sent",
  "prediction": [[3.8975167274475098, 7.749725341796875, 6.8757524490356445, 6.921577453613281, 7.2840256690979]]
}

function App() {
  let id = 0

  const [data, setData] = createSignal([]);
  const [connect, disconnect, send, state] = createWebsocket(
    "ws://localhost:8081/infer/" + id,
    (msg) => {
      const response = JSON.parse(msg.data)
      setData(response.prediction)
    },
    (msg) => console.log(msg),
    [],
    5,
    5000
  );

  connect()

  return (
    <Scene curls={data}/>
  );
}

export default App;
