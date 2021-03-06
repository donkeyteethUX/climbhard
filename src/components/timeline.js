import React, {Component} from 'react';
import Data from '../../data/climbingdata.csv';
import {FlexibleWidthXYPlot, XAxis, YAxis, MarkSeries, HorizontalGridLines, VerticalGridLines} from 'react-vis';
import {SelectPicker} from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css';

export default class Timeline extends Component {
  constructor(props) {
    super(props);
    this.data = processClimbers();
    this.state = {
      data: this.data,
      names: getNames(this.data),
      climber: 'Adam Ondra',
      climbs: selectClimber(this.data, 'Adam Ondra')
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const climbs = selectClimber(this.state.data, e);
    this.setState({
      climber: e.value,
      climbs
    });
  }

  render() {
    return (
      <div className="timeline">
        <SelectPicker
          data={this.state.names}
          style={{width: 300}}
          onSelect={this.handleChange}
          defaultValue={this.state.climber}
        />
        <Plots
          boulder={this.state.climbs.boulder}
          sport={this.state.climbs.sport}
         />
      </div>
    );
  }
}

class Plots extends Component {
  constructor(props) {
    super(props);
    this.width = 500;
    this.height = 300;
  }
  render() {
    return (
      <FlexibleWidthXYPlot
        xType="time"
        height={this.height}
      >
        <XAxis />
        <YAxis orientation="left" className="boulder axis"/>
        <YAxis orientation="right" className="sport axis"/>
        <HorizontalGridLines />
        <VerticalGridLines />
        <MarkSeries
          className= "boulder-climbs"
          data={this.props.boulder}
        />
        <MarkSeries
          className= "sport-climbs"
          data={this.props.sport}
        />
      </FlexibleWidthXYPlot>
    );
  }
}

function getNames(data) {
  const names = [];
  Object.keys(data).forEach(d => {
    names.push({value: d, label: d});
  });
  return names;
}

function convertDate(datestr) {
  if (!datestr) {
    return null;
  }
  // https://regex101.com/r/4lZego/1
  const match = datestr.match(/^(?<mm>\d{1,2})\/(?<dd>\d{1,2})\/(?<yyyy>\d{4})$/);
  if (match) {
    const date = new Date(
      Number(match.groups.yyyy),
      Number(match.groups.mm),
      Number(match.groups.dd));
    return date;
  }
  return null;
}

// create an object indexed by climber names
// WARN|NOTE: the "date" field may be null if the string couldn't be parsed
function processClimbers() {
  const data = {};
  Data.forEach(d => {
    const climber = d.Climber;
    const info = {
      area: d.OriginalArea,
      climb: d.Climb,
      date: convertDate(d.Date),
      grade: d.SuggestedNumberGrade,
      style: d.Style,
      year: d.Year
    };
    if (data[climber]) {
      data[climber].push(info);
    } else {
      data[climber] = [info];
    }
  });
  return data;
}

function selectClimber(data, climber) {
  const sport = [];
  const boulder = [];
  const cdata = data[climber];
  cdata.forEach(d => {
    if (!d.date) {
      return;
    }
    if (d.style === 'Sport Route') {
      sport.push({x: d.date, y: d.grade});
    } else if (d.style === 'Boulder Problem') {
      boulder.push({x: d.date, y: d.grade});
    }
  });
  return {sport, boulder};
}
