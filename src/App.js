import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const currencyList = ["USD", "JPY", "CAD", "GBP", "EUR", "CHF"];
  const [base, setBase] = useState(currencyList[0]);
  const [currentValue, setCurrentValue] = useState("");
  const [target, setTarget] = useState(currencyList[1]);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  function onBaseChange(newValue) {
    setBase(newValue);
  }
  function onValueChange(newValue) {
    if (Number(newValue) || newValue === "") {
      setCurrentValue(newValue);
    }
    return;
  }
  useEffect(
    function () {
      const contrtoller = new AbortController();
      async function checkExchange() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `https://api.frankfurter.app/latest?amount=${currentValue}&from=${base}&to=${target}`,
            { signal: contrtoller.signal }
          );
          const data = await res.json();
          setResult(data.rates);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (Number(currentValue) || currentValue !== "") {
        checkExchange();
      }
      return function () {
        contrtoller.abort();
      };
    },
    [currentValue, base, target]
  );
  useEffect(
    function () {
      document.title = `${base} to ${target}`;
    },
    [base, target]
  );
  function onTargetChange(newValue) {
    setTarget(newValue);
  }
  return (
    <div className="app">
      <p className="clear" draggable="true" onClick={() => setCurrentValue("")}>
        &times;
      </p>
      <p draggable="true" className="mainTitle">
        Currency Converter
      </p>
      <div className="conversion">
        <BaseCurrency
          currencyList={currencyList.filter((currency) => currency !== target)}
          base={base}
          onBaseChange={onBaseChange}
          isLoading={isLoading}
        />
        <UserInput
          currentValue={currentValue}
          onValueChange={onValueChange}
          isLoading={isLoading}
        />
        <TargetCurrency
          currencyList={currencyList.filter((currency) => currency !== base)}
          target={target}
          onTargetChange={onTargetChange}
          isLoading={isLoading}
        />
      </div>
      <Output
        result={result}
        target={target}
        currentValue={currentValue}
        isLoading={isLoading}
      />
    </div>
  );
}

function BaseCurrency({ currencyList, base, onBaseChange, isLoading }) {
  return (
    <div>
      <select
        disabled={isLoading}
        value={base}
        onChange={(e) => onBaseChange(e.target.value)}
      >
        {currencyList.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}

function TargetCurrency({ currencyList, target, onTargetChange, isLoading }) {
  return (
    <div>
      <select
        disabled={isLoading}
        onChange={(e) => onTargetChange(e.target.value)}
        value={target}
      >
        {currencyList.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}

function UserInput({ currentValue, onValueChange, isLoading }) {
  return (
    <div>
      <input
        type="text"
        value={currentValue}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Amount.."
      ></input>
    </div>
  );
}

function Output({ result, target, currentValue, isLoading }) {
  return (
    <div className="result">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        currentValue.length > 0 && <p>{result[target]}</p>
      )}
      <p className="resultCurrency">{target}</p>
    </div>
  );
}
