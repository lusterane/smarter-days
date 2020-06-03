import React, { Component } from 'react';

import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import PieChart from './PieChart/PieChart';
import AreaChart from './AreaChart/AreaChart';

import './MetricsPage.css';

class MetricsPage extends Component {
	state = {
		intents: [],
		view: 'day',
		timeInterval: 'seconds',
		dropDownItemStatus: {
			secondsSelected: true,
			minutesSelected: false,
			hoursSelected: false,
		},
	};

	componentDidMount() {
		this.getIntentsFromDB();
	}

	componentDidUpdate(prevProps, prevState) {}

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
					const filteredIntents = this.filterForDates(result);
					let normalizedResult = this.normalizeStepFunction(filteredIntents);
					this.setState({
						intents: normalizedResult,
					});
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

	filterForDates = (intents) => {
		const { view } = this.state;

		let filteredIntents = JSON.parse(JSON.stringify(intents));

		const nowDate = new Date();
		// doesn't have to be UTC
		const ndYear = nowDate.getFullYear();
		const ndMonth = nowDate.getMonth();
		const ndDay = nowDate.getDate();

		if (view === 'day') {
			const fromDate = new Date(ndYear, ndMonth, ndDay, 0, 0, 0, 0);
			const toDate = new Date(ndYear, ndMonth, ndDay, 59, 59, 999);
			filteredIntents.forEach((intent) => {
				intent.elements = intent.elements.filter(
					(element) =>
						fromDate <= new Date(element.date) && toDate >= new Date(element.date)
				);
			});
		}

		return filteredIntents;
	};

	normalizeStepFunction = (result) => {
		let normalizedResult = this.normalizeCategoryNames(result);
		normalizedResult = this.normalizeDates(normalizedResult);
		normalizedResult = this.calculateTimeIntervals(normalizedResult);

		return normalizedResult;
	};
	normalizeCategoryNames = (result) => {
		let normalizedResult = JSON.parse(JSON.stringify(result));
		normalizedResult.forEach((element) => {
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

		return normalizedResult;
	};

	calculateTimeIntervals = (result) => {
		let normalizedResult = JSON.parse(JSON.stringify(result));
		normalizedResult.forEach((intent) => {
			intent.elements.forEach((element) => {
				// default is second
				const { value } = element.duration;

				let secondsVal = value;
				let minutesVal = value / 60;
				let hoursVal = value / 3600;

				minutesVal = minutesVal % 1 === 0 ? minutesVal : minutesVal.toFixed(3);
				hoursVal = hoursVal % 1 === 0 ? hoursVal : hoursVal.toFixed(3);
				element['durationForms'] = {
					seconds: secondsVal,
					minutes: minutesVal,
					hours: hoursVal,
				};
			});
		});
		return normalizedResult;
	};

	normalizeDates = (result) => {
		let normalizedResult = JSON.parse(JSON.stringify(result));
		normalizedResult.forEach((intent) => {
			intent.elements.forEach((element) => {
				// element.date = '2020-05-21T00:00:00.000Z';
				// element.date = new Date(element.date).getTime();
				element.date = element.date;
			});
		});
		return normalizedResult;
	};

	getHeaderJSX = () => {
		const { view } = this.state;

		switch (view) {
			case 'day':
				return (
					<div className='header'>
						<h1>Today</h1>
						<span>Your stats for today</span>
						<hr></hr>
					</div>
				);
			case 'week':
				return (
					<div className='header'>
						<h1>Week</h1>
						<span>Your week at a glance</span>
						<hr></hr>
					</div>
				);
			case 'month':
				return (
					<div className='header'>
						<h1>Month</h1>
						<span>Your month at a glance</span>
						<hr></hr>
					</div>
				);
			default:
				return (
					<div className='header'>
						<h1>Today</h1>
						<span>Your stats for today</span>
						<hr></hr>
					</div>
				);
		}
	};

	handleDropDownItemClick = (dropDownItem) => {
		switch (dropDownItem) {
			case 'seconds':
				this.setState({
					dropDownItemStatus: {
						secondsSelected: true,
						minutesSelected: false,
						hoursSelected: false,
					},
					timeInterval: 'seconds',
				});
				break;
			case 'minutes':
				this.setState({
					dropDownItemStatus: {
						secondsSelected: false,
						minutesSelected: true,
						hoursSelected: false,
					},
					timeInterval: 'minutes',
				});
				break;
			case 'hours':
				this.setState({
					dropDownItemStatus: {
						secondsSelected: false,
						minutesSelected: false,
						hoursSelected: true,
					},
					timeInterval: 'hours',
				});
				break;
		}
	};

	render() {
		const { intents, view, dropDownItemStatus, timeInterval } = this.state;
		return (
			<React.Fragment>
				<div className='metrics-page-container'>
					{this.getHeaderJSX()}
					<UncontrolledDropdown>
						<DropdownToggle caret>Time Interval</DropdownToggle>
						<DropdownMenu>
							<DropdownItem
								disabled={dropDownItemStatus.secondsSelected}
								onClick={() => {
									this.handleDropDownItemClick('seconds');
								}}
							>
								Seconds
							</DropdownItem>
							<DropdownItem
								disabled={dropDownItemStatus.minutesSelected}
								onClick={() => {
									this.handleDropDownItemClick('minutes');
								}}
							>
								Minutes
							</DropdownItem>
							<DropdownItem
								disabled={dropDownItemStatus.hoursSelected}
								onClick={() => {
									this.handleDropDownItemClick('hours');
								}}
							>
								Hours
							</DropdownItem>
						</DropdownMenu>
					</UncontrolledDropdown>
					<div className='pie-chart-container'>
						<div className='pie-chart-visual-container'>
							<PieChart intents={intents} id='pie-chart' />
						</div>
					</div>
					<div className='area-chart-container'>
						<div className='area-chart-visual-container'>
							<AreaChart intents={intents} timeInterval={timeInterval} />
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default MetricsPage;
