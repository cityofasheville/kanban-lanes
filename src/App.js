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
    this.toggleCardOpen = this.toggleCardOpen.bind(this);
  }

// ▲: &#9650; and ▼: &#9660;
toggleCardOpen() {
    this.setState((state, props) => ({
      open: !state.open
    }));
  }

  render() {
    let cardDetailClass = 'hide-me';
    let asciiArrowClass = 'expand';
    if (this.state.open) {
      cardDetailClass = '';
      asciiArrowClass = 'collapse';
    }
    // let card = (
    //   <div class="card">
    //     <button className="button" onClick = {this.toggleCardOpen}><p><b>{this.state.name}</b> &nbsp;&#9660; </p></button>
    //   </div>
    // );
    // if (this.state.open) {

    // }
    let card = (
      <div className="card">
        <button className="button" onClick = {this.toggleCardOpen}>
          <p><b>{this.state.name}</b> {this.state.open ? (<i class="expand-collapse fas fa-chevron-up fa-2x"></i>) : (<i class="expand-collapse fas fa-chevron-down fa-2x"></i>)}</p>
        </button>
        <div className={cardDetailClass}>
          <p><em>{this.state.owner}</em></p>
          <p className="desc">{this.state.description}</p>
        </div>
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
    let cards = (this.state.cards.length === 0) ? <div> </div>: this.state.cards.map((card, i) => {
      return <Card card={card} key ={i}></Card>
    });
    return <div className="col px-0 border">
      <p><em><b><u>{this.state.name}</u></b></em></p>
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
      <div width="100%" className="lane">
        <b>{this.state.name}</b>
        <div className="container-fluid">
          <div className="row">
            {this.state.stacks.map((stack, i) => {
              return <Stack name = {stack.name} cards = {stack.cards} key={i}></Stack>
            })}
          </div>
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
        {this.state.data.map((lane, i) => {
            return <Lane name = {lane.name} stacks = {lane.stacks} key={i} />
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