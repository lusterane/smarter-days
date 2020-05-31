import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './Header.css';

class Header extends Component {
	state = {};

	render() {
		return (
			<React.Fragment>
				<div className='header-container'>
					<div className='navbar'>
						<span className='navbar-name pointer'>Day</span>
						<div className='links'>
							<Link className='link-option remove-dec' to='/'>
								Home
							</Link>
							<Link className='link-option remove-dec' to='/metrics'>
								Metrics
							</Link>
						</div>
					</div>
					<hr></hr>
					<div className='title'>
						<h1 className='pointer'>Day</h1>
						<span>Take control of your life</span>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default Header;
