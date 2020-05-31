import React, { Component } from 'react';

import PieChart from './PieChart/PieChart';
import AreaChart from './AreaChart/AreaChart';

import './MetricsPage.css';

class MetricsPage extends Component {
	state = {};
	render() {
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
							<PieChart id='pie-chart' />
						</div>
					</div>
					<div className='area-chart-container'>
						<div className='header'>
							<h1>Week</h1>
							<span>This week's look</span>
							<hr></hr>
						</div>
						<div className='area-chart-visual-container'>
							<AreaChart />
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default MetricsPage;
