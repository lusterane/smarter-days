import React, { Component } from "react";

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
  Progress,
  Alert,
} from "reactstrap";

import HeaderText from "./HeaderText/HeaderText";
import Audio from "./Audio/Audio";

import "./HomePage.css";

const emptyParsedResult = {
  text: "",
  category: "",
  action: "",
  duration: { unit: "second", value: -1 },
  dateTime: "",
  fromDateTime: "",
  toDateTime: "",
};

class HomePage extends Component {
  state = {
    userInput: "",
    utterance: {},
    parsedResult: emptyParsedResult,
    toast: {
      show: false,
      icon: "warning",
      title: "-",
      message: "-",
    },
    sampleText: [
      "I did programming for work for three hours",
      "I did paperwork for work for thirty minutes",
      "I did construction for work for an hour and fifteen minutes",
      "I proofread resumes for work from 12 pm to 3 pm",
      "I wrote articles for work from 9 pm to 11 pm",
      "I crafted tables for work from 7 am to 12 pm",
      "I waited tables for work in Austin, TX for five hours",
      "I debugged code for work in Seattle, WA for half an hour",
      "I babysat toddlers for work in Washington D.C. for nine hours",
      "I ran for an hour",
      "I lifted weights for two hours",
      "I went swimming for half an hour",
      "I did gymnastics from 7 am to 8 am",
      "I danced from 5 pm to 9 pm",
      "I did yoga from 5 am to 6 am",
      "I went biking in Oklahoma for five hours",
      "I did stretching at the gym for an hour",
      "I did jumping jacks at home for five minutes",
      "I studied biology for two hours",
      "I did economics for three hours",
      "I practiced German for an hour",
      "I did economics from 8 am to 9 am",
      "I did astronomy from 9 pm to 11 pm",
      "I did philosophy from 8 am to 10 am",
    ],
    isLoaded: false,
    cancelModalOpen: false,
    audioModalOpen: false,
    uploadModalOpen: false,
    postDBTimeout: "",
    confirm: true,
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleLoadSample = () => {
    const { sampleText, userInput } = this.state;
    const min = 0;
    const max = sampleText.length - 1;
    let samePrev = true;
    while (samePrev) {
      const randIndex = Math.floor(Math.random() * (max - min + 1)) + min;
      const newText = sampleText[randIndex];
      if (newText !== userInput) {
        this.setState({ userInput: newText });
        samePrev = false;
      }
    }
  };

  async onFormSubmit(e) {
    e.preventDefault();
    if (this.state.userInput !== "") {
      const response = await this.getUtteranceHTTP();
      if (response === 200) {
        this.setState({ userInput: "" });
      }
    }
  }

  toggledIsLoaded = () => {
    this.setState((state, props) => ({
      isLoaded: !state.isLoaded,
    }));
  };

  async getUtteranceHTTP() {
    console.log("HTTP CALL: getUtteranceHTTP");
    this.toggledIsLoaded();
    const endpoint =
      process.env.REACT_APP_API_ENDPOINT || "http://localhost:5000";
    const response = fetch(endpoint + `/utterance/nlp/` + this.state.userInput)
      .then((res) => res.json({ message: "Recieved" }))
      .then(
        (result) => {
          this.setState({
            utterance: result,
          });
          this.parseUtteranceResult(result);
          let message = "-";
          let title = "Notice";
          if (this.validateData()) {
            title = "Success!";
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
            this.showToast("success", title, message);
            console.log("valid utterance");
            return 200;
          } else {
            title = "Dang";
            message = `Sorry, I don't understand that one`;
            this.showToast("danger", title, message);
            console.log("invalid utterance");
            return 500;
          }
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log("error");
          this.setState({
            error,
          });
          return 500;
        }
      );

    response.then(() => {
      this.toggledIsLoaded();
    });
    return await response;
  }

  normalizeCategoryName = (name) => {
    switch (name) {
      case "log_exercising":
        return "EXERCISE";
      case "log_studying":
        return "STUDY";
      case "log_resting":
        return "REST";
      default:
        return "WORK";
    }
  };
  parseUtteranceResult = (result) => {
    let buildParsedResult = { ...emptyParsedResult };
    const { intents, entities, text } = result;

    let lowConf = false;

    buildParsedResult.text = text;

    if (intents.length !== 0 && intents[0].confidence >= 0.6) {
      buildParsedResult.category = intents[0].name;
      Object.values(entities).forEach((element) => {
        const currentElement = element[0];
        if (currentElement.confidence <= 0.6) {
          lowConf = true;
        } else {
          if (currentElement.name.includes("wit$duration")) {
            buildParsedResult.duration.unit = currentElement.normalized.unit;
            buildParsedResult.duration.value = currentElement.normalized.value;
          } else if (currentElement.name.includes("wit$datetime")) {
            buildParsedResult.dateTime =
              currentElement.value === undefined
                ? new Date()
                : new Date(currentElement.value);
            buildParsedResult.fromDateTime = currentElement.from
              ? {
                  grain: currentElement.from.grain,
                  value: currentElement.from.value,
                }
              : "";
            buildParsedResult.toDateTime = currentElement.to
              ? {
                  grain: currentElement.to.grain,
                  value: currentElement.to.value,
                }
              : "";
          } else {
            // everything else
            buildParsedResult.action = currentElement.value;
          }
        }
      });
    } else {
      lowConf = true;
    }

    if (buildParsedResult.dateTime === "") {
      buildParsedResult.dateTime = new Date();
    }

    this.setState({ parsedResult: buildParsedResult });
  };

  async postUtteranceToDatabase() {
    console.log("HTTP CALL: postUtteranceToDatabase");

    const requestOptions = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this.state.parsedResult),
    };

    const endpoint =
      process.env.REACT_APP_API_ENDPOINT || "http://localhost:5000";
    const response = await fetch(
      endpoint + `/utterance/entries/`,
      requestOptions
    ).then(
      (result) => {
        return result.status;
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        console.log("error");
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
    return this.state.parsedResult.category === "" ? false : true;
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

  toggleAudioModal = () => {
    this.setState((state, props) => ({
      audioModalOpen: !state.audioModalOpen,
    }));
  };

  toggleUploadModal = () => {
    this.setState((state, props) => ({
      uploadModalOpen: !state.uploadModalOpen,
    }));
  };

  toggleCancelModal = () => {
    this.setState((state, props) => ({
      cancelModalOpen: !state.cancelModalOpen,
    }));
  };

  clearDBPostTimeout = () => {
    clearTimeout(this.state.postDBTimeout);
  };

  render() {
    const {
      toast,
      isLoaded,
      cancelModalOpen,
      audioModalOpen,
      uploadModalOpen,
    } = this.state;
    const closeBtn = (
      <button className="close" onClick={this.toggleCancelModal}>
        &times;
      </button>
    );
    return (
      <React.Fragment>
        <div className="home-page-container">
          <Modal isOpen={cancelModalOpen} toggle={this.toggleCancelModal}>
            <ModalHeader toggle={this.toggleCancelModal} close={closeBtn}>
              Are you sure?
            </ModalHeader>
            <ModalBody>
              <p>
                Clicking 'Don't Log' will stop your activity from being logged.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => {
                  this.toggleCancelModal();
                }}
              >
                Nevermind
              </Button>{" "}
              <Button
                color="danger"
                onClick={() => {
                  this.toggleCancelModal();
                  this.showToast(
                    "warning",
                    "Canceled",
                    "Logging has been canceled"
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
          <Modal isOpen={audioModalOpen} toggle={this.toggleAudioModal}>
            <ModalHeader toggle={this.toggleAudioModal}>Record</ModalHeader>
            <ModalBody>
              <div className="text-center">
                <Alert color="warning">
                  Sorry, this feature is too buggy so we removed it for now.
                </Alert>
                <div className="disable">
                  <p>Recording in progress ...</p>
                  <Progress />
                  <p>0%</p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.toggleAudioModal}>
                Done
              </Button>{" "}
              <Button color="secondary" onClick={this.toggleAudioModal}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
          <Modal isOpen={uploadModalOpen} toggle={this.toggleUploadModal}>
            <ModalHeader toggle={this.toggleUploadModal}>
              Upload Audio
            </ModalHeader>
            <ModalBody>
              <div className="text-center"></div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.toggleUploadModal}>
                Do Something
              </Button>{" "}
              <Button color="secondary" onClick={this.toggleUploadModal}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
          <Alert color="info" className="discontinuation-notice">
            <strong>📢 Notice:</strong> This project is no longer actively
            maintained due to infrastructure costs. Curious how it worked?
            <br />
            <a
              href="https://www.youtube.com/watch?v=O_BACzyrwBU"
              target="_blank"
              rel="noopener noreferrer"
              className="demo-link"
            >
              🎬 Check out the demo here!
            </a>
          </Alert>
          <HeaderText />
          {isLoaded ? (
            <Spinner className="text-box-spinner" animation="border" />
          ) : (
            ""
          )}
          <Form
            className="user-input-form"
            onSubmit={this.onFormSubmit.bind(this)}
          >
            <FormGroup row className="form-group">
              <div className="user-input-row-wrapper">
                <Input
                  className="user-input-box"
                  type="text"
                  name="userInput"
                  id="text-box"
                  onChange={this.handleChange.bind(this)}
                  value={this.state.userInput}
                  placeholder='Try this, "I spent 4 hours emailing coworkers for work"'
                />
                <div className="microphone-container">
                  <Audio handleMicrophoneClick={this.toggleAudioModal} />
                </div>
              </div>

              <div className="submit-btn-container">
                <Button outline color="secondary" submit="true">
                  Log activity
                </Button>
              </div>
            </FormGroup>
            <UncontrolledPopover
              placement="right"
              trigger="hover"
              target="microphone"
            >
              <PopoverBody>
                <div className="popover-body">
                  <h2>Privacy</h2>
                  <p>
                    We do not sell or distribute user data. Recording starts and
                    stops at your request.
                  </p>
                </div>
              </PopoverBody>
            </UncontrolledPopover>
            <div className="random-activity-text">
              Don't know what to say? Try a random&nbsp;
              <span className="link" onClick={this.handleLoadSample}>
                phrase
              </span>
              .
            </div>
          </Form>

          {toast.show ? (
            <Toast className="home-toast">
              <div className="toast-text">
                <ToastHeader icon={toast.icon}>{toast.title}</ToastHeader>
                <ToastBody>{toast.message}</ToastBody>
              </div>
            </Toast>
          ) : (
            ""
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default HomePage;
