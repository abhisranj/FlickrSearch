import React from "react";
import { getImageUrl } from "../utils.js";

export default class ImageModal extends React.Component {
	render() {
		const { title, farm, server, id, secret } = this.props.image;
		return (
			<div className="image-popup-container" onClick={this.props.onHide}>
				<img
					className="popup-image"
					src={getImageUrl(farm, server, id, secret)}
					alt=""
					style={{ marginTop: "140px" }}
				/>
				<ul className="image-metadata">
					<li style={{ margin: "5px 0" }}>
						Title: {title}
					</li>
					<li style={{ margin: "5px 0" }}>
						ImageId: {id}
					</li>
				</ul>
			</div>
		);
	}
}
