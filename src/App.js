import React, { Component } from 'react';

import Header from './components/Shared/Header/Header';
import MetricsPage from './components/MetricsPage/MetricsPage';

import './App.css';

class App extends Component {
	state = {};
	render() {
		return (
			<React.Fragment>
				<div className='main-container'>
					<Header />
					<MetricsPage />
				</div>
			</React.Fragment>
		);
	}
}

export default App;
