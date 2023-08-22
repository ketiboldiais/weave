import { engine, Group, group, line } from "./io.js";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type EnhancedTextAreaProps = {
  onTextChange?: (text: string) => void;
  className?: string;
  spellCheck?: boolean;
  tabSize?: number;
  init: string;
  height: string | number;
};

type EnhancedTextAreaRefs = {
  getCodeContent: () => string;
};

const IDE = forwardRef<
  EnhancedTextAreaRefs,
  EnhancedTextAreaProps
>(({
  onTextChange = undefined,
  className = undefined,
  tabSize = 4,
  init,
  height,
  spellCheck = false,
}: EnhancedTextAreaProps, ref) => {
  const [text, setText] = useState(init);
  const [stateSelectionStart, setStateSelectionStart] = useState(0);
  const [stateSelectionEnd, setStateSelectionEnd] = useState(0);

  const txtInput = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    getCodeContent: () => text,
  }));

  useEffect(() => {
    const textArea = txtInput.current;

    if (!textArea) {
      return;
    }

    if (stateSelectionStart >= 0) {
      textArea.selectionStart = stateSelectionStart;
    }

    if (stateSelectionEnd >= 0) {
      textArea.selectionEnd = stateSelectionEnd;
    }
  }, [text, stateSelectionStart, stateSelectionEnd]);

  async function handleCodeChange(
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ): Promise<void> {
    const text = e.target.value;

    setText(text);

    if (onTextChange) {
      onTextChange(text);
    }
  }

  async function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ): Promise<void> {
    const textArea = e.target as HTMLTextAreaElement;

    const tabString = " ".repeat(tabSize);

    const value = textArea.value;
    const selectionStart = textArea.selectionStart;
    const selectionEnd = textArea.selectionEnd;

    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();

      if (selectionStart !== selectionEnd) {
        const slices1 = getNewLineSlices(value, selectionStart, selectionEnd);
        const newValue1 = addTabs(value, slices1, tabString);

        setText(newValue1);
        setStateSelectionStart(selectionStart + tabSize);
        setStateSelectionEnd(selectionEnd + (newValue1.length - value.length));
      } else {
        const newValue2 = value.substring(0, selectionStart) + tabString +
          value.substring(selectionEnd);

        setText(newValue2);
        setStateSelectionStart(
          selectionEnd + tabSize - (selectionEnd - selectionStart),
        );
        setStateSelectionEnd(
          selectionEnd + tabSize - (selectionEnd - selectionStart),
        );
      }
    } else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();

      const slices2 = getNewLineSlices(value, selectionStart, selectionEnd);
      const newValue3 = removeTabs(value, slices2, tabSize);

      const diff = value.length - newValue3.length;

      setText(newValue3);
      setStateSelectionStart(
        Math.max(0, selectionStart - (diff ? tabSize : 0)),
      );
      setStateSelectionEnd(Math.max(0, selectionEnd - diff));
    } else {
      setStateSelectionStart(-1);
      setStateSelectionEnd(-1);
    }
  }

  function getNewLineSlices(
    value: string,
    selectionStart: number,
    selectionEnd: number,
  ): Array<string | null> {
    const newLineLocations = getAllIndices(value, "\n");
    const left = findRange(newLineLocations, selectionStart);
    const split = value.split("\n");

    const arr = [];
    let count = 0;
    for (let i = 0; i < split.length; i++) {
      const line = split[i];

      if (count > left && count <= selectionEnd) {
        arr.push(line);
      } else {
        arr.push(null);
      }

      count += line.length + 1;
    }

    return arr;
  }

  function addTabs(
    value: string,
    arr: Array<string | null>,
    joiner: string,
  ): string {
    const split = value.split("\n");

    let ret = "";
    for (let i = 0; i < split.length; i++) {
      const val = split[i];
      const newLineVal = arr[i];

      if (newLineVal === val) {
        ret += joiner;
      }

      ret += val;
      if (i !== split.length - 1) {
        ret += "\n";
      }
    }

    return ret;
  }

  function removeTabs(
    value: string,
    arr: Array<string | null>,
    tabSize: number,
  ): string {
    const split = value.split("\n");

    let ret = "";
    for (let i = 0; i < split.length; i++) {
      const val = split[i];
      const newLineVal = arr[i];

      if (!val.startsWith(" ") || newLineVal !== val) {
        ret += val;
        if (i !== split.length - 1) {
          ret += "\n";
        }

        continue;
      }

      let count = 1;
      while (val[count] === " " && count < tabSize) {
        count++;
      }

      ret += val.substring(count);
      if (i !== split.length - 1) {
        ret += "\n";
      }
    }

    return ret;
  }

  function getAllIndices(arr: string, val: string): Array<number> {
    const indices = [];
    let i = -1;

    while ((i = arr.indexOf(val, i + 1)) !== -1) {
      indices.push(i);
    }

    return indices;
  }

  function findRange(arr: Array<number>, min: number): number {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] >= min) {
        return i === 0 ? -1 : arr[i - 1];
      }
    }

    return arr[arr.length - 1];
  }

  return (
    <textarea
      ref={txtInput}
      value={text}
      onKeyDown={handleKeyDown}
      onChange={handleCodeChange}
      className={className}
      spellCheck={spellCheck}
      style={{ height }}
    />
  );
});

export const F1 = () => {
  const g = group([
    line([0, 0], [200, 200]),
  ])
  return <Figure g={g} />;
};

export const Figure = ({ g }: { g: Group }) => {
  const width = g.ctx._width;
  const height = g.ctx._height;
  const viewbox = `0 0 ${width} ${height}`;
  const paddingBottom = `${100 * (height / width)}%`;
  const boxcss = {
    display: "inline-block",
    position: "relative",
    width: "100%",
    paddingBottom,
    overflow: "hidden",
  } as const;
  const svgcss = {
    display: "inline-block",
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
  } as const;
  const par = "xMidYMid meet";
  return (
    <div style={boxcss}>
      <svg viewBox={viewbox} preserveAspectRatio={par} style={svgcss}>
        <path stroke={"black"} d={g.render()} />
      </svg>
    </div>
  );
};

export const Terminal = (
  { source, height = "fit-content" }: {
    source: string;
    height: string | number;
  },
) => {
  const [result, setResult] = useState("");
  const [code, setCode] = useState(source.trimStart().trimEnd());
  const click = () => {
    const logs = engine(code).log().join("\n");
    setResult(logs);
  };
  return (
    <div>
      <div>
        <IDE
          init={code}
          tabSize={2}
          onTextChange={(e) => setCode(e)}
          height={height}
        />
        {/* <textarea style={{ height }} value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} /> */}
      </div>
      {result && <pre className={"terminal"}>{result}</pre>}
      <div>
        <button className={"run-button"} onClick={click}>Run</button>
      </div>
    </div>
  );
};
