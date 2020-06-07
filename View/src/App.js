import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Header from './components/Shared/Header/Header';
import HomePage from './components/Pages/HomePage/HomePage';
import MetricsPage from './components/Pages/MetricsPage/MetricsPage';

import './App.css';

class App extends Component {
	state = {};
	render() {
		return (
			<React.Fragment>
				<div className='main-container'>
					<Router>
						<Header />
						<Switch>
							<Route exact path={process.env.PUBLIC_URL + '/'}>
								<HomePage />
							</Route>
							<Route path={process.env.PUBLIC_URL + '/metrics'}>
								<MetricsPage />
							</Route>
						</Switch>
					</Router>
				</div>
			</React.Fragment>
		);
	}
}

export default App;
