import { useState } from "react";
import { engine } from "./io.js";

export const Terminal = ({ source }: { source: string }) => {
  const [result, setResult] = useState("");
  const [code, setCode] = useState(source);
  const click = () => {
    const logs = engine(code).log();
    const result = logs.join("\n");
    setResult(result);
  };
  return (
    <div>
      <div>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} />
      </div>
      {result && <pre className={"terminal"}>{result}</pre>}
      <div>
        <button className={"run-button"} onClick={click}>Run</button>
      </div>
    </div>
  );
};
