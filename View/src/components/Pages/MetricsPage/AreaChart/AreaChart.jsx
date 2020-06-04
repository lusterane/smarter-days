import React, { Component } from 'react';

import ReactApexChart from 'react-apexcharts';

class AreaChart extends Component {
	constructor(props) {
		super(props);

		this.state = {
			propsLoaded: false,
			series: [
				{
					name: 'Exercise',
					data: [15, 6, 13, 19, 17, 4, 9],
				},
				{
					name: 'Studying',
					data: [12, 10, 14, 11, 13, 9, 7],
				},
				{
					name: 'Working',
					data: [6, 2, 15, 8, 3, 1, 7],
				},
				{
					name: 'Eating',
					data: [15, 20, 18, 4, 3, 17, 12],
				},
				{
					name: 'Resting',
					data: [2, 7, 12, 17, 3, 16, 8],
				},
				{
					name: 'Sleeping',
					data: [2, 9, 3, 20, 17, 14, 7],
				},
				{
					name: 'General',
					data: [11, 7, 12, 18, 20, 15, 2],
				},
			],
			options: {
				yaxis: {
					title: {
						text: 'Duration (Seconds)',
					},
				},
				colors: [
					'#2E93fA',
					'#66DA26',
					'#546E7A',
					'#E91E63',
					'#FF9800',
					'#ADBDFF',
					'#6B2D5C',
				],
				chart: {
					height: 350,
					type: 'area',
				},
				dataLabels: {
					enabled: false,
				},
				stroke: {
					curve: 'smooth',
				},
				xaxis: {
					type: 'datetime',
					categories: [
						'2020-05-20T01:00:00.000Z',
						'2020-05-20T02:00:00.000Z',
						'2020-05-20T03:00:00.000Z',
						'2020-05-20T04:00:00.000Z',
						'2020-05-20T05:00:30.000Z',
						'2020-05-20T06:00:00.000Z',
						'2020-05-20T07:00:00.000Z',
					],
				},
				tooltip: {
					x: {
						format: 'MM/dd/yy HH:mm:ss',
					},
				},
			},
		};
	}

	componentDidUpdate(prevProps, prevState) {
		const { intents, timeInterval, view } = this.props;
		if (prevProps.intents !== intents) {
			this.setState({ propsLoaded: true }, this.updateChart(intents));
			// this.setState({ propsLoaded: true });
		}

		if (prevProps.timeInterval !== timeInterval) {
			this.updateTimeValues(timeInterval, intents);
			this.updateYaxisLabel(timeInterval);
		}
	}

	updateYaxisLabel = (timeInterval) => {
		let yAxisName = '';

		switch (timeInterval) {
			case 'seconds':
				yAxisName = 'Duration (Seconds)';
				break;
			case 'minutes':
				yAxisName = 'Duration (Minutes)';
				break;
			case 'hours':
				yAxisName = 'Duration (Hours)';
				break;
		}

		let updatedYAxis = JSON.parse(JSON.stringify(this.state.options));
		updatedYAxis.yaxis.title.text = yAxisName;
		this.setState({ options: updatedYAxis });
	};

	updateTimeValues = (timeInterval, intents) => {
		let newSeries = JSON.parse(JSON.stringify(this.state.series));
		newSeries = intents.map((intent) => {
			const { category, elements } = intent;

			const seriesData = elements.map((element) => {
				const { seconds, minutes, hours } = element.durationForms;
				switch (timeInterval) {
					case 'seconds':
						return seconds;
					case 'minutes':
						return minutes;
					case 'hours':
						return hours;
				}
			});

			return {
				name: category,
				data: seriesData,
			};
		});
		this.setState({ series: newSeries });
	};

	// ran once when props are recieved
	updateChart = (intents) => {
		let series = { ...this.state.series };
		let options = { ...this.state.options };

		// reset state data points
		options.xaxis.categories = [];
		series = [];

		intents.forEach((intents) => {
			const buildCategories = []; // dates
			const buildData = []; // durations
			const categoryName = intents.category;
			intents.elements.forEach((element) => {
				const { date, duration } = element;
				buildCategories.push(date);
				buildData.push(duration.value);
			});

			series.push({
				name: categoryName,
				data: buildData,
			});
			options.xaxis.categories = buildCategories;
		});
		this.setState({ series: series, options: options });
	};

	generateDayWiseTimeSeries = (baseval, count, yrange) => {
		var i = 0;
		var series = [];
		while (i < count) {
			var x = baseval;
			var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

			series.push([x, y]);
			baseval += 86400000;
			i++;
		}
		return series;
	};

	render() {
		return (
			<div id='chart'>
				{this.state.propsLoaded ? (
					<ReactApexChart
						options={this.state.options}
						series={this.state.series}
						type='area'
						height={350}
					/>
				) : (
					''
				)}
			</div>
		);
	}
}

export default AreaChart;
