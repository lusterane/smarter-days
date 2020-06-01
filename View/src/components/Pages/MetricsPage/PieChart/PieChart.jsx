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
					width: 380,
					type: 'pie',
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
		const { intent } = this.props;
		const { updatedFromProps } = this.state;
		if (intent.length > 0 && updatedFromProps === false) {
			this.setState({ updatedFromProps: true }, this.updateChart(intent));
		}
	}

	// ran once when props are recieved
	updateChart = (intent) => {
		let series = { ...this.state.series };
		let options = { ...this.state.options };

		// reset state data points
		options.labels = [];
		series = [];

		intent.forEach((intent) => {
			const { category, sumDuration } = intent;
			options.labels.push(category);
			series.push(sumDuration.value);
		});

		this.setState((state, props) => ({ series: series, options: options }));
	};

	render() {
		return (
			<div id='chart'>
				<ReactApexChart
					options={this.state.options}
					series={this.state.series}
					type='pie'
					width={380}
				/>
			</div>
		);
	}
}

export default PieChart;
