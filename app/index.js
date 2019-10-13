import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import HomePage from './containers/HomePageContainer';
import DashboardPage from './containers/DashboardPageContainer';
import CreatePage from './containers/CreatePageContainer';
import PartyPage from './containers/PartyPageContainer';
import JoinPage from './containers/JoinPageContainer';
import ThanksPage from './containers/ThanksPageContainer';
import PlayListPage from './containers/PlaylistPageContainer';

import './fonts.css';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route exact path="/dashboard" component={DashboardPage} />
      <Route exact path="/create" component={CreatePage} />
      <Route exact path="/party/:id" component={PartyPage} />
      <Route exact path="/join/:id" component={JoinPage} />
      <Route exact path="/thanks" component={ThanksPage} />
      <Route exact path="/playlist/:id" component={PlayListPage} />
      <Route component={HomePage} />
    </Switch>
  </BrowserRouter>,
  document.getElementById('app'),
);
