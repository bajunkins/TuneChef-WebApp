import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import classNames from 'classnames';
import moment from 'moment';
import { Redirect } from 'react-router-dom';

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
      users: {},
      numUsers: 0,
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
          users: response.data.party.users,
          numUsers: Object.keys(response.data.party.users).length,
          ready: true,
        });
      })
      .catch((error) => {
        /* eslint no-console: ["warn", { allow: ["error"] }] */
        console.error(error);
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
                {`Partygoers: ${this.state.numUsers}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

PartyPage.propTypes = {
  match: PropTypes.object,
};

export default PartyPage;
