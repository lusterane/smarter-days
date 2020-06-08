import React, { Component } from 'react';

import {
	Button,
	Form,
	FormGroup,
	Input,
	Toast,
	ToastBody,
	ToastHeader,
	Spinner,
	UncontrolledPopover,
	PopoverBody,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from 'reactstrap';

import HeaderText from './HeaderText/HeaderText';
import Audio from './Audio/Audio';

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
		userInput: '',
		utterance: {},
		parsedResult: emptyParsedResult,
		toast: {
			show: false,
			icon: 'warning',
			title: '-',
			message: '-',
		},
		isLoaded: false,
		cancelModalOpen: false,
		postDBTimeout: '',
		confirm: true,
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
		const response = fetch(
			process.env.REACT_APP_API_ENDPOINT + '/utterance/nlp/' + this.state.userInput
		)
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
						title = 'Success!';
						const category = this.normalizeCategoryName(
							this.state.utterance.intents[0].name
						);
						message = (
							<div>
								<p>
									Logging your activity under <b>{category}</b>
								</p>
								{/* <div className='cancel-btn-wrapper'>
									<Button
										outline
										color='danger'
										onClick={this.toggleCancelModal}
										className='cancel-btn'
									>
										Cancel
									</Button>
								</div> */}
							</div>
						);
						this.postUtteranceToDatabase();
						this.showToast('success', title, message);
						// } else {
						// 	title = 'Oops';
						// 	message =
						// 		'Sorry, something went wrong on our end. Give us a moment while we try to sort it out';
						// 	this.showToast('warning', title, message);
						// }
						console.log('valid utterance');
					} else {
						title = 'Dang';
						message = `Sorry, I don't understand that one`;
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

	normalizeCategoryName = (name) => {
		switch (name) {
			case 'log_exercising':
				return 'EXERCISE';
			default:
				return 'WORK';
		}
	};
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
			process.env.REACT_APP_API_ENDPOINT + '/utterance/entries/',
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
				confirm: true,
			},
			() => {
				setTimeout(() => {
					this.setState(
						(state, props) => ({
							toast: { ...state.toast, show: false },
						})
						// () => {
						// 	if (
						// 		icon === 'success' &&
						// 		this.state.confirm &&
						// 		!this.state.cancelModalOpen
						// 	) {
						// 		this.postUtteranceToDatabase();
						// 		this.showToast(
						// 			'success',
						// 			'Logged',
						// 			'The activity has been logged!'
						// 		);
						// 	}
						// }
					);
				}, 3000);
			}
		);
	};

	toggleCancelModal = () => {
		this.setState((state, props) => ({ cancelModalOpen: !state.cancelModalOpen }));
	};

	clearDBPostTimeout = () => {
		clearTimeout(this.state.postDBTimeout);
	};

	render() {
		const { toast, isLoaded, cancelModalOpen } = this.state;
		const closeBtn = (
			<button className='close' onClick={this.toggleCancelModal}>
				&times;
			</button>
		);
		return (
			<React.Fragment>
				<div className='home-page-container'>
					<Modal isOpen={cancelModalOpen} toggle={this.toggleCancelModal}>
						<ModalHeader toggle={this.toggleCancelModal} close={closeBtn}>
							Are you sure?
						</ModalHeader>
						<ModalBody>
							<p>Clicking 'Don't Log' will stop your activity from being logged.</p>
						</ModalBody>
						<ModalFooter>
							<Button
								color='secondary'
								onClick={() => {
									this.toggleCancelModal();
								}}
							>
								Nevermind
							</Button>{' '}
							<Button
								color='danger'
								onClick={() => {
									this.toggleCancelModal();
									this.showToast(
										'warning',
										'Canceled',
										'Logging has been canceled'
									);
									this.setState({
										confirm: false,
									});
								}}
							>
								Don't Log
							</Button>
						</ModalFooter>
					</Modal>
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
								<div className='microphone-container'>
									<Audio />
								</div>
							</div>
						</FormGroup>
						<UncontrolledPopover placement='bottom' trigger='hover' target='microphone'>
							<PopoverBody>
								<div className='popover-body'>
									<h2>Privacy</h2>
									<p>
										We do not sell or distribute user data. Recording starts and
										stops at your request.
									</p>
								</div>
							</PopoverBody>
						</UncontrolledPopover>
					</Form>

					{toast.show ? (
						<Toast className='home-toast'>
							<div className='toast-text'>
								<ToastHeader icon={toast.icon}>{toast.title}</ToastHeader>
								<ToastBody>{toast.message}</ToastBody>
							</div>
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
