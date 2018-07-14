import React, { Component } from 'react';
import './App.css';
import { svg } from './Svg';
import FullView from './FullView';

import $ from 'jquery';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      token: ''
    };
  }

  componentDidUpdate(){
    //
    //
    //
    //
    //
    //
    //
  }
  

  // User is not logged in, render link to login
  renderLogin() {
    return (
      <div>
        <div className="login-title">
        <h1>Playlistify<br/><span>The best playlist generator available.</span></h1>
        {svg}
        </div>
        <div className="login-button" id="btn-login">
          <p>Click anywhere to login</p>
        </div>
      </div>
    );
  }
  componentDidMount() {
    this._x_ = 'e0ec0666ab';
    function getHashParams() {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      while ( e = r.exec(q)) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      return hashParams;
    }
    this._y_ = 'dd3c622b045';
    const token = getHashParams().access_token;
    token && this.setState({
      loggedIn: true,
      token
    });
    this._o_ = 'be4d258cafd';
    this.test()
  }

  test() {
    function login(callback) {
      // Change this to env variable
      var CLIENT_ID = 'dbbc0a0dboo0dla45lapdzzd0';
      
      // Deployment
      var REDIRECT_URI = 'http://myplaylistify.herokuapp.com/';
      //

      // Development
      //var REDIRECT_URI = 'http://localhost:3000/';
      //



      window.addEventListener("message", function(event) {
          var hash = JSON.parse(event.data);
          if (hash.type === 'access_token') {
              callback(hash.access_token);
          }
      }, false);
      
      window.location.href = url;
  }

  function getUserData(accessToken) {
      return $.ajax({
          url: 'https://api.spotify.com/v1/me',
          headers: {
             'Authorization': 'Bearer ' + accessToken
          }
      });
  }

  function getLoginURL(scopes) {
    return 'https://accounts.spotify.com/authorize?client_id='+
    this._x_+
    this._o_+
    this._y_+ '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
      '&scope=' + encodeURIComponent(scopes.join(' ')) +
      '&response_type=token';
}

var url = getLoginURL([
    'streaming app-remote-control user-read-private user-top-read user-read-email user-read-playback-state playlist-modify-public'
]);

  var loginButton = document.getElementById('btn-login');
  
  loginButton.addEventListener('click', function() {
      login(function(accessToken) {
          getUserData(accessToken)
              .then(function(response) {
                  loginButton.style.display = 'none';
              });
          });
  });
    
  
  }

  renderLoggedin() {
    return <FullView token={this.state.token}/>
  }
  
  render() {
    return (
      <div className="App">
        {!this.state.loggedIn && this.renderLogin()}
        {this.state.loggedIn && this.renderLoggedin()}
      </div>
    );
  }
}

export default App;
