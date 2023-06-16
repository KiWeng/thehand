import Scene from "./Scene";
import {createSignal} from "solid-js";
import {createWS} from "@solid-primitives/websocket";

// const example_data = {
//   "action": "sent",
//   "prediction": [[3.8975167274475098, 7.749725341796875, 6.8757524490356445, 6.921577453613281, 7.2840256690979]]
// }

function App() {
  let id = 0

  const [data, setData] = createSignal([]);
  const ws = createWS("ws://localhost:8081/infer/" + id)
  ws.addEventListener("message", (ev) => {
    const response = JSON.parse(ev.data)
    setData(response.prediction)
  });


  return (
    <Scene curls={data}/>
  );
}

export default App;
