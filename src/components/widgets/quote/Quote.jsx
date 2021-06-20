import React from 'react';

import EventBus from '../../../modules/helpers/eventbus';

import FileCopy from '@material-ui/icons/FilterNone';
import TwitterIcon from '@material-ui/icons/Twitter';
import StarIcon from '@material-ui/icons/Star';
import StarIcon2 from '@material-ui/icons/StarBorder';

import { toast } from 'react-toastify';

import './quote.scss';

export default class Quote extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      quote: '',
      author: '',
      favourited: <StarIcon2 className='copyButton' onClick={this.favourite} />,
      tweet: '',
      copy: '',
      quoteLanguage: ''
    };
    this.buttons = {
      tweet: <TwitterIcon className='copyButton' onClick={this.tweetQuote} />,
      copy: <FileCopy className='copyButton' onClick={this.copyQuote} />
    };
    this.language = window.language.widgets.quote;
  }

  doOffline() {
    const quotes = require('./offline_quotes.json');

    // Get a random quote from our local package
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    this.setState({
      quote: '"' + quote.quote + '"',
      author: quote.author,
      authorlink: this.getAuthorLink(quote.author)
    });
  }

  getAuthorLink(author) {
    let authorlink = `https://${window.languagecode.split('_')[0]}.wikipedia.org/wiki/${author.split(' ').join('_')}`;
    if (localStorage.getItem('authorLink') === 'false' || author === 'Unknown') {
      authorlink = null;
    }

    return authorlink;
  }

  async getQuote() {
    const offline = (localStorage.getItem('offlineMode') === 'true');

    const favouriteQuote = localStorage.getItem('favouriteQuote');
    if (favouriteQuote) {
      return this.setState({
        quote: favouriteQuote.split(' - ')[0],
        author: favouriteQuote.split(' - ')[1],
        authorlink: this.getAuthorLink(favouriteQuote.split(' - ')[1])
      });
    }

    switch (localStorage.getItem('quoteType') || 'api') {
      case 'custom':
        const customQuote = localStorage.getItem('customQuote');
        const customQuoteAuthor = localStorage.getItem('customQuoteAuthor');

        if (customQuote) {
          return this.setState({
            quote: '"' + customQuote + '"',
            author: customQuoteAuthor,
            authorlink: this.getAuthorLink(customQuote),
            type: 'custom'
          });
        }
        break;
      case 'quote_pack':
        if (offline) {
          return this.doOffline();
        }

        const quotePackAPI = JSON.parse(localStorage.getItem('quoteAPI'));
        if (quotePackAPI) {
          try {
            const data = await (await fetch(quotePackAPI.url)).json();
            const author = data[quotePackAPI.author] || quotePackAPI.author;

            return this.setState({
              quote: '"' + data[quotePackAPI.quote] + '"',
              author: author,
              authorlink: this.getAuthorLink(author),
              type: 'quote_pack'
            });
          } catch (e) {
            return this.doOffline();
          }
        }
    
        let quotePack = localStorage.getItem('quote_packs');
    
        if (quotePack !== null) {
          quotePack = JSON.parse(quotePack);
    
          if (quotePack) {
            const data = quotePack[Math.floor(Math.random() * quotePack.length)];
            return this.setState({
              quote: '"' + data.quote + '"',
              author: data.author,
              authorlink: this.getAuthorLink(data.author),
              type: 'quote_pack'
            });
          } else {
            return this.doOffline();
          }
        }
        break;
      case 'api':
        if (offline) {
          return this.doOffline();
        }

        // First we try and get a quote from the API...
        try {
          const quotelanguage = localStorage.getItem('quotelanguage');
          const data = await (await fetch(window.constants.API_URL + '/quotes/random?language=' + quotelanguage)).json();

          // If we hit the ratelimit, we fallback to local quotes
          if (data.statusCode === 429) {
            return this.doOffline();
          }

          this.setState({
            quote: '"' + data.quote + '"',
            author: data.author,
            authorlink: this.getAuthorLink(data.author),
            quoteLanguage: quotelanguage,
            type: 'api'
          });
        } catch (e) {
          // ..and if that fails we load one locally
          this.doOffline();
        }
        break;
      default:
        break;
    }
  }

  copyQuote = () => {
    navigator.clipboard.writeText(`${this.state.quote} - ${this.state.author}`);
    toast(window.language.toasts.quote);
  }

  tweetQuote = () => {
    window.open(`https://twitter.com/intent/tweet?text=${this.state.quote} - ${this.state.author} on @getmue`, '_blank').focus();
  }

  favourite = () => {
    if (localStorage.getItem('favouriteQuote')) {
      localStorage.removeItem('favouriteQuote');
      this.setState({
        favourited: <StarIcon2 className='copyButton' onClick={this.favourite} />
      });
    } else {
      localStorage.setItem('favouriteQuote', this.state.quote + ' - ' + this.state.author);
      this.setState({
        favourited: <StarIcon className='copyButton' onClick={this.favourite} />
      });
    }
  }

  init() {
    let favouriteQuote = '';
    if (localStorage.getItem('favouriteQuoteEnabled') === 'true') {
      favouriteQuote = localStorage.getItem('favouriteQuote') ? <StarIcon className='copyButton' onClick={this.favourite} /> : <StarIcon2 className='copyButton' onClick={this.favourite} />;
    }

    this.setState({
      favourited: favouriteQuote,
      copy: (localStorage.getItem('copyButton') === 'false') ? null : this.buttons.copy,
      tweet: (localStorage.getItem('tweetButton') === 'false') ? null : this.buttons.tweet
    });

    const quoteType = localStorage.getItem('quoteType');

    if (this.state.type !== quoteType || localStorage.getItem('quotelanguage') !== this.state.quoteLanguage || (quoteType === 'custom' && this.state.quote !== localStorage.getItem('customQuote'))
       || (quoteType === 'custom' && this.state.author !== localStorage.getItem('customQuoteAuthor'))) {
      this.getQuote();
    }
  }

  componentDidMount() {
    EventBus.on('refresh', (data) => {
      if (data === 'quote') {
        const element = document.querySelector('.quotediv');

        if (localStorage.getItem('quote') === 'false') {
          return element.style.display = 'none';
        }

        element.style.display = 'block';
        document.querySelector('.quote').style.fontSize = `${0.8 * Number((localStorage.getItem('zoomQuote') || 100) / 100)}em`;
        document.querySelector('.quoteauthor').style.fontSize = `${0.9 * Number((localStorage.getItem('zoomQuote') || 100) / 100)}em`;
        this.init();
      }

      // uninstall quote pack reverts the quote to what you had previously
      if (data === 'marketplacequoteuninstall') {
        this.init();
      }
    });
  
    document.querySelector('.quote').style.fontSize = `${0.8 * Number((localStorage.getItem('zoomQuote') || 100) / 100)}em`;
    document.querySelector('.quoteauthor').style.fontSize = `${0.9 * Number((localStorage.getItem('zoomQuote') || 100) / 100)}em`;

    this.init();
  }

  render() {
    return (
      <div className='quotediv'>
        <h1 className='quote'>{`${this.state.quote}`}</h1>
        <h1 className='quoteauthor'>
          <a href={this.state.authorlink} className='quoteauthorlink' target='_blank' rel='noopener noreferrer'>{this.state.author}</a>
          <br/>
          {this.state.copy} {this.state.tweet} {this.state.favourited}
        </h1>
      </div>
    );
  }
}
