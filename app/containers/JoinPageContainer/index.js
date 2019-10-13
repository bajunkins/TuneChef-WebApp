import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import classNames from 'classnames';
import { Redirect } from 'react-router-dom';

import arts from '../../arts.css';
import styles from './styles.css';

class JoinPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      name: '',
      author: '',
      id: '',
    };

    this.onJoin = this.onJoin.bind(this);
  }

  componentDidMount() {
    const id = this.props.match.params.id;
    if (id == null) {
      this.setState({ ready: true });
      return;
    }

    axios.get('/api/party/id', {
      params: {
        id,
      },
    })
      .then((response) => {
        if (!response.data.success) {
          this.setState({ ready: true });
          return;
        }
        this.setState({
          name: response.data.party.name,
          author: response.data.party.author,
          id: response.data.party._id,
          ready: true,
        });
      })
      .catch((error) => {
        /* eslint no-console: ["warn", { allow: ["error"] }] */
        console.error(error);
      });
  }

  onJoin() {
    axios.get('/api/spotify/join', {
      params: {
        id: this.state.id,
      },
    })
      .then((response) => {
        window.open(response.data, '_self');
      })
      .catch((err) => {
        console.error(err);
      });
  }

  render() {
    if (this.state.ready && !this.state.name) {
      return <Redirect to="/" />;
    }

    return (
      <div className={arts.body} style={{ justifyContent: 'center' }}>
        <div className={styles.container}>
          <div className={styles.welcome}>
            Welcome to The Party!
          </div>

          <i className={classNames('fas fa-user-friends', styles.icon)} />

          <div className={styles.joinText}>
            {`Join ${this.state.author}'s Party:`}
          </div>
          <div className={styles.joinBigText}>
            {this.state.name}
          </div>

          <div className={styles.joinButton} role="button" tabIndex={0} onClick={this.onJoin}>
            Join Now
          </div>
        </div>
      </div>
    );
  }
}

JoinPage.propTypes = {
  match: PropTypes.object,
};

export default JoinPage;
