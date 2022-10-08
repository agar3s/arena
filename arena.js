
// pretty simple hash function 
const computeHash = (value) => {
  var p = 31;
  var m = 1e9 + 9;
  var hash_value = 0;
  var p_pow = 1;
  for (var i = 0; i < value.length; i++) {
      hash_value = (hash_value + (value.codePointAt(i) - 'a'.codePointAt(0) + 1) * p_pow) % m;
      p_pow = (p_pow * p) % m;
  }
  return hash_value;
};

const generateKey = (length) => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$$%!^&*';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const hash = (value, privateKey) => computeHash(value) ^ computeHash(privateKey);

const EXCHANGE = {
  OWN_READY: 1,
  OPPONENT_READY: 2,
  BOTH_READY: 3
};

window.Arena = (() => {
  var conn = {};
  var sendCall = (data) => console.log('not implemented');
  var listener = (event) => console.log('generic event');
  var keyword = 'ETHBogota';
  var privateKey = 'Whatever';
  var actionKey = 'rock';
  var opponentAction = {};
  var exchangeStatus = 0;

  const register = (dataPeer) => {
    console.log('>> Arena: registering peer');
    // this should registe the peer id to the network?
    console.log(dataPeer.id);
  };

  const listPeers = () => {
    // someService.getAvailablePeers()
    return [
      { id: 'something', name: 'overkiller', range: '33' }
    ]
  };

  const registerSendFunction = (_conn, _sendCall) => {
    conn = _conn;
    sendCall = _sendCall;
  };

  const registerMatch = (_id, _challenger) => {
    console.log('>> Arena: should register on network that a match is in progress');
    console.log(`${ _challenger } is challenging ${ _id} to a duel`);
  };

  const onMessageReceived = (_data) => {
    console.log('>> Arena: message received: ', _data);
    if (_data.type === 'action') {
      if ((exchangeStatus & EXCHANGE.OPPONENT_READY) > 0) {
        console.log('opponent action already received');
        return;
      }
      opponentAction = {
        actionHash: _data.actionHash,
        keywordHash: _data.keywordHash
      };
      updateExchange(EXCHANGE.OPPONENT_READY);
    } else if (_data.type === 'reveal') {
      validateOpponentAction(_data);
    }
  };

  const setEventListener = (_listener) => listener = _listener;

  const startTurn = (_keyword) => {
     // ask server for keyword, or maybe at connection it delivers a series of these keywords
    keyword = _keyword;
    // generate a private key
    privateKey = generateKey(10);
    exchangeStatus = 0;
    opponentAction = {};
  };

  const declareAction = (_actionKey) => {
    if ((exchangeStatus & EXCHANGE.OWN_READY) > 0) {
      console.log('action already declared');
      return;
    }
    actionKey = _actionKey;
    var actionHash = {
      type: 'action',
      actionHash: hash(actionKey, privateKey),
      keywordHash: hash(keyword, privateKey)
    };
    sendCall.call(conn, actionHash);
    updateExchange(EXCHANGE.OWN_READY);
  };

  const updateExchange = (_exchange) => {
    exchangeStatus |= _exchange;
    if (exchangeStatus == EXCHANGE.BOTH_READY) {
      revealAction();
    }
  }

  const revealAction = () => {
    var action = {
      type: 'reveal',
      actionKey,
      privateKey
    };
    sendCall.call(conn, action);
  };

  const validateOpponentAction = (action) => {
    const actionHash = hash(action.actionKey, action.privateKey);
    const keywordHash = hash(keyword, action.privateKey);
    const validAction = actionHash === opponentAction.actionHash && keywordHash === opponentAction.keywordHash;
    listener.onValidAction(validAction, action.actionKey);
  }

  return {
    register,
    listPeers,
    registerSendFunction,
    onMessageReceived,
    registerMatch,
    startTurn,
    declareAction,
    setEventListener,
  };
})();
