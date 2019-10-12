import React from 'react';
// import axios from 'axios';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import arts from '../../arts.css';
import styles from './styles.css';

class DashboardPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {

  }

  render() {
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
        </div>
      </div>
    );
  }
}

export default DashboardPage;
