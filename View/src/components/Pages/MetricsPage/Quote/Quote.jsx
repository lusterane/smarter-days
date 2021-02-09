import React, { Component } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteRight } from '@fortawesome/free-solid-svg-icons';
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons';

import './Quote.css';

class Quote extends Component {
	state = {
		quote: {
			author: '',
			text: '',
		},
		isLoaded: false,
	};
	componentDidMount() {
		this.setRandomQuote();
	}
	async setRandomQuote() {
		const quoteArr = await this.getQuote();
		const min = 0;
		const max = quoteArr.length - 1;
		const randomIndex = Math.floor(min + Math.random() * (max - min));

		this.setState({ quote: quoteArr[randomIndex], isLoaded: true });
	}
	async getQuote() {
		console.log('HTTP CALL: getQuote');

		const requestOptions = {
			method: 'GET',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		};
		const proxyurl = 'https://cors-anywhere.herokuapp.com/';
		const url = 'https://type.fit/api/quotes';
		const response = await fetch(url, requestOptions)
			.then((res) => res.json({ message: 'Recieved' }))
			.then(
				(result) => {
					return result;
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

	render() {
		const { text, author } = this.state.quote;
		const { isLoaded } = this.state;
		return (
			<React.Fragment>
				<div className='quote-container'>
					<div className='quote'>
						{isLoaded ? (
							<>
								<div className='text'>"{text}"</div>
								<div className='author'>-{author ? author : 'Unknown'}</div>
							</>
						) : (
							':^)'
						)}
						<FontAwesomeIcon icon={faQuoteRight} size='2x' className='faQuoteRight' />
						<FontAwesomeIcon icon={faQuoteLeft} size='2x' className='faQuoteLeft' />
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default Quote;
