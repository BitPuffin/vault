var queryparse = function(string) {
  if (typeof string === 'object') return string;
  if (/^ *$/.test(string)) return {};

  var params = {},
      pairs  = string.split('&'),
      parts;

  for (var i = 0, n = pairs.length; i < n; i++) {
    parts = pairs[i].split('=');
    params[decodeURIComponent(parts[0])] = decodeURIComponent(parts.slice(1).join('='));
  }
  return params;
};

var querystring = function(object) {
  if (typeof object === 'string') return object;
  var pairs = [];
  for (var key in object) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(object[key]));
  }
  return pairs.join('&');
};

var request = function(method, url, params, headers, callback, context) {
  params = querystring(params);

  if (method === 'GET') {
    if (params !== '') url = url + (/\?/.test(url) ? '&' : '?') + params;
  }
  else if (method === 'PUT') {
    headers['Content-Length'] = params.length;
  }
  else if (method === 'DELETE') {
    headers['Content-Length'] = '0';
  }

  var xhr = window.XDomainRequest ? new XDomainRequest() : new XMLHttpRequest();

  xhr.open(method, url, true);
  for (var key in headers) {
    if (xhr.setRequestHeader) xhr.setRequestHeader(key, headers[key]);
  }

  xhr.onload = xhr.onerror = xhr.ontimeout = function() {
    callback.call(context, null, {
      statusCode: xhr.status,
      headers:    {},
      body:       xhr.responseText
    });
  };

  if (method === 'PUT') xhr.send(params);
  else xhr.send('');
};

var oauth = {
  authorize: function(target, clientId, scopes, options) {
    var sep = /\?/.test(target) ? '&' : '?';

    target = target + sep + querystring({
      client_id:      clientId,
      redirect_uri:   window.location.href.replace(/#.*$/, ''),
      scope:          scopes.join(' '),
      response_type:  'token',
      state:          options.state
    });
    window.location.href = target;
  }
};

