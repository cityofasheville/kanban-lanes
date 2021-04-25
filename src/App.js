import './App.css';
import React from 'react';

function sortByName(a, b) {
  if (a.name < b.name) return -1;
  else if (a.name > b.name) return 1;
  else return 0
}

class Card extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: props.card.name,
      owner: props.card.owner,
      description: props.card.description,
      open: false
    }
    this.doit = this.doit.bind(this);
  }

// ▲: &#9650; and ▼: &#9660;
  doit() {
    this.setState((state, props) => ({
      open: !state.open
    }));
  }

  render() {
    let card = (
      <div class="card">
        <button class="button" onClick = {this.doit}><p><b>{this.state.name}</b> &nbsp;&#9660; </p></button>
      </div>
    );
    if (this.state.open) card = (
      <div class="card">
        <button class="button" onClick = {this.doit}>
          <p><b>{this.state.name}&nbsp;&#9650; </b></p>
        </button>
        <p><em>{this.state.owner}</em></p>
        <p class="desc">{this.state.description}</p>
      </div>
    )
    return card;
  }
}

class Stack extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: props.name,
      cards: props.cards
    }
  }

  render() {
    let cards = (this.state.cards.length === 0) ? <div> </div>: this.state.cards.map((card) => {
      return <Card card={card}></Card>
    });
    return <div class="stack-flex-item">
      <p textAlign="left"><em><b><u>{this.state.name}</u></b></em></p>
      {cards}
      </div>
  }
}

class Lane extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: props.name,
      stacks: (props.stacks !== undefined) ? props.stacks : []
    }
  }
  render() {
    return (
      <div textAlign="left" width="100%" class="lane">
        <b>{this.state.name}</b>
        <div class="lane-flex-container">
            {this.state.stacks.map((stack) => {
              return <Stack name = {stack.name} cards = {stack.cards}></Stack>
            })}
        </div>
      </div>
    )
  }
}

class App extends React.Component{

  constructor(props) {
    super(props);
    this.state = { 
      title: "Office of Data & Performance Projects",
      data: []
    }
  }

  componentDidMount() {
    this.getData();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            {this.state.title}
          </p>
        </header>
        {this.state.data.map((lane) => {
            return <Lane name = {lane.name} stacks = {lane.stacks}/>
          })}
      </div>
    );
  }

  getData() {
    // ID and URL the Google Spreadsheet. Make sure it is published
    var spreadsheetID = "1HMyHNExKF8xo8S6gXkqx5sTo4Rz0ez8iY4mF2XzmvXs"
    var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json";
    const stack_presets = ["In Progress", "On Hold", "Ready"];
    const lane_presets  = [];
    var data = [];
    var lanes = {};
    lane_presets.forEach(function(ln) {
      lanes[ln] = [];
    });
    fetch(url)
    .then(response => response.json())
    .then((jsonData) => {
      let arr = jsonData.feed.entry;
      arr.filter((itm) => {
        return itm.gsx$parenttask.$t === "";
      })
      .map((itm)=>{
        return {
          name: itm.gsx$name.$t,
          category: itm.gsx$sectioncolumn.$t, 
          owner: itm.gsx$assignee.$t,
          status: itm.gsx$status.$t,
          description: itm.gsx$notes.$t
        };
      })
      .forEach(function (itm) {
        if (!(itm.category in lanes)) {
          lanes[itm.category] = {};
          stack_presets.forEach(function(stk) {
            lanes[itm.category][stk] = [];
          });
        }
        if (!(itm.status in lanes[itm.category])) lanes[itm.category][itm.status] = [];
        lanes[itm.category][itm.status].push(itm);
      })

      for (let lane in lanes) {
        data.push({name: lane, stacks: lanes[lane]})
      }
      data.sort(sortByName)
      // Now set up the stacks
      data.forEach(function (lane) {
        let stacks = []
        for (let nm in lane.stacks) {
          stacks.push({name: nm, cards: lane.stacks[nm]})
        }
        stacks.sort(sortByName);
        lane.stacks = stacks;
      });
      this.setState({data});
    });
  }
}

export default App;

// 