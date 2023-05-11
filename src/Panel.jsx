import {Column, Row} from "@papanasi/solid";
import "@papanasi/solid/papanasi.css"
import "./button.css"

function Panel(props) {
  let switchMode = (mode) => {
    if (props.mode() === "inactive") {
      props.setMode(mode)
    }
  }

  return <>
    <Row basic="content">
      <Column basic="fill">
        <button variant="primary" onClick={() => switchMode("calibration")}>Start calibration</button>
      </Column>
      <Column basic="fill">
        <button variant="secondary">Select model</button>
      </Column>
      <Column basic="fill">
        <button variant="tertiary" onClick={() => switchMode('recognition')}>Start Recognition</button>
      </Column>
    </Row>
  </>
}

export default Panel;