import React, { Component } from 'react';

import './AboutPage.css';

class AboutPage extends Component {
	state = {};
	render() {
		return (
			<React.Fragment>
				<div className="about-page-container">
					<div className="demo-container">
						<div className="sub-container">
							<h1>Demo</h1>
							<hr></hr>
							<div className="video-container">
								<iframe
									width="1000"
									height="500"
									src="https://www.youtube.com/embed/O_BACzyrwBU"
									frameborder="0"
									allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
									allowfullscreen
								></iframe>
							</div>
						</div>
					</div>
					<div className="what-is-this-container">
						<div className="sub-container">
							<h1>What is this</h1>
							<hr></hr>
							<p>
								Facebook Machine Learning Hackathon submission. This project is a
								productivity application that utilizes a{' '}
								<b>Machine Learning model trained using Wit.ai</b> to understand
								natural language.
							</p>
						</div>
						<div className="sub-container">
							<h1>What it does</h1>
							<hr></hr>

							<p>
								Smarter Days helps you log your activities throughout the day to
								gain insight into how much time you spend on things. The goal here
								is to help you to better manage and optimize your time and have more
								efficient and smarter days!
							</p>
						</div>
					</div>
					<div className="about-us-container">
						<div className="sub-container">
							<h1>About us</h1>
							<hr></hr>
							<div className="sub-container">
								<p>
									We are a 2 person team (Toby Chow, Richard Lin) that loves
									learning and creating new things. We are in our undergraduates
									for Computer Science with big dreams.
								</p>
								<p>
									We spent the past month tirelessly working on this and we are
									ecstatic to see it come together. The challenge was great but
									the learning experience was definitely the most valuable to us.
									If the application catches on, we hope to make improvements and
									see where it goes! :)
								</p>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default AboutPage;
