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
          err.x = x;
          x = err;
        } else {
          x = data;
        }
        advance();
        cont(x, p);
      };

      function dynamoErrorBack(method) {
        return function (x, cont, p) {
          let cancelId;
          let advance = () => p.advance(cancelId);
          let req = dynamo[method](x, cb.bind(undefined, x, cont, p, advance));
          cancelId = p.add(() => req.abort());
          return cancelId;
        };
      }

      let waitForA = (x, cont, p) => {
        let cancelId;
        let advance = () => p.advance(cancelId);
        let req = dynamo.waitFor(x.state, x.params, cb.bind(undefined, x, cont, p, advance));
        cancelId = p.add(() => req.abort());
        return cancelId;
      };

      function documentClient(options) {
        let aws = require('aws-sdk');
        if (options) {
          if (!options.service) {
            options.service = dynamo;
          }
        } else {
          options = {
            service: dynamo
          };
        }
        let doc = new aws.DynamoDB.DocumentClient(options);

        function docErrorBack(method) {
          return function (x, cont, p) {
            let cancelId;
            let advance = () => p.advance(cancelId);
            let req = doc[method](x, cb.bind(undefined, x, cont, p, advance));
            cancelId = p.add(() => req.abort());
            return cancelId;
          };
        }
        return {
          batchGetA: docErrorBack('batchGet'),
          batchWriteA: docErrorBack('batchWrite'),
          createSet: (list, options) => doc.createSet(list, options),
          deleteA: docErrorBack('delete'),
          getA: docErrorBack('get'),
          putA: docErrorBack('put'),
          queryA: docErrorBack('query'),
          scanA: docErrorBack('scan'),
          updateA: docErrorBack('update')
        };
      }

      return {
        documentClient: documentClient,
        batchGetItemA: dynamoErrorBack('batchGetItem'),
        batchWriteItemA: dynamoErrorBack('batchWriteItem'),
        createBackupA: dynamoErrorBack('createBackup'),
        createGlobalTableA: dynamoErrorBack('createGlobalTable'),
        createTableA: dynamoErrorBack('createTable'),
        deleteBackupA: dynamoErrorBack('deleteBackup'),
        deleteItemA: dynamoErrorBack('deleteItem'),
        deleteTableA: dynamoErrorBack('deleteTable'),
        describeBackupA: dynamoErrorBack('describeBackup'),
        describeContinuousBackupsA: dynamoErrorBack('describeContinuousBackups'),
        describeGlobalTableA: dynamoErrorBack('describeGlobalTable'),
        describeLimitsA: dynamoErrorBack('describeLimits'),
        describeTableA: dynamoErrorBack('describeTable'),
        describeTimeToLiveA: dynamoErrorBack('describeTimeToLive'),
        getItemA: dynamoErrorBack('getItem'),
        listBackupsA: dynamoErrorBack('listBackups'),
        listGlobalTablesA: dynamoErrorBack('listGlobalTables'),
        listTablesA: dynamoErrorBack('listTables'),
        listTagsOfResourceA: dynamoErrorBack('listTagsOfResource'),
        putItemA: dynamoErrorBack('putItem'),
        queryA: dynamoErrorBack('query'),
        restoreTableFromBackupA: dynamoErrorBack('restoreTableFromBackup'),
        scanA: dynamoErrorBack('scan'),
        tagResourceA: dynamoErrorBack('tagResource'),
        untagResourceA: dynamoErrorBack('untagResource'),
        updateGlobalTableA: dynamoErrorBack('updateGlobalTable'),
        updateItemA: dynamoErrorBack('updateItem'),
        updateTableA: dynamoErrorBack('updateTable'),
        updateTimeToLiveA: dynamoErrorBack('updateTimeToLive'),
        waitForA: waitForA
      };
    })(awsDynamo(dynamoConfig));
  };

})();