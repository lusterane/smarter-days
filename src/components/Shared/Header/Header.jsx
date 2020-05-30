import React, { Component } from 'react';

import './Header.css';

class Header extends Component {
	state = {};
	render() {
		return (
			<React.Fragment>
				<div className='header-container'>
					<h1>Day</h1>
					<span>Take control of your life</span>
				</div>
			</React.Fragment>
		);
	}
}

export default Header;
