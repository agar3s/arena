
const STATUS = {
  OFFLINE: 0,
  CONNECTING: 1,
  ONLINE: 2,
  CONNECTED: 3
};

var peerStatus = STATUS.OFFLINE; 
var peerConnection;

var matchConnection;

const startPeer = () => {
  console.log('getting a peer id');
  peerStatus = STATUS.CONNECTING;
  peerConnection = new Peer();
  peerConnection.on('open', registerPeer);
  peerConnection.on('connection', onOpponentConnected);
};

const registerPeer = (a) => {
  console.log('registering peer to network');
  console.log(a);
  document.getElementById('peerId').innerHTML = a;
  peerStatus = STATUS.ONLINE;
  Arena.register(peerConnection);
};

const onOpponentConnected = (_conn) => {
  console.log('opponent connected');
  console.log(_conn);
  Arena.registerSendFunction(_conn, _conn.send);
  Arena.setEventListener(eventHandler);
  _conn.on('data', onMessageReceived);
  matchConnection=_conn;
};

const onMessageReceived = (_data) => {
  console.log('on message received');
  console.log(_data);
  // parse message if it is from the protocol redirect to arena
  Arena.onMessageReceived(_data);
};

const connectToPeer = (_opponentID) => {
  console.log('connecting to opponent id: ', _opponentID);
  var conn = peerConnection.connect(_opponentID);
  onOpponentConnected(conn);
  Arena.registerMatch(peerConnection.id, conn.peer);
};

const eventHandler = {
  onValidAction: (valid, action) => {
    console.log('is valid: ', valid);
    console.log('action: ', action);
  }
}

const test = () => {
  startPeer();
  window.connectToPeer = connectToPeer;
  document.getElementById('connect').onclick = (e) =>{
    e.preventDefault();
    var opponentId = document.getElementById('opponentId').value;
    console.log('connecting to oponent:', opponentId);
    connectToPeer(opponentId);
  };

  document.getElementById('start').onclick = (e) =>{
    e.preventDefault();
    var keyword = document.getElementById('keyword').value || 'ethBogota';
    Arena.startTurn(keyword);
  };

  document.getElementById('rock').onclick = (e) => Arena.declareAction('rock');
  document.getElementById('paper').onclick = (e) => Arena.declareAction('paper');
  document.getElementById('scissors').onclick = (e) => Arena.declareAction('scissors');


};

test();
