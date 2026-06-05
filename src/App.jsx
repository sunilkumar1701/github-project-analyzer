import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div
        style={{
          padding: "20px",
          color: "white"
        }}
      >
        <h2>GitHub Talent Analyzer 🚀</h2>

        <p>
          GitHub profile detected.
        </p>

        <p>
          Developer analysis will appear here.
        </p>

        <button
          type="button"
          className="counter"
          onClick={() => setCount(count + 1)}
        >
          Count is {count}
        </button>
      </div>
    </>
  );
}

export default App;