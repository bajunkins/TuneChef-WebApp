import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import HomePage from './containers/HomePageContainer';

import './fonts.css';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route component={HomePage} />
    </Switch>
  </BrowserRouter>,
  document.getElementById('app'),
);
