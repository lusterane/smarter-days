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
						<Link className='navbar-name link-option remove-dec' to='/'>
							smarter days
						</Link>
						<div className='links'>
							<Link className='link-option remove-dec' to='/'>
								home
							</Link>
							<Link className='link-option remove-dec' to='/metrics'>
								metrics
							</Link>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default Header;
