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

  componentDidMount() {
    function getHashParams() {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      while ( e = r.exec(q)) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      return hashParams;
    }
    const token = getHashParams().access_token;
    token && this.setState({
      loggedIn: true,
      token
    });
    this.test()
  }

  componentDidUpdate() {
  }

  test() {
    function login(callback) {
      //var CLIENT_ID = '540b226c3dddfac852d4ebba6660ce0e';
      var CLIENT_ID = 'e0ec0666abbe4d258cafddd3c622b045';
      var REDIRECT_URI = 'http://myplaylistify.herokuapp.com/';
      //var REDIRECT_URI = 'http://localhost:3000/'; // Comment this out when deploying
      function getLoginURL(scopes) {
          return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
            '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
            '&scope=' + encodeURIComponent(scopes.join(' ')) +
            '&response_type=token';
      }
      
      var url = getLoginURL([
          'user-read-private user-top-read user-read-email user-read-playback-state playlist-modify-public'
      ]);
      

  
      window.addEventListener("message", function(event) {
          var hash = JSON.parse(event.data);
          if (hash.type === 'access_token') {
              callback(hash.access_token);
          }
      }, false);
      
      //var w = window.open(url, '_self', 'menubar=no,location=no,resizable=no,scrollbars=no,status=no');
      window.location.href = url;
      //CLIENT_ID = CLIENT_ID.split("").reverse().join("");
  }

  function getUserData(accessToken) {
      return $.ajax({
          url: 'https://api.spotify.com/v1/me',
          headers: {
             'Authorization': 'Bearer ' + accessToken
          }
      });
  }

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
