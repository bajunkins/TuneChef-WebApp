import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

import { getQueryVar } from '../../tools/helpers';
import arts from '../../arts.css';
import styles from './styles.css';

const authorize = () => {
  axios.get('/api/spotify/authorize')
    .then((response) => {
      window.open(response.data, '_self');
    })
    .catch((err) => {
      console.error(err);
    });
};

class HomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    // get the query var code from spotify callback
    const code = getQueryVar('code');
    if (code) {
      axios.put('/api/spotify/setcode', {
        code,
      })
        .then((response) => {
          // if the code doens't work, don't use it
          if (!response.data.success) {
            this.props.history.push('/');
            return;
          }

          // testing out the user call
          // axios.get('/api/spotify/user', {
          // })
          //   .then((res) => {
          //     console.log(res);
          //   })
          //   .catch((err) => {
          //     console.error(err);
          //   });

          this.props.history.push('/dashboard');
        })
        .catch((err) => {
          /* eslint no-console: ["warn", { allow: ["error"] }] */
          console.error(err);
        });
    }
  }

  render() {
    return (
      <div className={arts.body}>
        <div className={styles.title}>
          TuneChef
        </div>
        <div className={styles.button} role="button" tabIndex={0} onClick={authorize}>
          Join Now
        </div>
      </div>
    );
  }
}

HomePage.propTypes = {
  history: PropTypes.object.isRequired,
};

export default HomePage;
