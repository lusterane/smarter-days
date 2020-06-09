import React, { Component } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';

import './Audio.css';

class Audio extends Component {
	state = {
		wav: '',
		utterance: '',
	};

	handleRecordClick = (e) => {
		console.log(e);
	};

	async getAudioUtterance(wav) {
		console.log('HTTP CALL: getAudioUtterance');

		const endpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:5000';
		const response = await fetch(endpoint + `/audio/`, {
			method: 'POST',
			responseType: 'blob',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ wav: wav }),
		}).then((result) => {
			this.setState({
				utterance: result,
			});
			return result;
		});

		const json = await response.json();
		console.log(json);
	}

	handleMicrophoneClick = () => {
		alert('Sorry, this feature is not implemented yet');
	};

	render() {
		const { wav } = this.state;
		return (
			<React.Fragment>
				<div className='' id='microphone'>
					<FontAwesomeIcon
						icon={faMicrophone}
						size='2x'
						className='disable'
						onClick={this.handleMicrophoneClick}
					/>
				</div>
			</React.Fragment>
		);
	}
}

export default Audio;
