import React from 'react';
import axios from 'axios';
import classNames from 'classnames';
import { Link, Redirect } from 'react-router-dom';

import arts from '../../arts.css';
import styles from './styles.css';

class DashboardPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      parties: [],
    };
  }

  componentDidMount() {
    const user = localStorage.getItem('user');
    if ((user === undefined) || (user == null) || (user === 'undefined')) {
      return;
    }

    axios.get('/api/party/user', {
      params: {
        user,
      },
    })
      .then((response) => {
        if (response.data.success) {
          this.setState({
            parties: response.data.parties,
          });
        }
      })
      .catch((error) => {
        /* eslint no-console: ["warn", { allow: ["error"] }] */
        console.error(error);
      });
  }

  render() {
    const user = localStorage.getItem('user');
    if ((user === undefined) || (user == null) || (user === 'undefined')) {
      return <Redirect to="/" />;
    }

    return (
      <div className={arts.body}>
        <div className={arts.header}>
          Dashboard
        </div>

        <div className={styles.partyHolder}>
          <Link className={styles.newPartyContainer} to="/create">
            <i className={classNames('fas fa-plus', styles.newPartyIcon)} />
            <div className={styles.newPartyText}>
              Create a New Party
            </div>
          </Link>

          {this.state.parties.map((party) => (
            <Link className={styles.partyContainer} key={party._id} to={`/party/${party._id}`}>
              <div className={styles.partyText}>
                {party.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
}

export default DashboardPage;
