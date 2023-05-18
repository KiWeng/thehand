import {Column, Row} from "@papanasi/solid";
import "@papanasi/solid/papanasi.css"
import "./button.css"

function Panel(props) {
  let switchMode = (mode) => {
    if (props.mode() === "inactive") {
      props.setMode(mode)
    }
  }

  return <div className="panel-wrapper">
    <div className="panel pa-container pa-container--fluid ">
      <Row basic="content">
        <Column basic="fill">
          <button onClick={() => switchMode("calibration")} className="pa-button--primary pa-button panel-button">Start
            calibration
          </button>
        </Column>
        <Column basic="fill">
          <button onClick={() => props.toggleModalVisibility()}
                  className="pa-button--secondary pa-button panel-button">Select model
          </button>
        </Column>
        <Column basic="fill">
          <button onClick={() => switchMode('recognition')} className="pa-button--tertiary pa-button panel-button">Start
            Recognition
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