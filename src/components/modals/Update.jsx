import React from 'react';
import * as Constants from '../../modules/constants';

export default class Update extends React.PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      title: this.props.language.title,
      date: '???',
      content: this.props.language.title,
      author: 'Mue',
      html: this.props.language.loading
    };
 }

 async getUpdate() {
  const supportText = `<br/><p>${this.props.language.contact_support}: <a target='_blank' class='modalLink' href='https://muetab.com/contact'>https://muetab.com/contact</a></p>`;

  const removeStuff = () => { // quick code to make update modal a bit better, will replace later
    document.getElementById('author').innerText = '';
    const img = document.getElementsByTagName('img')[0];
    img.parentNode.removeChild(img);
  }

  if (localStorage.getItem('offlineMode') === 'true') {
    removeStuff();
    return this.setState({
      title: this.props.language.offline.title,
      html: this.props.language.offline.description
    });
  }

  try { // Get update log from the API
    const data = await (await fetch(Constants.API_URL + '/getUpdate')).json();
    if (data.statusCode === 500) {
      removeStuff();
      return this.setState({
        title: this.props.language.error.title,
        html: this.props.language.error.description + supportText
      });
  }

    this.setState({
      title: data.title,
      date: data.published,
      image: data.image,
      author: data.author,
      html: data.content + `<br/><p>${this.props.language.read_blog}: <a target='_blank' class='modalLink' href='${data.url}'>${data.url}</a></p>`
    });
  } catch (e) { // If it fails, we send an error
    removeStuff();
    this.setState({
      title: this.props.language.error.title,
      html: this.props.language.error.description + supportText
    });
  }
 }

 componentDidMount() {
   this.getUpdate();
 }

  render() {
    return <div className='updateContent'>
        <span className='closeModal' onClick={this.props.modalClose}>&times;</span>
        <h1 style={{ 'marginBottom': '-10px' }}>{this.state.title}</h1>
        <h5 style={{ 'lineHeight':'0px' }} id='author'> By {this.state.author} • {this.state.date}</h5>
        <img draggable='false' src={this.state.image} alt='Update'></img>
        <p dangerouslySetInnerHTML={{ __html: this.state.html }}></p>
      </div>;
    }
}