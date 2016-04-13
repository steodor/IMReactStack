var React = require("react"),
	ptypes = React.PropTypes,
	ReactRedux = require("react-redux"),
	Log = require("./log"),	
	actions = require("../actions"),
	Link = require("react-router").Link;

var Home = React.createClass({
	propTypes: {
			
	},
	render: function(){
		
		return (
			<div>
				<Link to={"/about"}>About</Link>
				<br />
				<Link to={"/blogs"}>Blogs</Link>
				<br />
                <Link to={"/contact"}>Contact</Link>
				<br />
				{/* <Link to={"/admin"}>Authenticate</Link> */}
			</div>
		);
	},
});


module.exports = ReactRedux.connect()(Home);
