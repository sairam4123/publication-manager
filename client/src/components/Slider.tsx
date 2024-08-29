import { useCallback, useEffect, useRef } from "react";

export default function Slider({
  values,
  setValues,
  maxValue,
  minValue,
}: {
  values: number[];
  setValues: (value: number[]) => void;
  maxValue: number;
  minValue: number;
}) {
  const progressRef = useRef<HTMLDivElement>(null);
  const toProgress = useCallback((value: number) => Math.round((value - minValue) / (maxValue - minValue) * 100), [maxValue, minValue]);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${toProgress(values[1]) - toProgress(values[0])}%`;
      progressRef.current.style.left = `${toProgress(values[0])}%`;
    }
    if (values[0] > values[1]) {
      setValues([values[1], values[0]]);
    }

  });

  return (
    <div className="flex w-2/3 rounded-full">
      <p className="w-4 p-4">{values[0]}</p>
      <div className="relative bg-neutral-500 dark:bg-neutral-900 w-full h-3 rounded-full">
        <div ref={progressRef} className="absolute h-full bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        <span>
          <input
            type="range"
            min={minValue}
            max={maxValue}
            value={values[0]}
            onChange={(e) => {
              e.preventDefault();
               setValues([parseInt(e.target.value), values[1]])}}
            style={{ background: "none" }}
            className="absolute outline-none w-full h-full rounded-full appearance-none pointer-events-none slider-thumb"
          />
        </span>
        <span>
          <input
            type="range"
            min={minValue}
            max={maxValue}
            value={values[1]}
            onChange={(e) => {
              e.preventDefault();
               setValues([values[0], parseInt(e.target.value)])}}
            style={{ background: "none" }}
            className="absolute outline-none w-full h-full rounded-full appearance-none pointer-events-none slider-thumb"
          />
        </span>
      </div>
      <p className="w-4 p-4">{values[1]}</p>
    </div>
  );
}
