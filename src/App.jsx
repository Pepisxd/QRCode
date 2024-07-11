import { useState } from "react";
import "./App.css";
import QRCode from "react-qr-code";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <QRCode value="www.google.com" />
      </div>
    </>
  );
}

export default App;
