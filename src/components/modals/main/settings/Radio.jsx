import React from 'react';

import RadioUI from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

export default class Radio extends React.PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      value: localStorage.getItem(this.props.name)
    };
  }
  
  handleChange(value) {
    localStorage.setItem(this.props.name, value);
  
    this.setState({
      value: value
    });
  }
  
  render() {
    return (
      <FormControl component='fieldset'>
        <FormLabel className='radio-title' component='legend'>{this.props.title}</FormLabel>
        <RadioGroup aria-label={this.props.name} name={this.props.name} onChange={(e) => this.handleChange(e.target.value)} value={this.state.value}>
          {this.props.options.map(option =>
            <FormControlLabel value={option.value} control={<RadioUI/>} label={option.name} />
          )}
        </RadioGroup>
      </FormControl>
    );
  }
}