import React from "react";
import "./App.css";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import FlickrImageList from "./components/FlickrImageList.js";
import ImageModal from "./components/ImageModal.js";
import constants from "./constants.js";
import Loader from 'react-loader-spinner';
import { Button } from 'react-bootstrap';
import { availableScrollArea, debounce, throttle, httpStatus, parseJSON } from "./utils.js";

const buttonStyle = {
	backgroundColor:"black",
	color:"white",
	height:"28px",
	margin: "15px",
};

const searchHistory = {
	marginBottom: "5px",
	display: "inline-block",
	fontSize: "15px",
}

export default class App extends React.Component {
	constructor(props) {
		super(props);
		const queriesFromStorage = JSON.parse(localStorage.getItem(constants.STORAGE_KEY));
		this.state = {
			searchText: "",
			imageList: [],
			pageNumber: 1,
			showPopUp: false,
			popUpImage: null,
			queries: queriesFromStorage ? queriesFromStorage : [],
			loading: false,
			noResponse: false,
		};
		// Function bindings
		this.onSearchInputChange = this.onSearchInputChange.bind(this);
		this.handleImageClick = this.handleImageClick.bind(this);
		this.onPopUpHide = this.onPopUpHide.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.clearHistory = this.clearHistory.bind(this);
		this.callFlickr = this.callFlickr.bind(this);
	}

	/* Make API call for the query */
	callFlickr(text) {
		const url = constants.BASE_URL + "&text=" + text || this.state.searchText;
				fetch(url)
					.then(httpStatus)
					.then(this.setState({loading: true}))
					.then(parseJSON)
					.then(resp => {
						if (resp.photos.total === "0") {
							this.setState({ imageList: [], loading: false, noResponse: true});	
						} else {
							this.setState({ imageList: resp.photos.photo, loading: false, noResponse: false});
						}
					})
					.catch(err => {
						console.log(err);
					});
	}


	componentDidMount() {
		/* Throttled scroll listener for infinite scrolling */
		window.onscroll = throttle(() => {
			if (availableScrollArea()) return;
			this.handleScroll();
		}, 1000);

		/* Debounced function for search based on input text to mimimize network request on every character typed */
		this.makeDebouncedSearch = debounce(() => {
			/* Save search query */
			if (this.state.searchText !== "") {
				this.state.queries.push(this.state.searchText);
				this.setState({ queries: this.state.queries, noResponse: false }, this.updateLocalStorage());

				/* Make API call for the query */
				this.callFlickr();				
			}
		}, 1000);
	}

	
	updateLocalStorage() {
		if (this.state.queries.length > 9) {
			this.state.queries.shift();
		}
		localStorage.setItem(constants.STORAGE_KEY, JSON.stringify(this.state.queries));
	}

	onSearchInputChange(evt) {
		const searchText = evt.currentTarget.value;
		this.setState({ searchText, noResponse: false });
		const trimmedText = searchText.replace(/\s+$/, "");
		if (trimmedText.length > 0) this.makeDebouncedSearch(trimmedText);
	}

	clearHistory() {
		localStorage.clear();
		this.setState({ queries: [] });
	}

	handleRecentSearch(idx) {
		const trimmedSearch = (this.state.queries[idx]).replace(/\s+$/, "");
		this.state.queries.push(trimmedSearch);
		this.setState({ searchText: trimmedSearch, queries: this.state.queries, noResponse: false }, this.updateLocalStorage());
		if (trimmedSearch.length > 0) {
			this.callFlickr(trimmedSearch);
		}

	}

	handleScroll() {
		let url = constants.BASE_URL + "&text=" + this.state.searchText + "&page=" + (this.state.pageNumber + 1);
		fetch(url)
			.then(httpStatus)
			.then(parseJSON)
			.then(resp => {
				resp.photos.photo.forEach(photo => this.state.imageList.push(photo));
				this.setState({
					pageNumber: resp.photos.page,
					imageList: this.state.imageList,
				});
			})
			.catch(err => {
				console.log(err);
			});
	}

	handleImageClick(idx) {
		this.setState({ popUpImage: this.state.imageList[idx] });
	}

	onPopUpHide() {
		this.setState({ popUpImage: null });
	}

	render() {
		if (this.state.loading) {
			return(
				<div className="app">
					<div className="app-header">
						<h2 style={{ margin: "1rem 0" }}>SupplyAI - Flickr Photo Search</h2>
						<div className="h-flex jc ac search-bar">
							<input
								type="text"
								placeholder="Search here.."
								className="search-input"
								value={this.state.searchText}
								onChange={this.onSearchInputChange}
							/>
						</div>
						{this.state.queries.length > 0 &&
							<div style={{ marginTop: "16px" }}>
								<h5 style={searchHistory}>
								Recent Searches
								</h5>
								{(this.state.queries.length !== 0) &&
								<Button style={buttonStyle} onClick={this.clearHistory}>
									Clear Search History
								</Button>}
								<ul className="h-flex jc">
									{this.state.queries.map((query, idx) =>
										<li key={idx} className="query" onClick={this.handleRecentSearch.bind(this, idx)}>
											{query}
										</li>
									)}
								</ul>
							</div>
						}
					</div>
					<div className="app-content">
				      	<Loader 
				        	type="ThreeDots"
					        color="#00BFFF"
					        height="100"	
					        width="100"
				      	/>
				    </div>
				</div>
		    );
		} else {
			return (
				<div className="app">
					<div className="app-header">
						<h2 style={{ margin: "1rem 0" }}>SupplyAI - Flickr Photo Search</h2>
						<div className="h-flex jc ac search-bar">
							<input
								type="text"
								placeholder="Search here.."
								className="search-input"
								value={this.state.searchText}
								onChange={this.onSearchInputChange}
							/>
						</div>
						{this.state.queries.length > 0 &&
							<div style={{ marginTop: "16px" }}>
								<h5 style={searchHistory}>
								Recent Searches
								</h5>
								{(this.state.queries.length !== 0) &&
								<Button style={buttonStyle} onClick={this.clearHistory}>
									Clear Search History
								</Button>}
								<ul className="h-flex jc">
									{this.state.queries.map((query, idx) =>
										<li key={idx} className="query" onClick={this.handleRecentSearch.bind(this, idx)}>
											{query}
										</li>
									)}
								</ul>
							</div>}
					</div>
					<div className="app-content" ref="appContent">
						{this.state.imageList.length
							? <FlickrImageList images={this.state.imageList} onImageClick={this.handleImageClick} />
							: (this.state.noResponse && this.state.searchText !== ""
								? <p style={{ margin: "1rem 0" }}>No Results found for search text : <strong>{this.state.searchText}</strong></p>
								: <p style={{ margin: "1rem 0" }}>Type image to search in the search bar</p>
							)
						}
						<ReactCSSTransitionGroup
							transitionName="popup-container"
							transitionEnterTimeout={400}
							transitionLeaveTimeout={200}
						>
							{this.state.popUpImage &&
								<ImageModal image={this.state.popUpImage} onHide={this.onPopUpHide} />}
						</ReactCSSTransitionGroup>
					</div>
				</div>
			);
		}
	}

	componentWillUnmount() {
		// Remove the listener for cleanup
		window.onscroll = undefined;
	}
}
