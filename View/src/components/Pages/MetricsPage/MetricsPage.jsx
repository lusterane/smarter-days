import React, { Component } from 'react';

import PieChart from './PieChart/PieChart';
import AreaChart from './AreaChart/AreaChart';

import './MetricsPage.css';

class MetricsPage extends Component {
	state = {
		intents: [],
	};

	componentDidMount() {
		this.getIntentsFromDB();
	}

	async getIntentsFromDB() {
		console.log('HTTP CALL: getIntentsFromDB');

		const requestOptions = {
			method: 'GET',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		};
		const response = await fetch('http://localhost:5000/utterance/entries/')
			.then((res) => res.json({ message: 'Recieved' }))
			.then(
				(result) => {
					this.setState({ intents: this.normalizeCategoryNames(result) });
					return result.status;
				},
				// Note: it's important to handle errors here
				// instead of a catch() block so that we don't swallow
				// exceptions from actual bugs in components.
				(error) => {
					console.log('error');
					this.setState({
						error,
					});

					return error.status;
				}
			);

		let data = await response;
		return data;
	}

	normalizeCategoryNames = (result) => {
		const normalized = result.map((element) => {
			switch (element.category) {
				case 'log_exercising':
					element.category = 'Exercise';
					break;
				case 'log_working':
					element.category = 'Work';
					break;
				default:
					element.category = '-';
			}

			return element;
		});

		console.log(normalized);
		return result;
	};

	render() {
		const { intents } = this.state;
		return (
			<React.Fragment>
				<div className='metrics-page-container'>
					<div className='pie-chart-container'>
						<div className='header'>
							<h1>Today</h1>
							<span>Your stats for today</span>
							<hr></hr>
						</div>
						<div className='pie-chart-visual-container'>
							<PieChart intent={intents} id='pie-chart' />
						</div>
					</div>
					<div className='area-chart-container'>
						<div className='header'>
							<h1>Week</h1>
							<span>This week's look</span>
							<hr></hr>
						</div>
						<div className='area-chart-visual-container'>
							<AreaChart intent={intents} />
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default MetricsPage;
