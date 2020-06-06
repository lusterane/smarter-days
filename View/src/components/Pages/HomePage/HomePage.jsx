import React, { Component } from 'react';

import {
	Col,
	Button,
	Form,
	FormGroup,
	Label,
	Input,
	FormText,
	Toast,
	ToastBody,
	ToastHeader,
	Spinner,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import HeaderText from './HeaderText/HeaderText';

import './HomePage.css';

const emptyParsedResult = {
	text: '',
	category: '',
	action: '',
	duration: { unit: 'second', value: -1 },
	dateTime: '',
	fromDateTime: '',
	toDateTime: '',
};

class HomePage extends Component {
	state = {
		userInput: 'I went on a 20 minute run',
		utterance: {},
		parsedResult: emptyParsedResult,
		toast: {
			show: false,
			icon: 'warning',
			title: '-',
			message: '-',
		},
		isLoaded: false,
	};

	handleChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	onFormSubmit = (e) => {
		e.preventDefault();
		if (this.state.userInput !== '') {
			this.getUtteranceHTTP();
		}
	};

	toggledIsLoaded = () => {
		this.setState((state, props) => ({
			isLoaded: !state.isLoaded,
		}));
	};

	async getUtteranceHTTP() {
		console.log('HTTP CALL: getUtteranceHTTP');
		this.toggledIsLoaded();
		const response = fetch('http://localhost:5000/utterance/nlp/' + this.state.userInput)
			.then((res) => res.json({ message: 'Recieved' }))
			.then(
				(result) => {
					this.setState({
						utterance: result,
					});
					this.parseUtteranceResult(result);

					let message = '-';
					let title = 'Notice';
					if (this.validateData()) {
						const res = this.postUtteranceToDatabase();
						res.then((res) => {
							if (res === 200) {
								message = 'Your activity has been successfuly added!';
								this.showToast('success', title, message);
							} else {
								message =
									'Sorry, something went wrong on our end. Give us a moment while we try to sort it out';
								this.showToast('warning', title, message);
							}
							console.log('valid utterance');
						});
					} else {
						message = `Sorry, I don't understand '${this.state.parsedResult.text}'`;
						this.showToast('danger', title, message);
						console.log('invalid utterance');
					}
				},
				// Note: it's important to handle errors here
				// instead of a catch() block so that we don't swallow
				// exceptions from actual bugs in components.
				(error) => {
					console.log('error');
					this.setState({
						error,
					});
				}
			);

		response.then(() => {
			this.toggledIsLoaded();
		});
	}

	parseUtteranceResult = (result) => {
		let buildParsedResult = { ...emptyParsedResult };
		const { intents, entities, text } = result;

		let lowConf = false;

		buildParsedResult.text = text;

		if (intents.length !== 0 && intents[0].confidence >= 0.8) {
			buildParsedResult.category = intents[0].name;
			Object.values(entities).forEach((element) => {
				const currentElement = element[0];
				if (currentElement.confidence <= 0.8) {
					lowConf = true;
				} else {
					if (currentElement.name.includes('wit$duration')) {
						buildParsedResult.duration.unit = currentElement.normalized.unit;
						buildParsedResult.duration.value = currentElement.normalized.value;
					} else if (currentElement.name.includes('wit$datetime')) {
						buildParsedResult.dateTime =
							currentElement.value === undefined
								? new Date()
								: new Date(currentElement.value);
						buildParsedResult.fromDateTime = currentElement.from
							? {
									grain: currentElement.from.grain,
									value: currentElement.from.value,
							  }
							: '';
						buildParsedResult.toDateTime = currentElement.to
							? {
									grain: currentElement.to.grain,
									value: currentElement.to.value,
							  }
							: '';
					} else {
						// everything else
						buildParsedResult.action = currentElement.value;
					}
				}
			});
		} else {
			lowConf = true;
		}

		if (buildParsedResult.dateTime === '') {
			buildParsedResult.dateTime = new Date();
		}

		this.setState({ parsedResult: buildParsedResult });
	};

	async postUtteranceToDatabase() {
		console.log('HTTP CALL: postUtteranceToDatabase');

		const requestOptions = {
			method: 'POST',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			body: JSON.stringify(this.state.parsedResult),
		};
		const response = await fetch(
			'http://localhost:5000/utterance/entries/',
			requestOptions
		).then(
			(result) => {
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

	// checks if data is correct
	validateData = () => {
		return this.state.parsedResult.category === '' ? false : true;
	};

	showToast = (icon, title, message) => {
		this.setState(
			{
				toast: {
					show: true,
					icon: icon,
					title: title,
					message: message,
				},
			},
			() => {
				setTimeout(() => {
					this.setState((state, props) => ({ toast: { ...state.toast, show: false } }));
				}, 3000);
			}
		);
	};

	render() {
		const { toast, isLoaded } = this.state;
		return (
			<React.Fragment>
				<div className='home-page-container'>
					<HeaderText />
					{isLoaded ? <Spinner className='text-box-spinner' animation='border' /> : ''}
					<Form className='user-input-form' onSubmit={this.onFormSubmit.bind(this)}>
						<FormGroup row>
							<div className='user-input-row-wrapper'>
								<Input
									className='user-input-box'
									type='text'
									name='userInput'
									id='text-box'
									onChange={this.handleChange.bind(this)}
									value={this.state.userInput}
									placeholder='Try this, "I spent 4 hours emailing coworkers for work"'
								/>
							</div>
						</FormGroup>
						<div id='or-text'>or</div>
						<div className='microphone-container'>
							<FontAwesomeIcon icon={faMicrophone} size='2x' className='pointer' />
						</div>
					</Form>

					{toast.show ? (
						<Toast className='home-toast'>
							<ToastHeader icon={toast.icon}>{toast.title}</ToastHeader>
							<ToastBody>{toast.message}</ToastBody>
						</Toast>
					) : (
						''
					)}
				</div>
			</React.Fragment>
		);
	}
}

export default HomePage;
