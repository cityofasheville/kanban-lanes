import './App.css'
import React from 'react'

let sortOrder = []

var laneDimensions = {
  category: {
    presets: ['Projects & Initiatives', 'External Engagement & Communication', 'Internal Communication & Training', 'Data Management & Governance']
  },
  priority: {
    presets: ['High', 'Medium', 'Low', 'Ongoing']
  },
  lead: {
    presets: ['Natalie Bailey', 'Cameron Henshaw', 'Eric Jackson']
  },
  none: {
    presets: []
  }
}

function sortByName (a, b) {
  if (sortOrder.length === 0) {
    if (a.name < b.name) return -1
    else if (a.name > b.name) return 1
    else return 0
  }
  let aN = sortOrder.indexOf(a.name)
  let bN = sortOrder.indexOf(b.name)
  aN = aN < 0 ? aN + 100 : aN
  bN = bN < 0 ? bN + 100 : bN
  return aN - bN
};

var prioritySortOrder = ['High', 'Medium', 'Low', 'None']

function sortByPriority (a, b) {
  let aN = prioritySortOrder.indexOf(a.priority)
  let bN = prioritySortOrder.indexOf(b.priority)
  aN = aN < 0 ? aN + 100 : aN
  bN = bN < 0 ? bN + 100 : bN
  return aN - bN
};

class Card extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: props.card.name,
      lead: props.card.lead,
      description: props.card.description,
      priority: props.card.priority,
      open: false
    }
    this.handleCardOpen = this.handleCardOpen.bind(this)
  }

  handleCardOpen (e) {
    e.preventDefault()
    this.setState((state, props) => ({
      open: !state.open
    })
    )
  }

  render () {
    let cardDetailClass = 'm-3 text-break hide-me'
    // let asciiArrowClass = 'expand';
    let priorityBackgroundClass = 'priority-icon-bg '

    if (this.state.open) {
      cardDetailClass = 'm-3 text-break'
      // asciiArrowClass = 'collapse';
    }

    switch (this.state.priority) {
      case 'High':
        priorityBackgroundClass += 'bg-danger'
        break
      case 'Medium':
        priorityBackgroundClass += 'bg-warning'
        break
      case 'Low':
        priorityBackgroundClass += 'bg-info'
        break
      case 'Ongoing':
        priorityBackgroundClass += 'bg-light'
        break
      default:
        priorityBackgroundClass += ''
    }

    if (this.state.name === 'Dummy') return (<div>&nbsp;</div>) // Empty column placeholder
    const card = (
      <div className='card my-3'>
        <button className='card-header coa-bg-header' onClick={this.handleCardOpen}>
          <h4 className=' lighter'>{this.state.name}</h4> <span className='priority-text'>{this.state.priority !== 'None' ? this.state.priority : ''}</span> <span className={priorityBackgroundClass}></span> <span className='expand-collapse'>{this.state.open ? (<i className='fas fa-folder-open' />) : (<i className='fas fa-folder' />)}</span>
        </button>
        <div className={cardDetailClass}>
          <div style={{ marginBottom: '10px' }}>
            <span>
              Lead: {this.state.lead}
            </span><br />
            <span>
              Priority: {this.state.priority}
            </span>
          </div>
          <p className='desc'>{this.state.description}</p>
        </div>
      </div>
    )
    return card
  }
}

class Stack extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: props.name,
      cards: props.cards
    }
  }

  render () {
    const cards = (this.state.cards.length === 0) ? <div> </div> : this.state.cards.map((card, i) => {
      return <Card card={card} key={i} />
    })
    return (
      <div className='col-md px-3 py-4 border'>
        <h3 className='pb-2 lighter coa-underline'>{this.state.name}</h3>
        {cards}
      </div>
    )
  }
}

class Lane extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: props.name,
      stacks: (props.stacks !== undefined) ? props.stacks : []
    }
  }

  render () {
    return (
      <div width='100%' className='lane mx-2 my-5'>
        <h2 className='p-3 mb-0 lighter'>{this.state.name}</h2>
        <div className='container-fluid'>
          <div className='row'>
            {this.state.stacks.map((stack, i) => {
              return <Stack name={stack.name} cards={stack.cards} key={stack.name + i} />
            })}
          </div>
        </div>
      </div>
    )
  }
}

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      title: 'Office of Data & Performance Projects',
      showHeader: true,
      internalMode: false,
      laneDimension: 'category',
      rawData: [],
      data: []
    }
    this.handleViewByChange = this.handleViewByChange.bind(this)
  }

  componentDidMount () {
    let showHeader = true
    let internalMode = false
    if (window.location.search.includes('noheader=true')) showHeader = false
    if (window.location.search.includes('internal=true')) internalMode = true
    this.setState({ showHeader, internalMode })
    this.getData()
  }

  handleViewByChange (e) {
    // e.preventDefault();
    this.setState({
      laneDimension: e.target.value,
      data: this.prepData(this.state.rawData, e.target.value)
    })
  }

  prepData (rawData, laneDimension) {
    const lanePresets = laneDimensions[laneDimension].presets
    const internalStackPresets = ['In Progress', 'Next', 'Parking Lot']
    const externalStackPresets = ['Next', 'In Progress', 'Recently Closed']
    const stackPresets = this.state.internalMode ? internalStackPresets : externalStackPresets
    const data = []
    const lanes = {}
    lanePresets.forEach(function (ln) {
      lanes[ln] = []
      stackPresets.forEach(function (stk) { // Set up empty stacks
        lanes[ln][stk] = []
      })
    })

    // Sort raw data into lanes by lane dimension
    rawData.forEach(function (itm) {
      if (!(itm[laneDimension] in lanes)) {
        lanes[itm[laneDimension]] = {}
        stackPresets.forEach(function (stk) { // Set up empty stacks
          lanes[itm[laneDimension]][stk] = []
        })
      }
      if (!(itm.status in lanes[itm[laneDimension]])) lanes[itm[laneDimension]][itm.status] = []
      lanes[itm[laneDimension]][itm.status].push(itm)
    })

    for (const lane in lanes) {
      data.push({ name: lane, stacks: lanes[lane] })
    }

    sortOrder = lanePresets
    data.sort(sortByName)

    data.forEach(function (lane) {
      const stacks = []
      for (const nm in lane.stacks) {
        let cards = lane.stacks[nm].sort(sortByPriority)
        if (cards.length === 0) { // Add a dummy to preserve stack alignment
          cards = [{
            name: 'Dummy',
            category: '',
            priority: 'None',
            lead: 'Unknown',
            status: nm,
            description: ''
          }]
        }
        stacks.push({ name: nm, cards: cards })
      }
      sortOrder = stackPresets
      stacks.sort(sortByName)
      lane.stacks = stacks
    })
    return data
  }

  getData () {
    // ID and URL the Google Spreadsheet. Make sure it is published
    var spreadsheetID = '1HMyHNExKF8xo8S6gXkqx5sTo4Rz0ez8iY4mF2XzmvXs'
    var url = 'https://spreadsheets.google.com/feeds/list/' + spreadsheetID + '/od6/public/values?alt=json'

    let rawData = null
    fetch(url) /* global fetch:false */
      .then(response => response.json())
      .then((jsonData) => {
        rawData = jsonData.feed.entry
          .filter((itm) => {
            if (itm.gsx$status.$t === 'Cancelled') return false

            if (this.state.internalMode) {
              return (itm.gsx$parenttask.$t === '' &&
                      itm.gsx$completedat.$t === '')
            } else {
              if (itm.gsx$status.$t === 'Parking Lot') return false
              if (itm.gsx$parenttask.$t === '') {
                if (itm.gsx$completedat.$t === '') return true
                const closeDate = Date.parse(itm.gsx$completedat.$t)
                const oldDate = new Date()
                oldDate.setMonth(oldDate.getMonth() - 3)
                if (closeDate > oldDate) return true
              }
              return false
            }
          })
          .map((itm) => {
            let status = itm.gsx$status.$t
            if (status === 'Completed') status = 'Recently Closed'
            return {
              name: itm.gsx$name.$t,
              category: itm.gsx$sectioncolumn.$t,
              priority: (itm.gsx$importance.$t === '') ? 'None' : itm.gsx$importance.$t,
              lead: (itm.gsx$assignee.$t === '') ? 'Unknown' : itm.gsx$assignee.$t,
              status: status,
              description: itm.gsx$notes.$t,
              none: 'All Projects'
            }
          })
        const data = this.prepData(rawData, this.state.laneDimension)

        this.setState({ data, rawData })
      })
  }

  render () {
    const header = this.state.showHeader ? (
      <header className='navbar p-3 coa-bg-header'>
        <img src='/coa-logo.png' height='125' className='header-image align-top' alt='Logo for City of Asheville, North Carolina' />
        <h1 className='navbar-text lighter'>
          {this.state.title}
        </h1>
      </header>
    ) : ' '
    return (
      <div className='App'>
        {header}
        <form className='view-by'>
          <span style={{ marginRight: '1em' }}><b>View By</b></span>
          <div className='form-check form-check-inline'>
            <label className='form-check-label'>
              <input
                type='radio'
                name='react-tips'
                value='category'
                checked={this.state.laneDimension === 'category'}
                onChange={this.handleViewByChange}
                className='form-check-input'
              />
              <b>Category</b>
            </label>
          </div>
          <div className='form-check form-check-inline'>
            <label className='form-check-label'>
              <input
                type='radio'
                name='react-tips'
                value='priority'
                checked={this.state.laneDimension === 'priority'}
                onChange={this.handleViewByChange}
                className='form-check-input'
              />
              <b>Priority</b>
            </label>
          </div>
          <div className='form-check form-check-inline'>
            <label className='form-check-label'>
              <input
                type='radio'
                name='react-tips'
                value='lead'
                checked={this.state.laneDimension === 'lead'}
                onChange={this.handleViewByChange}
                className='form-check-input'
              />
              <b>Lead</b>
            </label>
          </div>
          <div className='form-check form-check-inline'>
            <label className='form-check-label'>
              <input
                type='radio'
                name='react-tips'
                value='none'
                checked={this.state.laneDimension === 'none'}
                onChange={this.handleViewByChange}
                className='form-check-input'
              />
              <b>None</b>
            </label>
          </div>
        </form>

        {this.state.data.map((lane, i) => {
          return <Lane name={lane.name} stacks={lane.stacks} key={lane.name + i} />
        })}
      </div>
    )
  }
}

export default App
