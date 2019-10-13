import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import HomePage from './containers/HomePageContainer';
import DashboardPage from './containers/DashboardPageContainer';
import CreatePage from './containers/CreatePageContainer';
import PartyPage from './containers/PartyPageContainer';

import './fonts.css';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route exact path="/dashboard" component={DashboardPage} />
      <Route exact path="/create" component={CreatePage} />
      <Route exact path="/party/:id" component={PartyPage} />
      <Route component={HomePage} />
    </Switch>
  </BrowserRouter>,
  document.getElementById('app'),
);
