import React, { Component } from 'react';

import ReactApexChart from 'react-apexcharts';

import './PieChart.css';

class PieChart extends Component {
	constructor(props) {
		super(props);

		this.state = {
			updatedFromProps: false,
			series: [44, 55, 13, 23, 22, 13, 7],
			options: {
				chart: {
					type: 'donut',
				},
				labels: [
					'Exercise',
					'Studying',
					'Working',
					'Eating',
					'Resting',
					'Sleeping',
					'General',
				],
				responsive: [
					{
						breakpoint: 480,
						options: {
							chart: {
								width: 200,
							},
							legend: {
								position: 'bottom',
							},
						},
					},
				],
			},
		};
	}

	componentDidUpdate(prevProps, prevState) {
		const { intents } = this.props;
		// console.log(intents[0].sumDuration);
		if (prevProps.intents !== intents) {
			this.setState({ updatedFromProps: true }, this.updateChart(intents));
		}
	}

	// ran once when props are recieved
	updateChart = (intents) => {
		// reset state data points
		let options = {
			chart: {
				type: 'donut',
			},
			labels: [],
			responsive: [
				{
					breakpoint: 480,
					options: {
						chart: {
							width: 200,
						},
						legend: {
							position: 'bottom',
						},
					},
				},
			],
		};
		let series = [];

		intents.forEach((intents) => {
			const { category, sumDuration } = intents;
			options.labels.push(category);
			series.push(sumDuration.value);
		});

		this.setState({ series: series, options: options });
	};

	render() {
		const { updatedFromProps } = this.state;
		return updatedFromProps ? (
			<div id='chart' className='pie-chart'>
				<ReactApexChart
					options={this.state.options}
					series={this.state.series}
					type='donut'
					width={380}
				/>
			</div>
		) : (
			''
		);
	}
}

export default PieChart;
