import React, { Component } from 'react';

import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import PieChart from './PieChart/PieChart';
import AreaChart from './AreaChart/AreaChart';

import './MetricsPage.css';

class MetricsPage extends Component {
	state = {
		intents: [],
		view: 'week',
		timeInterval: 'seconds',
		timeDropDownStatus: {
			secondsSelected: true,
			minutesSelected: false,
			hoursSelected: false,
		},
		viewDropDownStatus: {
			daySelected: false,
			weekSelected: true,
			monthSelected: false,
		},
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
					let filteredIntents = this.filterForDates(result);
					filteredIntents = this.calculateTimeIntervals(filteredIntents);
					filteredIntents = this.setSumDuration(filteredIntents);
					filteredIntents = this.normalizeStepFunction(filteredIntents);

					let normalizedResult = this.normalizeStepFunction(result);
					normalizedResult = this.calculateTimeIntervals(normalizedResult);

					this.setState({
						intents: normalizedResult,
						filteredIntents: filteredIntents,
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

	setSumDuration = (intents) => {
		const newState = JSON.parse(JSON.stringify(intents));
		newState.forEach((intent) => {
			let sumDuration = 0;
			intent.elements.forEach((element) => {
				sumDuration += element.duration.value;
			});
			intent.sumDuration = { unit: 'second', value: sumDuration };
		});

		return newState;
	};

	filterForDates = (intents, paramView) => {
		const view = paramView ? paramView : this.state.view;

		let filteredIntents = JSON.parse(JSON.stringify(intents));

		const nowDate = new Date();
		// doesn't have to be UTC
		const ndYear = nowDate.getFullYear();
		const ndMonth = nowDate.getMonth();
		const ndDay = nowDate.getDate();

		if (view === 'day') {
			const fromDate = new Date(ndYear, ndMonth, ndDay, 0, 0, 0, 0);
			const toDate = new Date(ndYear, ndMonth, ndDay, 23, 59, 59, 999);
			filteredIntents.forEach((intent) => {
				intent.elements = intent.elements.filter(
					(element) =>
						fromDate.getTime() < new Date(element.date).getTime() &&
						toDate.getTime() > new Date(element.date).getTime()
				);
			});
			// console.log('day');
			// console.log('fromdate', fromDate);
			// console.log('toDate', toDate);
		} else if (view === 'week') {
			let fromDate = new Date(nowDate.setDate(nowDate.getDate() - nowDate.getDay() + 1));
			let toDate = new Date(nowDate.setDate(nowDate.getDate() - nowDate.getDay() + 7));
			fromDate.setHours(0, 0, 0, 0);
			toDate.setHours(23, 59, 59, 999);
			filteredIntents.forEach((intent) => {
				intent.elements = intent.elements.filter(
					(element) =>
						fromDate.getTime() < new Date(element.date).getTime() &&
						toDate.getTime() > new Date(element.date).getTime()
				);
			});

			// console.log('week');
			// console.log('fromdate', fromDate);
			// console.log('toDate', toDate);
		} else if (view === 'month') {
			let fromDate = new Date(ndYear, ndMonth, 1);
			let toDate = new Date(ndYear, ndMonth + 1, 0);
			fromDate.setHours(0, 0, 0, 0);
			toDate.setHours(23, 59, 59, 999);
			filteredIntents.forEach((intent) => {
				intent.elements = intent.elements.filter(
					(element) =>
						fromDate.getTime() < new Date(element.date).getTime() &&
						toDate.getTime() > new Date(element.date).getTime()
				);
			});

			// console.log('month');
			// console.log('fromdate', fromDate);
			// console.log('toDate', toDate);
		}
		return filteredIntents;
	};

	normalizeStepFunction = (result) => {
		let normalizedResult = this.normalizeCategoryNames(result);

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

	// ran once
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

	handleTimeDropDownClick = (dropDownItem) => {
		switch (dropDownItem) {
			case 'seconds':
				this.setState({
					timeDropDownStatus: {
						secondsSelected: true,
						minutesSelected: false,
						hoursSelected: false,
					},
					timeInterval: 'seconds',
				});
				break;
			case 'minutes':
				this.setState({
					timeDropDownStatus: {
						secondsSelected: false,
						minutesSelected: true,
						hoursSelected: false,
					},
					timeInterval: 'minutes',
				});
				break;
			case 'hours':
				this.setState({
					timeDropDownStatus: {
						secondsSelected: false,
						minutesSelected: false,
						hoursSelected: true,
					},
					timeInterval: 'hours',
				});
				break;
		}
	};

	handleViewDropDownClick = (dropDownItem) => {
		switch (dropDownItem) {
			case 'day':
				this.setState((state, props) => ({
					viewDropDownStatus: {
						daySelected: true,
						weekSelected: false,
						monthSelected: false,
					},
					view: 'day',
					filteredIntents: this.setSumDuration(this.filterForDates(state.intents, 'day')),
				}));
				break;
			case 'week':
				this.setState((state, props) => ({
					viewDropDownStatus: {
						daySelected: false,
						weekSelected: true,
						monthSelected: false,
					},
					view: 'week',
					filteredIntents: this.setSumDuration(
						this.filterForDates(state.intents, 'week')
					),
				}));
				break;
			default:
				// month
				this.setState((state, props) => ({
					viewDropDownStatus: {
						daySelected: false,
						weekSelected: false,
						monthSelected: true,
					},
					view: 'month',
					filteredIntents: this.setSumDuration(
						this.filterForDates(state.intents, 'month')
					),
				}));
				break;
		}
	};

	render() {
		const {
			filteredIntents,
			viewDropDownStatus,
			timeDropDownStatus,
			timeInterval,
		} = this.state;
		return (
			<React.Fragment>
				<div className='metrics-page-container'>
					{this.getHeaderJSX()}
					<UncontrolledDropdown>
						<DropdownToggle caret>Time Interval</DropdownToggle>
						<DropdownMenu>
							<DropdownItem
								disabled={timeDropDownStatus.secondsSelected}
								onClick={() => {
									this.handleTimeDropDownClick('seconds');
								}}
							>
								Seconds
							</DropdownItem>
							<DropdownItem
								disabled={timeDropDownStatus.minutesSelected}
								onClick={() => {
									this.handleTimeDropDownClick('minutes');
								}}
							>
								Minutes
							</DropdownItem>
							<DropdownItem
								disabled={timeDropDownStatus.hoursSelected}
								onClick={() => {
									this.handleTimeDropDownClick('hours');
								}}
							>
								Hours
							</DropdownItem>
						</DropdownMenu>
					</UncontrolledDropdown>
					<UncontrolledDropdown>
						<DropdownToggle caret>View</DropdownToggle>
						<DropdownMenu>
							<DropdownItem
								disabled={viewDropDownStatus.daySelected}
								onClick={() => {
									this.handleViewDropDownClick('day');
								}}
							>
								Day
							</DropdownItem>
							<DropdownItem
								disabled={viewDropDownStatus.weekSelected}
								onClick={() => {
									this.handleViewDropDownClick('week');
								}}
							>
								Week
							</DropdownItem>
							<DropdownItem
								disabled={viewDropDownStatus.monthSelected}
								onClick={() => {
									this.handleViewDropDownClick('month');
								}}
							>
								Month
							</DropdownItem>
						</DropdownMenu>
					</UncontrolledDropdown>
					<div className='pie-chart-container'>
						<div className='pie-chart-visual-container'>
							<PieChart intents={filteredIntents} id='pie-chart' />
						</div>
					</div>
					<div className='area-chart-container'>
						<div className='area-chart-visual-container'>
							<AreaChart intents={filteredIntents} timeInterval={timeInterval} />
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default MetricsPage;
