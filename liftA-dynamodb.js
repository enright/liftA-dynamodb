/*
MIT License

Copyright (c) 2017 Bill Enright

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function () {

	'use strict';

  function awsDynamo(dynamoConfig) {
    let DynamoDB = require('aws-sdk/clients/dynamodb');
    return new DynamoDB(dynamoConfig);
  }

  module.exports = function (dynamoConfig) {
    return ((dynamo) => {
  		let cb = (x, cont, p, advance, err, data) => {
  			if (err) {
  				x = arw.Error(err, x);
  			} else {
  				console.log('dyna callback data: ', data);
  				x = [data, x.second()];
  			}
  			advance();
  			cont(x, p);
  		};

  		let getItemA = (reqParams) => (x, cont, p) => {
  			let cancelId;
  			let advance = () => p.advance(cancelId);
  			let params = reqParams(x);
  			console.log('getItemA params: ', params);
  			let req = dynamo.getItem(params, cb.bind(undefined, x, cont, p, advance));
  			cancelId = p.add(() => req.abort());
  			return cancelId;
  		};

  		return {
  			getItemA: getItemA
  		};
  	})(awsDynamo(dynamoConfig));
  };

})();