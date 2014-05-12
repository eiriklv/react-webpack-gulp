/** @jsx React.DOM */
'use strict';

var React = require('react');
var MainComponent = require('./components/MainComponent');

// render base component
React.renderComponent(<MainComponent />, document.getElementById('main'));