import React from 'react';

import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import CopyIcon from '@material-ui/icons/FileCopyRounded';
import NotesIcon from '@material-ui/icons/AssignmentRounded';

import Pin from './Pin';

export default class Notes extends React.PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      notes: localStorage.getItem('notes') || ''
    };
  }

  setNotes = (e) => {
    localStorage.setItem('notes', e.target.value);
    this.setState({
      notes: e.target.value
    });
  };

  pin() {
    document.getElementById('noteContainer').classList.toggle('visibilityshow');

    if (localStorage.getItem('notesPinned') === 'true') {
      localStorage.setItem('notesPinned', false);
    } else {
      localStorage.setItem('notesPinned', true);
    }
  }

  componentDidMount() {
    if (localStorage.getItem('notesPinned') === 'true') {
      document.getElementById('noteContainer').classList.toggle('visibilityshow');
    }
  }

  render() {
    let classList = 'notescontainer';
    if (localStorage.getItem('darkTheme') === 'true') {
      classList += ' dark';
    }

    return (
      <span id='noteContainer' className={classList}>
        <div className='topbarnotes'>
          <NotesIcon/>
          <h3>{this.props.language.title}</h3>
        </div>
        <TextareaAutosize rowsMax={50} placeholder={this.props.language.placeholder} value={this.state.notes} onChange={this.setNotes}/>
        <button onClick={this.pin} className='pinNote'><Pin/></button>
        <button onClick={() => navigator.clipboard.writeText(this.state.notes)} className='saveNote'><CopyIcon/></button>
      </span>
    );
  }
}