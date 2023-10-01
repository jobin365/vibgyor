import "./styles.css";
import Grid from "./Grid.js";
import { useState } from "react";
import successKid from "./SuccessKid.jpg";

export default function App() {
  const [vibgyor, setVibgyor] = useState(false);

  return (
    <div className="App">
      <Grid noOfBlocks={7} blocksInRow={3} setVibgyor={setVibgyor}/>
      <br/>
      {vibgyor&&<img src={successKid} alt="Success Kid"/>}
    </div>
  );
}
