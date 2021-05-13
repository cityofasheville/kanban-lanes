import './App.css';
import React from 'react';

let sort_order = [];

var laneDimensions = {
  category: {
    presets: ["Projects & Initiatives", "External Engagement & Communication", "Internal Communication & Training", "Data Management & Governance"]
  },
  priority: {
    presets: ["High", "Medium", "Low", "Ongoing"]
  },
  lead: {
    presets: ["Natalie Bailey", "Cameron Henshaw", "Eric Jackson"]
  }
};

function sortByName (a, b) {
  if (sort_order.length === 0) {
    if (a.name < b.name) return -1;
    else if (a.name > b.name) return 1;
    else return 0;
  }
  let a_n = sort_order.indexOf(a.name);
  let b_n = sort_order.indexOf(b.name);
  a_n = a_n < 0 ? a_n + 100 : a_n;
  b_n = b_n < 0 ? b_n + 100 : b_n;
  return a_n - b_n;
};

var prioritySortOrder = ["High", "Medium", "Low", "None"];

function sortByPriority (a, b) {
  let a_n = prioritySortOrder.indexOf(a.priority);
  let b_n = prioritySortOrder.indexOf(b.priority);
  a_n = a_n < 0 ? a_n + 100 : a_n;
  b_n = b_n < 0 ? b_n + 100 : b_n;
  return a_n - b_n;
};


class Card extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: props.card.name,
      lead: props.card.lead,
      description: props.card.description,
      priority: props.card.priority,
      open: false
    }
    this.toggleCardOpen = this.toggleCardOpen.bind(this);
  }

  toggleCardOpen(e) {
    e.preventDefault();
    this.setState((state, props) => ({
        open: !state.open
      })
    );
  }

  render() {
    let cardDetailClass = 'm-3 text-break hide-me';
    let asciiArrowClass = 'expand';
    if (this.state.open) {
      cardDetailClass = 'm-3 text-break';
      asciiArrowClass = 'collapse';
    }
    if (this.state.name === 'Dummy') return (<div>&nbsp;</div>); // Empty column placeholder
    let card = (
      <div className="card my-3">
        <button className="card-header coa-bg-header" onClick = {this.toggleCardOpen}>
          <h4 className=" lighter">{this.state.name}</h4> <span className="expand-collapse">{this.state.open ? (<i className="fas fa-folder-open"></i>) : (<i className="fas fa-folder"></i>)}</span>
        </button>
        <div className={cardDetailClass}>
          <div style={{marginBottom: "10px"}}>
            <span>
              Lead: {this.state.lead}
            </span><br/>
            <span>
              Priority: {this.state.priority}
            </span>
          </div>
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
    return (
      <div className="col-md px-3 py-4 border">
        <h3 className="pb-2 lighter coa-underline">{this.state.name}</h3>
        {cards}
      </div>
    )
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
      <div width="100%" className="lane mx-2 my-5">
        <h2 className="p-3 mb-0 lighter">{this.state.name}</h2>
        <div className="container-fluid">
          <div className="row">
            {this.state.stacks.map((stack, i) => {
              return <Stack name = {stack.name} cards = {stack.cards} key={stack.name + i}></Stack>
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
      showHeader: true,
      laneDimension: 'category',
      rawData: [],
      data: []
    }
    this.setViewBy = this.setViewBy.bind(this);
  }

  componentDidMount() {
    let showHeader = true;
    if (window.location.search.includes('noheader=true')) showHeader = false;
    this.setState({ showHeader: false });
    this.getData();
  }

  setViewBy(e) {
    //e.preventDefault();
    this.setState({
      laneDimension: e.target.value,
      data: this.prepData(this.state.rawData, e.target.value)
    });
  }

  prepData(rawData, laneDimension) {
    const lane_presets  = laneDimensions[laneDimension].presets;
    const stack_presets = ["Ready", "In Progress", "On Hold"];
    let data = [];
    let lanes = {};
    lane_presets.forEach(function(ln) {
      lanes[ln] = [];
      stack_presets.forEach(function(stk) { // Set up empty stacks
        lanes[ln][stk] = [];
      });
    });

    // Sort raw data into lanes by lane dimension
    rawData.forEach(function (itm) {
      if (!(itm[laneDimension] in lanes)) {
        lanes[itm[laneDimension]] = {};
        stack_presets.forEach(function(stk) { // Set up empty stacks
          lanes[itm[laneDimension]][stk] = [];
        });
      }
      if (!(itm.status in lanes[itm[laneDimension]])) lanes[itm[laneDimension]][itm.status] = [];
      lanes[itm[laneDimension]][itm.status].push(itm);
    })

    for (let lane in lanes) {
      data.push({name: lane, stacks: lanes[lane]})
    }

    sort_order = lane_presets;
    data.sort(sortByName)

    data.forEach(function (lane) {
      let stacks = []
      for (let nm in lane.stacks) {
        let cards = lane.stacks[nm].sort(sortByPriority);
        if (cards.length === 0) { // Add a dummy to preserve stack alignment
          cards = [{
            name: "Dummy", category: "", priority: "None", lead: "Unknown",
            status: nm, description: ""
          }];
        }
        stacks.push({name: nm, cards: cards});
      }
      sort_order = stack_presets;
      stacks.sort(sortByName);
      lane.stacks = stacks;
    });
    return data;
  }

  getData() {
    // ID and URL the Google Spreadsheet. Make sure it is published
    var spreadsheetID = "1HMyHNExKF8xo8S6gXkqx5sTo4Rz0ez8iY4mF2XzmvXs"
    var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json";

    let rawData = null;
    fetch(url)
    .then(response => response.json())
    .then((jsonData) => {
      rawData = jsonData.feed.entry
      .filter((itm) => {
        return (itm.gsx$parenttask.$t === "" &&
                itm.gsx$completedat.$t === "");
      })
      .map((itm)=>{
        return {
          name: itm.gsx$name.$t,
          category: itm.gsx$sectioncolumn.$t,
          priority: (itm.gsx$importance.$t === "") ? "None" : itm.gsx$importance.$t,
          lead: (itm.gsx$assignee.$t === "") ? "Unknown" : itm.gsx$assignee.$t,
          status: itm.gsx$status.$t,
          description: itm.gsx$notes.$t
        };
      });
      let data = this.prepData(rawData, this.state.laneDimension);

      this.setState({data, rawData});
    });
  }

  render() {
    const header = this.state.showHeader?(
      <header className="navbar p-3 coa-bg-header">
      <img src="/coa-logo.png" height="125" className="header-image align-top" alt="Logo for City of Asheville, North Carolina" />
      <h1 className="navbar-text lighter">
        {this.state.title}
      </h1>
    </header>
    ) : ' ';
    return (
      <div className="App">
        {header}
        <form className="view-by">
          <span style={{marginRight: "1em"}}><b>View By</b></span>
            <div className="form-check form-check-inline">
              <label className="form-check-label">
                <input
                  type="radio"
                  name="react-tips"
                  value="category"
                  checked={this.state.laneDimension === 'category'}
                  onChange={this.setViewBy}
                  className="form-check-input"
                />
                <b>Category</b>
              </label>
            </div>
            <div className="form-check form-check-inline">
              <label className="form-check-label">
              <input
                type="radio"
                name="react-tips"
                value="priority"
                checked={this.state.laneDimension === 'priority'}
                onChange={this.setViewBy}
                className="form-check-input"
              />
              <b>Priority</b>
            </label>
            </div>
            <div className="form-check form-check-inline">
            <label className="form-check-label">
              <input
                type="radio"
                name="react-tips"
                value="lead"
                checked={this.state.laneDimension === 'lead'}
                onChange={this.setViewBy}
                className="form-check-input"
              />
              <b>Lead</b>
            </label>
            </div>
        </form>

        {this.state.data.map((lane, i) => {
            return <Lane name = {lane.name} stacks = {lane.stacks} key={lane.name + i} />
          })}
      </div>
    );
  }
}

export default App;
