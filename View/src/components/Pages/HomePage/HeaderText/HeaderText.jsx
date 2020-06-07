import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './HeaderText.css';

class HeaderText extends Component {
	state = {};
	render() {
		return (
			<React.Fragment>
				<div className='header-text-container'>
					<div className='title'>
						<Link className='link-option remove-dec' to='/'>
							<h1>smarter days</h1>
						</Link>
						<span>take control of your life</span>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default HeaderText;
