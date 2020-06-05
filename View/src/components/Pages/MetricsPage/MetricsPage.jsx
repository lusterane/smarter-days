import React, { Component } from 'react';

import {
	UncontrolledDropdown,
	DropdownItem,
	Nav,
	NavItem,
	DropdownToggle,
	DropdownMenu,
	NavLink,
} from 'reactstrap';

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
					let use_result = this.calculateTimeIntervals(result);
					use_result = this.normalizeCategoryNames(use_result);

					let filteredIntents = this.stepFunction(use_result);

					this.setState({
						intents: use_result, // original
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

	stepFunction = (intents, paramView) => {
		let ret_intents = this.sortByDates(intents);
		ret_intents = this.filterForDates(ret_intents, paramView);
		ret_intents = this.setSumDuration(ret_intents);
		ret_intents = this.normalizeDatesToTimezone(ret_intents);

		return ret_intents;
	};

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

	sortByDates = (intents) => {
		const sortedIntents = JSON.parse(JSON.stringify(intents));

		sortedIntents.forEach((intent) => {
			intent.elements.sort((a, b) => {
				return new Date(a.date).getTime() - new Date(b.date).getTime();
			});
		});

		return sortedIntents;
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

	normalizeDatesToTimezone = (result) => {
		let normalizedResult = JSON.parse(JSON.stringify(result));
		normalizedResult.forEach((intents) => {
			intents.elements.forEach((element) => {
				//element.date = new Date(element.date);
			});
		});

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
					filteredIntents: this.stepFunction(state.intents, 'day'),
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
					filteredIntents: this.stepFunction(state.intents, 'week'),
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
					filteredIntents: this.stepFunction(state.intents, 'month'),
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
			view,
		} = this.state;
		return (
			<React.Fragment>
				<div className='metrics-page-container'>
					<Nav tabs className='view-nav'>
						<NavItem>
							<NavLink
								active={view === 'day'}
								onClick={() => {
									this.handleViewDropDownClick('day');
								}}
								className='pointer'
							>
								Day
							</NavLink>
						</NavItem>
						<NavItem>
							<NavLink
								active={view === 'week'}
								onClick={() => {
									this.handleViewDropDownClick('week');
								}}
								className='pointer'
							>
								Week
							</NavLink>
						</NavItem>
						<NavItem>
							<NavLink
								active={view === 'month'}
								onClick={() => {
									this.handleViewDropDownClick('month');
								}}
								className='pointer'
							>
								Month
							</NavLink>
						</NavItem>
					</Nav>

					<div className='visualizations-container'>
						<div className='pie-chart-container'>
							<div className='pie-chart-visual-container'>
								<PieChart intents={filteredIntents} id='pie-chart' />
							</div>
						</div>
						<div className='time-dropdown'>
							<UncontrolledDropdown>
								<DropdownToggle tag='a' className='nav-link' caret>
									Displaying in {timeInterval}
								</DropdownToggle>
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
						</div>
						<div className='area-chart-container'>
							<div className='area-chart-visual-container'>
								<AreaChart intents={filteredIntents} timeInterval={timeInterval} />
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default MetricsPage;
