/*
 * This file is part of node-toxcore.
 *
 * node-toxcore is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * node-toxcore is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with node-toxcore. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/**
 * node-toxcore (new_api) async example with bluebird promises.
 */

var async = require('async');
var Promise = require('bluebird');
var toxcore = require('toxcore');

Promise.promisifyAll(async);
Promise.promisifyAll(toxcore);

var tox = new toxcore.Tox();

/**
 * Bootstrap tox via hardcoded nodes.
 * For more nodes, see: https://wiki.tox.chat/users/nodes
 */
var bootstrap = function(callback) {
  // Define nodes to bootstrap from
  var nodes = [
    { maintainer: 'saneki',
      address: '96.31.85.154',
      port: 33445,
      key: '674153CF49616CD1C4ADF44B004686FC1F6C9DCDD048EF89B117B3F02AA0B778' },
    { maintainer: 'Impyy',
      address: '178.62.250.138',
      port: 33445,
      key: '788236D34978D1D5BD822F0A5BEBD2C53C64CC31CD3149350EE27D4D9A2F9B6B' },
    { maintainer: 'sonOfRa',
      address: '144.76.60.215',
      port: 33445,
      key: '04119E835DF3E78BACF0F84235B300546AF8B936F035185E2A8E9E0A67C8924F' }
  ];

  async.mapAsync(nodes, function(node, cb) {
    tox.bootstrapAsync(node.address, node.port, node.key).then(function() {
      console.log('Successfully bootstrapped from ' + node.maintainer + ' at ' + node.address + ':' + node.port);
      console.log('... with key ' + node.key);
      cb();
    }).catch(function(err) {
      console.error('Error bootstrapping from ' + node.maintainer + ':', err);
      cb(err);
    });
  }).then(function() {
    // Once all nodes have been bootstrapped from, call our callback
    callback();
  });
};

var initProfile = function(callback) {
  var setName = tox.setNameAsync('Promises Bot'),
      setStatusMessage = tox.setStatusMessageAsync('node-toxcore promises bot example');
  Promise.join(setName, setStatusMessage, callback);
};

var initCallbacks = function(callback) {
  tox.on('selfConnectionStatus', function(e) {
    console.log(e.isConnected() ? 'Connected' : 'Disconnected');
  });

  tox.on('friendName', function(e) {
    console.log('Friend[' + e.friend() + '] changed their name: ' + e.name());
  });

  tox.on('friendStatusMessage', function(e) {
    console.log('Friend[' + e.friend() + '] changed their status message: ' + e.statusMessage());
  });

  tox.on('friendStatus', function(e) {
    console.log('Friend[' + e.friend() + '] changed their status: ' + e.status());
  });

  tox.on('friendConnectionStatus', function(e) {
    console.log('Friend[' + e.friend() + '] is now ' + (e.isConnected() ? 'online' : 'offline'));
  });

  tox.on('friendTyping', function(e) {
    console.log('Friend[' + e.friend() + '] is ' + (e.isTyping() ? 'typing' : 'not typing'));
  });

  tox.on('friendReadReceipt', function(e) {
    console.log('Friend[' + e.friend() + '] receipt: ' + e.receipt());
  });

  tox.on('friendRequest', function(e) {
    tox.addFriendNoRequest(e.publicKey(), function(err, friend) {
      console.log('Received friend request: ' + e.message());
      console.log('Accepted friend request from ' + e.publicKeyHex());
    });
  });

  tox.on('friendMessage', function(e) {
    if(e.isAction()) {
      console.log('** Friend[' + e.friend() + '] ' + e.message() + ' **');
    } else {
      console.log('Friend[' + e.friend() + ']: ' + e.message());
    }
    // Echo the message back
    tox.sendFriendMessageSync(e.friend(), e.message(), e.messageType());

    if(e.message() === 'typing on') {
      tox.setTyping(e.friend(), true, function(err) {
        console.log('Started typing to friend[' + e.friend() + ']');
      });
    } else if(e.message() === 'typing off') {
      tox.setTyping(e.friend(), false, function(err) {
        console.log('Stopped typing to friend[' + e.friend() + ']');
      });
    }

    if(e.message() === 'profile') {
      var getName = tox.getFriendNameAsync(e.friend()),
          getStatusMessage = tox.getFriendStatusMessageAsync(e.friend()),
          getStatus = tox.getFriendStatusAsync(e.friend()),
          getConnectionStatus = tox.getFriendConnectionStatusAsync(e.friend());

      Promise.join(getName, getStatusMessage, getStatus, getConnectionStatus,
        function(name, statusMessage, status, connectionStatus) {
        console.log('Friend ' + e.friend() + ' profile:');
        console.log('  Name: ' + name);
        console.log('  Status message: ' + statusMessage);
        console.log('  Status: ' + status);
        console.log('  Connection status: ' + connectionStatus);
      });
    }

    if(e.message() === 'lastonline') {
      tox.getFriendLastOnlineAsync(e.friend).then(function(lastOnline) {
        console.log('Last online: ' + lastOnline.toString());
      });
    }

    if(e.message() === 'namelen') {
      var getNameSize = tox.getFriendNameSizeAsync(e.friend()),
          getStatusMessageSize = tox.getFriendStatusMessageSizeAsync(e.friend());
      Promise.join(getNameSize, getStatusMessageSize, function(nameSize, statusMessageSize) {
        console.log('Name length: ' + nameSize);
        console.log('Status message length: ' + statusMessageSize);
      });
    }
  });

  callback();
};

// Initialize everything + bootstrap from nodes, then when everything
// is ready, start
async.parallel([
  bootstrap,     // Bootstrap
  initProfile,   // Name, status message
  initCallbacks  // Initialize callbacks
], function() {
  tox.getAddressHex(function(err, address) {
    console.log('Address: ' + address);
    tox.start(); // Start
  });
});
