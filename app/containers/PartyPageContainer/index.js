import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import classNames from 'classnames';
import moment from 'moment';
import { Link, Redirect } from 'react-router-dom';

import TuneChef from '../../images/TuneChef.png';
import arts from '../../arts.css';
import styles from './styles.css';

class PartyPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      name: '',
      desc: '',
      author: '',
      date: '',
      id: '',
      users: {},
    };
  }

  componentDidMount() {
    const user = localStorage.getItem('user');
    if ((user === undefined) || (user == null) || (user === 'undefined')) {
      return;
    }

    const id = this.props.match.params.id;
    if (id == null) {
      return;
    }

    axios.get('/api/party/id', {
      params: {
        id,
      },
    })
      .then((response) => {
        // console.log(response);
        if (!response.data.success) {
          this.setState({ ready: true });
          return;
        }

        this.setState({
          name: response.data.party.name,
          desc: response.data.party.desc,
          author: response.data.party.author,
          date: moment(response.data.party.date).format('MM/DD/YY'),
          users: response.data.party.users || {},
          id: response.data.party._id,
          ready: true,
        });
      })
      .catch((error) => {
        /* eslint no-console: ["warn", { allow: ["error"] }] */
        console.error(error);
      });
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    const selected = document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    if (selected) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
    }
    this.setState({
      copied: true,
    }, () => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.setState({ copied: false });
      }, 1000);
    });
  }

  render() {
    const user = localStorage.getItem('user');
    if ((user === undefined) || (user == null) || (user === 'undefined') || (this.state.ready && !this.state.name)) {
      return <Redirect to="/" />;
    }

    return (
      <div className={arts.body}>
        <div className={arts.header}>
          {this.state.name}
        </div>

        <Link className={styles.back} to="/dashboard">
          Back
        </Link>

        <div className={styles.upperRow}>
          <div className={styles.noImage}>
            <img src={TuneChef} alt="TuneChef Logo" className={styles.logo} draggable={false} />
          </div>

          <div className={styles.upperColumn}>
            <div className={styles.desc}>
              {this.state.desc}
            </div>

            <div className={styles.detailRow}>
              <i className={classNames(styles.detailIcon, 'fas fa-user')} />
              <div className={styles.detailText}>
                {`Host: ${this.state.author}`}
              </div>
            </div>

            <div className={styles.detailRow}>
              <i className={classNames(styles.detailIcon, 'fas fa-clock')} />
              <div className={styles.detailText}>
                {`Date Created: ${this.state.date}`}
              </div>
            </div>

            <div className={styles.detailRow} style={{ marginBottom: -10 }}>
              <i className={classNames(styles.detailIcon, 'fas fa-users')} />
              <div className={styles.detailText}>
                {`Partygoers: ${Object.keys(this.state.users).length}`}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.linkRow}>
          <div
            className={styles.linkContainer}
            role="button"
            tabIndex={0}
            onClick={() => this.copyToClipboard(`localhost:3000/join/${this.state.id}`)}
          >
            <i className={classNames(styles.linkIcon, 'fas fa-clipboard')} />
            <div className={styles.linkText}>
              {this.state.copied ? 'Copied!' : 'Copy Shareable Link'}
            </div>
          </div>

          <Link
            className={styles.linkContainer}
            to={`/join/${this.state.id}`}
          >
            <i className={classNames(styles.linkIcon, 'fas fa-user-plus')} />
            <div className={styles.linkText}>
              Join the Party
            </div>
          </Link>
        </div>

        <div className={styles.usersHeader}>
          {"Who's In The Party?"}
        </div>
        {Object.keys(this.state.users).length > 0 ? Object.entries(this.state.users).map(([key]) => (
          <div className={styles.userContainer} key={key}>
            <img src={TuneChef} alt="TuneChef Logo" className={styles.userLogo} draggable={false} />
            <div className={styles.userText}>
              {key}
            </div>
          </div>
        )) : (
          <div className={styles.nobodyText}>
            {"No One's Partying Yet!"}
          </div>
        )}
      </div>
    );
  }
}

PartyPage.propTypes = {
  match: PropTypes.object,
};

export default PartyPage;
