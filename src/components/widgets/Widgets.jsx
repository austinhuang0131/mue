import React from 'react';

import Clock from './time/Clock';
import Greeting from './greeting/Greeting';
import Quote from './quote/Quote';
import Search from './search/Search';
import Maximise from './background/Maximise';
import Favourite from './background/Favourite';
import Date from './time/Date';

export default class Widgets extends React.PureComponent {
  enabled(key) {
    const stringValue = localStorage.getItem(key);
    let enabled = true;

    if (stringValue !== null) {
      if (stringValue === 'true') {
        enabled = true;
      }

      if (stringValue === 'false') {
        enabled = false;
      }
    }

    return enabled;
  }

  componentDidMount() {
    const widget = document.getElementById('widgets');
    // These lines of code prevent double clicking the page or pressing CTRL + A from highlighting the page
    widget.addEventListener('mousedown', (event) => {
      if (event.detail > 1) {
        event.preventDefault();
      }
    }, false);

    document.onkeydown = (e) => {
      e = e || window.event;
      if (!e.ctrlKey) {
        return;
      }
      let code = e.which || e.keyCode;
      
      const modals = document.getElementsByClassName('ReactModal__Overlay');
      if (modals.length > 0) {
        return;
      }

      switch (code) {
        case 65:
          e.preventDefault();
          e.stopPropagation();
          break;
      }
    };
  }

  render() {
    const enabled = this.enabled;

    return (
      <div id='widgets'>
        {enabled('searchBar') ? <Search/> : null}
        {enabled('greeting') ? <Greeting/> : null}
        {enabled('time') ? <Clock/> : null}
        {enabled('date') ? <Date/> : null}
        {enabled('quote') ? <Quote/> : null}
        {enabled('view') ? <Maximise/> : null}
        {enabled('favouriteEnabled') ? <Favourite/> : null}
      </div>
    );
  }
}
