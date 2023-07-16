import "./modelmodal.css"
import "@papanasi/solid/papanasi.css"
import {For, Show} from "solid-js";
import {Row} from "@papanasi/solid";

function ListElement(props) {
  return <>
    <Row basic="content">
      <div style="margin: 8px auto 8px 8px; padding: 6.4px 16px 6.4px 0">
        Model {props.item}
      </div>
      <Show when={props.item === props.model()} fallback={
        <button onClick={() => props.setModel(props.item)}
                className="pa-button pa-button--primary pa-button--outline">Select</button>
      }>
        <button className="pa-button pa-button--primary">Select</button>
      </Show>
    </Row>
  </>
}

export default function ModelModal(props) {

  return <div className="modal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div className="modal-dialog">
      <div className="modal-content" style="overflow-y: scroll; max-height:85%;">
        <div className="modal-header">
          <h3 className="modal-title">Select model</h3>
        </div>
        <hr style="color: #dadada; margin: 8px"/>
        <div className="modal-body">
          <For each={props.modelList()}>
            {(item, index) => <ListElement item={item} index={index} model={props.model} setModel={props.setModel}/>}
          </For>
        </div>
      </div>
    </div>
  </div>
}