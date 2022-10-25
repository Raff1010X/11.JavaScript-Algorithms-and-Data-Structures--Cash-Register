const initialState = {
  price: 19.5,
  cash: 20,
  cid: [
    ["PENNY", 1.01],
    ["NICKEL", 2.05],
    ["DIME", 3.1],
    ["QUARTER", 4.25],
    ["ONE", 90],
    ["FIVE", 55],
    ["TEN", 20],
    ["TWENTY", 60],
    ["ONE HUNDRED", 100]
  ],
  output: { status: "OPEN", change: [["QUARTER", 0.5]] },
  values: [0.01, 0.05, 0.1, 0.25, 1, 5, 10, 20, 100]
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.onInputChange = this.onInputChange.bind(this);
    this.checkCashRegister = this.checkCashRegister.bind(this);
    this.onCalculate = this.onCalculate.bind(this);
  }

  checkCashRegister(price, cash, cid) {
    const tempCid = JSON.parse(JSON.stringify(cid));
    let change = cash - price;
    let cidSum = cid
      .map((el) => el[1])
      .reduce((a, b) => a + b)
      .toFixed(2);
    if (cidSum < change) {
      return { status: "INSUFFICIENT_FUNDS", change: [] };
    }
    if (cidSum == change) {
      return { status: "CLOSED", change: cid };
    }
    let val = this.state.values;
    let numOf = [];
    for (let i = 0; i <= 8; i++) numOf[i] = parseInt(cid[i][1] / val[i]);
    let fac = 0;
    let take = 0.0;
    let retArr = [];
    for (let i = 8; i >= 0; i--) {
      if (val[i] <= change) {
        fac = Math.floor(change / val[i]);
        if (fac > 0) {
          if (fac > numOf[i]) fac = numOf[i];
          take = Number((fac * val[i]).toFixed(2));
          change = Number((change - take).toFixed(2));
          cid[i][1] = Number((cid[i][1] - take).toFixed(2));
          if (take > 0) retArr.push([cid[i][0], fac * val[i]]);
        }
      }
    }
    if (change >= 0.01) {
      this.setState({
        cid: JSON.parse(JSON.stringify(tempCid))
      });
      return { status: "INSUFFICIENT_FUNDS", change: [] };
    }
    return { status: "OPEN", change: retArr };
  }

  onInputChange(e) {
    if (e.target.dataset.index) {
      let cid = [...this.state.cid];
      cid[e.target.dataset.index][1] = parseFloat(e.target.value);
      this.setState({
        cid: cid
      });
      return;
    }

    if (e.target.id === "input-price") {
      this.setState({
        price: e.target.value
      });
      return;
    }

    if (e.target.id === "input-cash") {
      this.setState({
        cash: e.target.value
      });
    }
  }

  onCalculate() {
    this.setState((state) => ({
      output: this.checkCashRegister(state.price, state.cash, state.cid)
    }));
  }

  render() {
    return (
      <div id="cashregister">
        <h1>Cash Register</h1>
        <Price
          price={this.state.price}
          onInputChange={this.onInputChange}
          handleKeyPress={this.handleKeyPress}
        />
        <Cash
          cash={this.state.cash}
          onInputChange={this.onInputChange}
          handleKeyPress={this.handleKeyPress}
        />
        <Cid
          cid={this.state.cid}
          values={this.state.values}
          onInputChange={this.onInputChange}
        />
        <Calculate onCalculate={this.onCalculate} />
        <Output
          output={this.state.output}
          cid={this.state.cid}
          handleChange={this.onInputChange}
        />
      </div>
    );
  }
}

const Price = (props) => {
  return (
    <div id="price">
      Price:
      <br />
      <input
        id="input-price"
        type="number"
        value={props.price}
        step="0.01"
        onChange={props.onInputChange}
      ></input>
    </div>
  );
};

const Cash = (props) => {
  return (
    <div id="cash">
      Cash:
      <br />
      <input
        id="input-cash"
        type="number"
        value={props.cash}
        step="0.01"
        onChange={props.onInputChange}
      ></input>
    </div>
  );
};

const Cid = (props) => {
  const values = props.values;

  const drawer = props.cid.map((el, i) => {
    return (
      <div className="cid">
        <label for={el[0]}> {el[0]} </label>
        <br />
        <input
          id={el[0]}
          data-index={i}
          type="number"
          value={el[1]}
          min="0"
          step={values[i]}
          onChange={props.onInputChange}
        />
      </div>
    );
  });

  return <div id="cid">Cash in drawer: {drawer}</div>;
};

const Calculate = (props) => {
  return (
    <button id="calculate" onClick={props.onCalculate}>
      Calculate
    </button>
  );
};

const Output = (props) => {
  const sumOfCid = Number(
    props.cid
      .map((el) => el[1])
      .reduce((prev, curr) => {
        return prev + curr;
      })
      .toFixed(2)
  );
  const change = props.output.change.map((el, index, arr) => {
    return (
      <p>
        {" "}
        {arr[index][0]}: {arr[index][1]}
      </p>
    );
  });
  const noChange = <p>No change</p>;
  const showChange = (
    <p>
      Change: <br /> {change}
    </p>
  );
  return (
    <p id="output">
      {/*Cash in drawer: {sumOfCid}$
    <br/> **/}
      Status: {props.output.status}
      <br />
      {change.length === 0 ? noChange : showChange}
    </p>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
