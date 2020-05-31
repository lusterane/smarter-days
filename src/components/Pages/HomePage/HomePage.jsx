import React, { Component } from 'react';

import { Col, Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';

import './HomePage.css';

class HomePage extends Component {
	state = {};
	render() {
		return (
			<React.Fragment>
				<div className='home-page-container'>
					<Form className='user-input-form'>
						<FormGroup row>
							<div className='user-input-row-wrapper'>
								<Input
									className='user-input-box'
									type='email'
									name='email'
									id='exampleEmail'
									placeholder='Try this, "I spent 4 hours emailing coworkers for work"'
								/>
								<div className='microphone-container'>
									<FontAwesomeIcon
										icon={faMicrophone}
										size='2x'
										className='pointer'
									/>
								</div>
							</div>
						</FormGroup>
					</Form>
				</div>
			</React.Fragment>
		);
	}
}

export default HomePage;
