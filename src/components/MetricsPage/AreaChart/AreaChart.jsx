import React, { Component } from 'react';

import ReactApexChart from 'react-apexcharts';

class AreaChart extends Component {
	constructor(props) {
		super(props);

		this.state = {
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
						'2020-05-20T00:00:00.000Z',
						'2020-05-21T00:00:00.000Z',
						'2020-05-22T00:00:00.000Z',
						'2020-05-23T00:00:00.000Z',
						'2020-05-24T00:00:00.000Z',
						'2020-05-25T00:00:00.000Z',
						'2020-05-26T00:00:00.000Z',
					],
				},
				tooltip: {
					x: {
						format: 'dd/MM/yy HH:mm',
					},
				},
			},
		};
	}

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
				<ReactApexChart
					options={this.state.options}
					series={this.state.series}
					type='area'
					height={350}
				/>
			</div>
		);
	}
}

export default AreaChart;
