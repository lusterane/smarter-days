import React, { Component } from 'react';
import { Alert } from 'reactstrap';

import './HowToPage.css';

class HowToPage extends Component {
	state = {};
	render() {
		return (
			<React.Fragment>
				<div className='how-to-page-container'>
					<Alert color='warning' className='discontinuation-notice'>
						<strong>⚠️ Project Discontinued:</strong> Due to rising cloud hosting and infrastructure costs, this project is no longer actively maintained. Thank you to everyone who used and supported Smarter Days!
						<br />
						<a href='https://www.youtube.com/watch?v=O_BACzyrwBU' target='_blank' rel='noopener noreferrer' className='demo-link'>
							📺 Watch the demo video
						</a>
					</Alert>
					<div className='how-it-works-container'>
						<div className='sub-container'>
							<h1>How it works</h1>
							<hr></hr>
						</div>
						<div className='sub-container'>
							<h3>Examples</h3>
							<p>
								Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quidem est
								sunt ullam corporis. Molestiae eius enim explicabo eveniet quasi
								necessitatibus sequi placeat perferendis iusto minima!
							</p>
						</div>
						<div className='sub-container'>
							<h3>Demo</h3>
							<div className='video-container'>
								<iframe
									width='1000'
									height='500'
									src='https://www.youtube.com/embed/jGjYmGAKHzU'
									frameborder='0'
									allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
									allowfullscreen
								></iframe>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default HowToPage;
