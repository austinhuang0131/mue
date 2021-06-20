import React from 'react';

import LocalMallIcon from '@material-ui/icons/LocalMall';
import Item from '../Item';
import Items from '../Items';
import Dropdown from '../../settings/Dropdown';

import MarketplaceFunctions from '../../../../../modules/helpers/marketplace';

import { toast } from 'react-toastify';

export default class Added extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      installed: JSON.parse(localStorage.getItem('installed')),
      item: {},
      button: ''
    };
    this.buttons = {
      uninstall: <button className='removeFromMue' onClick={() => this.uninstall()}>{window.language.modals.main.marketplace.product.buttons.remove}</button>,
    };
    this.language = window.language.modals.main.addons;
  }

  toggle(type, data) {
    if (type === 'item') {
      const installed = JSON.parse(localStorage.getItem('installed'));
      const info = installed.find((i) => i.name === data);

      this.setState({
        item: {
          type: info.type,
          name: data,
          display_name: info.name,
          author: info.author,
          description: MarketplaceFunctions.urlParser(info.description.replace(/\n/g, '<br>')),
          //updated: info.updated,
          version: info.version,
          icon: info.screenshot_url,
          quote_api: info.quote_api || null
        },
        button: this.buttons.uninstall
      });
    } else {
      this.setState({
        item: {}
      });
    }
  }

  uninstall() {
    MarketplaceFunctions.uninstall(this.state.item.type, this.state.item.display_name);
    
    toast(window.language.toasts.uninstalled);

    this.setState({
      button: '',
      installed: JSON.parse(localStorage.getItem('installed'))
    });
  }

  sortAddons(value) {
    let installed = JSON.parse(localStorage.getItem('installed'));
    switch (value) {
      case 'newest':
        installed.reverse();
        break;
      case 'oldest':
        break;
      case 'a-z':
        installed.sort();
        break;
      case 'z-a':
        installed.sort();
        installed.reverse();
        break;
      default:
        break;
    }

    this.setState({
      installed: installed
    });
  }

  componentDidMount() {
    this.sortAddons(localStorage.getItem('sortAddons'));
  }

  render() {
    if (this.state.installed.length === 0) {
      return (
        <div className='emptyitems'>
          <div className='emptyMessage'>
            <LocalMallIcon/>
            <h1>{this.language.empty.title}</h1>
            <p className='description'>{this.language.empty.description}</p>
          </div>
        </div>
      );
    }

    if (this.state.item.display_name) {
      return <Item data={this.state.item} button={this.state.button} toggleFunction={() => this.toggle()} />;
    }

    return (
      <>
        <Dropdown label={this.language.sort.title} name='sortAddons' onChange={(value) => this.sortAddons(value)}>
          <option value='newest'>{this.language.sort.newest}</option>
          <option value='oldest'>{this.language.sort.oldest}</option>
          <option value='a-z'>{this.language.sort.a_z}</option>
          <option value='z-a'>{this.language.sort.z_a}</option>
        </Dropdown>
        <br/>
        <Items items={this.state.installed} toggleFunction={(input) => this.toggle('item', input)} />        
      </>
    );
  }
}
