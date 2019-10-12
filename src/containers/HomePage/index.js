import React from 'react';

import styles from './styles.module.css';
import axios from 'axios';

class HomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    axios.get('/api/party')
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.error(err);
      })
    // axios.defaults.headers.common['Authorization'] = 'c0d3ae62e6e74f0baa142965fcaa68c6';
    // axios.get('https://api.spotify.com/v1/browse/featured-playlists')
    //   .then((response) => {
    //     console.log(response);
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   })
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          HackNC Jam
        </div>
      </div>
    );
  }
}

export default HomePage;