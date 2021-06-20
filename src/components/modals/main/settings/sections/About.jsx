import React from 'react';

import Tooltip from '../../../../helpers/tooltip/Tooltip';
import EmailIcon from '@material-ui/icons/Email';
import TwitterIcon from '@material-ui/icons/Twitter';
import ForumIcon from '@material-ui/icons/Forum';
import InstagramIcon from '@material-ui/icons/Instagram';
import FacebookIcon from '@material-ui/icons/Facebook';

const other_contributors = require('../../../../../modules/other_contributors.json');

export default class About extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      contributors: [],
      sponsors: [],
      other_contributors: [],
      photographers: window.language.modals.main.loading,
      update: window.language.modals.main.settings.sections.about.version.checking_update,
      loading: window.language.modals.main.loading
    };
    this.language = window.language.modals.main.settings.sections.about;
    this.controller = new AbortController();
  }

  async getGitHubData() {
    let contributors, sponsors, photographers, versionData;

    try {
      versionData = await (await fetch(window.constants.GITHUB_URL + '/repos/mue/mue/releases', { signal: this.controller.signal })).json();

      contributors = await (await fetch(window.constants.GITHUB_URL + '/repos/mue/mue/contributors', { signal: this.controller.signal })).json();
      sponsors = (await (await fetch(window.constants.SPONSORS_URL + '/list', { signal: this.controller.signal })).json()).sponsors;

      photographers = await (await fetch(window.constants.API_URL + '/images/photographers', { signal: this.controller.signal })).json();
    } catch (e) {
      if (this.controller.signal.aborted === true) {
        return;
      }

      return this.setState({
        update: this.language.version.error.title,
        loading: this.language.version.error.description
      });
    }

    if (this.controller.signal.aborted === true) {
      return;
    }

    const newVersion = versionData[0].tag_name;

    let updateMsg = this.language.version.no_update;
    if (Number(window.constants.VERSION.replaceAll('.', '')) < Number(newVersion.replaceAll('.', ''))) {
      updateMsg = `${this.language.version.update_available}: ${newVersion}`;
    }

    this.setState({
      contributors: contributors.filter((contributor) => !contributor.login.includes('bot')),
      sponsors: sponsors,
      update: updateMsg,
      other_contributors: other_contributors,
      photographers: photographers.sort().join(', '), 
      loading: null
    });
  }

  componentDidMount() {
    if (navigator.onLine === false || localStorage.getItem('offlineMode') === 'true') {
      this.setState({
        update: this.language.version.offline_mode,
        loading: window.language.modals.main.marketplace.offline.description
      });
      return;
    }

    this.getGitHubData();
  }

  componentWillUnmount() {
    // stop making requests
    this.controller.abort();
  }

  render() {
    return (
      <>
        <h2>{this.language.title}</h2>
        <img draggable='false' className='aboutLogo' src='./././icons/logo_horizontal.png' alt='Mue logo'></img>
        <p>{this.language.copyright} 2018-{new Date().getFullYear()} <a href='https://github.com/mue/mue/graphs/contributors' className='aboutLink' target='_blank' rel='noopener noreferrer'>The Mue Authors</a> (BSD-3 License)</p>
        <p>{this.language.version.title} {window.constants.VERSION} ({this.state.update})</p>

        <h3>{this.language.contact_us}</h3>
        <a href='mailto:hello@muetab.com' className='aboutIcon' target='_blank' rel='noopener noreferrer'><EmailIcon/></a>
        <a href='https://twitter.com/getmue' className='aboutIcon' target='_blank' rel='noopener noreferrer'><TwitterIcon/></a>
        <a href='https://instagram.com/mue.tab' className='aboutIcon' target='_blank' rel='noopener noreferrer'><InstagramIcon/></a>
        <a href='https://facebook.com/muetab' className='aboutIcon' target='_blank' rel='noopener noreferrer'><FacebookIcon/></a>
        <a href='https://discord.gg/zv8C9F8' className='aboutIcon' target='_blank' rel='noopener noreferrer'><ForumIcon/></a>

        <h3>{this.language.support_mue}</h3>
        <p>
          <a href='https://github.com/sponsors/davidjcralph' className='aboutLink' target='_blank' rel='noopener noreferrer'>GitHub Sponsors</a> 
          &nbsp; • &nbsp;<a href='https://ko-fi.com/davidjcralph' className='aboutLink' target='_blank' rel='noopener noreferrer'>Ko-Fi</a> 
          &nbsp; • &nbsp;<a href='https://patreon.com/davidjcralph' className='aboutLink' target='_blank' rel='noopener noreferrer'>Patreon</a>
        </p>

        <h3>{this.language.resources_used.title}</h3>
        <p>
          <a href='https://www.pexels.com' className='aboutLink' target='_blank' rel='noopener noreferrer'>Pexels</a>
          , <a href='https://unsplash.com' className='aboutLink' target='_blank' rel='noopener noreferrer'>Unsplash</a> ({this.language.resources_used.bg_images})
        </p>
        <p><a href='https://fonts.google.com/icons?selected=Material+Icons' className='aboutLink' target='_blank' rel='noopener noreferrer'>Google Fonts</a> ({this.language.resources_used.pin_icon})</p>
        <p><a href='https://undraw.co' className='aboutLink' target='_blank' rel='noopener noreferrer'>Undraw</a> ({this.language.resources_used.welcome_img})</p>

        <h3>{this.language.contributors}</h3>
        <p>{this.state.loading}</p>
        {this.state.contributors.map((item) => (
          <Tooltip title={item.login} key={item.login}>
            <a href={'https://github.com/' + item.login} target='_blank' rel='noopener noreferrer'><img draggable='false' className='abouticon' src={item.avatar_url + '&size=128'} alt={item.login}/></a>
          </Tooltip>
        ))}
        { // for those who contributed without opening a pull request
        this.state.other_contributors.map((item) => (
          <Tooltip title={item.login} key={item.login}>
            <a href={'https://github.com/' + item.login} target='_blank' rel='noopener noreferrer'><img draggable='false' className='abouticon' src={item.avatar_url + '&size=128'} alt={item.login}/></a>
          </Tooltip>
        ))}

        <h3>{this.language.supporters}</h3>
        <p>{this.state.loading}</p>
        {this.state.sponsors.map((item) => (
          <Tooltip title={item.handle} key={item.handle}>
            <a href={item.profile} target='_blank' rel='noopener noreferrer'><img draggable='false' className='abouticon' src={item.avatar + '&size=128'} alt={item.handle}></img></a>
          </Tooltip>
        ))}

        <h3>{this.language.photographers}</h3>
        <p>{this.state.photographers}</p>
      </>
    );
  }
}
