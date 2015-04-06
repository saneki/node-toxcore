var assert = require('assert');
var should = require('should');
var path = require('path');
var Tox = require(path.join(__dirname, '..', '..', 'lib', 'new', 'tox'));
var consts = require(path.join(__dirname, '..', '..', 'lib', 'new', 'consts'));

// @todo: Cleanup (kill tox instances afterwards)
describe('Tox', function() {
  var tox = new Tox();
  tox.start();

  var toxNoUdp = new Tox({ udp: false });
  toxNoUdp.start();

  var customPort = 33510;
  var toxCustomPort = new Tox({ startPort: customPort, endPort: customPort });
  toxCustomPort.start();

  var toxDead = new Tox();
  toxDead.free();

  var addressRegex = /^[0-9a-fA-F]{76}$/;

  var fakeAddresses = [
    '7bd26c7867ef3a08f0010dc646845284a52f69cb9fded8a2635da3bfe0ba7a4f8facd97f24d6',
    '18e8bba90991e22dc70d8e8c188c93c4d38d62d2ab4c6d5aa6758b9b34925a31b18e0e25019b'
  ];

  var fakePublicKeys = [
    '94f44a6edbfc8ff1dc3ed3c460da046f4280a234edcbd7f11c023e43f4f0cd67',
    '5a1cd1a18f4411de8267154b6d9ac3a93d98e8c6e682987803cc6057472c444c'
  ];

  describe('#getAddress(), #getAddressSync()', function() {
    it('should return a buffer of expected size', function() {
      var addr = tox.getAddressSync();
      addr.should.be.a.Buffer;
      addr.length.should.equal(consts.TOX_FRIEND_ADDRESS_SIZE);
    });

    it('should return a buffer of expected size (async)', function(done) {
      tox.getAddress(function(err, addr) {
        addr.should.be.a.Buffer;
        addr.length.should.equal(consts.TOX_FRIEND_ADDRESS_SIZE);
        done(err);
      });
    });
  });

  describe('#getAddressHex(), #getAddressHexSync()', function() {
    it('should return an address as a hex string', function() {
      var addr = tox.getAddressHexSync();
      addr.should.match(addressRegex);
    });

    it('should return an address as a hex string (async)', function(done) {
      tox.getAddressHex(function(err, addr) {
        addr.should.match(addressRegex);
        done(err);
      });
    });
  });

  describe('#setName(), #setNameSync(), #getName(), #getNameSync()', function() {
    it('should set and get the name', function() {
      var name = 'Hello world!';
      tox.setNameSync(name);
      tox.getNameSync().should.equal(name);
    });

    it('should set and get the name (async)', function(done) {
      var name = 'Some name';
      tox.setName(name, function(err) {
        if(err) done(err);
        tox.getName(function(err, newName) {
          newName.should.equal(name);
          done(err);
        });
      });
    });
  });

  describe('#setStatusMessage(), #setStatusMessageSync(), #getStatusMessage(), #getStatusMessageSync()', function() {
    it('should set and get the status message', function() {
      var statusMessage = 'Hello world!';
      tox.setStatusMessageSync(statusMessage);
      tox.getStatusMessageSync().should.equal(statusMessage);
    });

    it('should set and get the status message (async)', function(done) {
      var statusMessage = 'Some status message';
      tox.setStatusMessage(statusMessage, function(err) {
        if(err) done(err);
        tox.getStatusMessage(function(err, newStatusMessage) {
          newStatusMessage.should.equal(statusMessage);
          done(err);
        });
      });
    });
  });

  describe('#setStatus(), #setStatusSync(), #getStatus(), #getStatusSync()', function() {
    it('should set and get the status', function() {
      var status = 1;
      tox.setStatusSync(status);
      tox.getStatusSync().should.equal(status);
    });

    it('should set and get the status (async)', function(done) {
      var status = 2;
      tox.setStatus(status, function(err) {
        if(err) done(err);
        tox.getStatus(function(err, newStatus) {
          newStatus.should.equal(status);
          done(err);
        });
      });
    });
  });

  describe('#addFriend(), #addFriendSync(), #addFriendNoRequest(), #addFriendNoRequestSync()', function() {
    it('should add a friend from a hex string address', function() {
      var addr = fakeAddresses[0],
          friend = tox.addFriendSync(addr, 'Hi!');
      should(friend).be.type('number');
    });

    it('should add a friend from a hex string address (async)', function(done) {
      var addr = fakeAddresses[1];
      tox.addFriend(addr, 'Hello', function(err, friend) {
        should(friend).be.type('number');
        done(err);
      });
    });

    it('should add a friend from a hex string public key', function() {
      var publicKey = fakePublicKeys[0],
          friend = tox.addFriendNoRequestSync(publicKey);
      should(friend).be.type('number');
    });

    it('should add a friend from a hex string public key (async)', function(done) {
      var publicKey = fakePublicKeys[1];
      tox.addFriendNoRequest(publicKey, function(err, friend) {
        should(friend).be.type('number');
        done(err);
      });
    });
  });

  describe('#getUdpPort(), #getUdpPortSync()', function() {
    it('should return a Number with udp enabled by default', function() {
      var port = tox.getUdpPortSync();
      port.should.be.a.Number;
      port.should.be.greaterThan(0);
    });

    it('should return a Number with udp enabled by default (async)', function(done) {
      tox.getUdpPort(function(err, port) {
        port.should.be.a.Number;
        port.should.be.greaterThan(0);
        done(err);
      });
    });

    it('should return the port specified', function() {
      var port = toxCustomPort.getUdpPortSync();
      port.should.equal(customPort);
    });

    it('should return the port specified (async)', function(done) {
      toxCustomPort.getUdpPort(function(err, port) {
        port.should.equal(customPort);
        done(err);
      });
    });

    it('should throw a not-bound error if not listening on udp', function() {
      (function() { toxNoUdp.getUdpPortSync(); }).should.throw();
    });

    it('should return a not-bound error if not listening on udp (async)', function(done) {
      toxNoUdp.getUdpPort(function(err, port) {
        should.exist(err);
        done();
      });
    });

    it('should throw an error if no handle', function() {
      (function() { toxDead.getUdpPortSync(); }).should.throw();
    });

    it('should return an error if no handle (async)', function(done) {
      toxDead.getUdpPort(function(err, port) {
        should.exist(err);
        done();
      });
    });
  });

  describe('#getTcpPort(), #getTcpPortSync()', function() {
    it('should throw a not-bound error if not a tcp relay', function() {
      (function() { tox.getTcpPortSync(); }).should.throw();
    });

    it('should return a not-bound error if not a tcp relay (async)', function(done) {
      tox.getTcpPort(function(err, port) {
        should.exist(err);
        done();
      });
    });
  });

  describe('#isUdp()', function() {
    it('should return true with udp enabled by default', function() {
      tox.isUdp().should.be.true;
    });

    it('should return false if not listening on an udp port', function() {
      toxNoUdp.isUdp().should.be.false;
    });
  });

  describe('#isTcp()', function() {
    it('should return false if not a tcp relay', function() {
      tox.isTcp().should.be.false;
    });
  });

  describe('#getOptions()', function() {
    it('should handle proxies', function() {
      var prox1 = new Tox({ proxy: { type: 'http', address: '12.34.56.92', port: 9411 } }),
          opts1 = prox1.getOptions();
      opts1.proxy_type.should.equal(consts.TOX_PROXY_TYPE_HTTP);
      opts1.proxy_address.should.equal('12.34.56.92');
      opts1.proxy_port.should.equal(9411);
      prox1.free();
    });
  });
});