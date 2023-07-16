import {Column, Row} from "@papanasi/solid";
import "@papanasi/solid/papanasi.css"
import "./button.css"

function Panel(props) {
  return <div className="panel-wrapper">
    <div className="panel pa-container pa-container--fluid ">
      <Row basic="content">
        <Column basic="fill">
          <button onClick={() => {
            props.setNewModel(prompt("Name for the new model:", props.model()))
            props.switchMode("calibration")
          }} className={`pa-button--primary pa-button panel-button ${
            props.mode() === "recognition" ? "is-disabled" : ""
          }`}>Start Calibration
          </button>
        </Column>
        <Column basic="fill">
          <button onClick={() => props.toggleModalVisibility()}
                  className={`pa-button--secondary pa-button panel-button ${
                    props.mode() === "inactive" ? "" : "is-disabled"
                  }`}>Select Model
          </button>
        </Column>
        <Column basic="fill">
          <button onClick={() => {
            if (props.mode() === 'inactive') {
              props.switchMode('recognition')
            } else {
              props.switchMode('inactive')
            }
          }} className={`pa-button--tertiary pa-button panel-button ${
            props.mode() === "calibration" ? "is-disabled" : ""
          }`}> {props.mode() === 'recognition' ? "Stop" : "Start"} Recognition
          </button>
        </Column>
      </Row>
      {/*<Row basic="content">*/}
      {/*  <div>*/}
      {/*    <a>{props.mode()}</a>*/}
      {/*  </div>*/}
      {/*</Row>*/}
    </div>
  </div>
}

export default Panel;