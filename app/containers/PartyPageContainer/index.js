import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import classNames from 'classnames';
import { Link, Redirect } from 'react-router-dom';

import arts from '../../arts.css';
import styles from './styles.css';

class PartyPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      name: '',
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
        console.log(response);
        this.setState({
          name: response.data.party.name,
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
      </div>
    );
  }
}

PartyPage.propTypes = {
  match: PropTypes.object,
};

export default PartyPage;
