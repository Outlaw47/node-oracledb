/* Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved. */

/******************************************************************************
 *
 * You may not use the identified files except in compliance with the Apache
 * License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * The node-oracledb test suite uses 'mocha', 'should' and 'async'.
 * See LICENSE.md for relevant licenses.
 *
 * NAME
 *   165. soda2.js
 *
 * DESCRIPTION
 *   Some more tests of sodaDatabase object and createCollection() method.
 *
 *****************************************************************************/
'use strict';

const oracledb = require('oracledb');
const should   = require('should');
const dbconfig = require('./dbconfig.js');
const sodaUtil = require('./sodaUtil.js');

describe('165. soda2.js', () => {

  before(async function() {
    const runnable = await sodaUtil.checkPrerequisites();
    if (!runnable) this.skip();

    await sodaUtil.cleanup();
  });

  it('165.1 create two sodaDatabase objects which point to the same instance', async () => {
    let conn;
    try {
      conn = await oracledb.getConnection(dbconfig);
      let sd1 = conn.getSodaDatabase();
      let sd2 = conn.getSodaDatabase();
      // sd1 creates the collection
      let collName = "soda_test_165_1";
      let coll_create = await sd1.createCollection(collName);
      // sd2 opens the collection
      let coll_open = await sd2.openCollection(collName);
      should.exist(coll_open);
      await coll_create.drop();
    } catch(err) {
      should.not.exist(err);
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch(err) {
          should.not.exist(err);
        }
      }
    }

  }); // 165.1

  it('165.2 create two sodaDatabase objects from two connections', async () => {
    let conn1, conn2;
    try {
      conn1 = await oracledb.getConnection(dbconfig);
      let sd1 = conn1.getSodaDatabase();
      conn2 = await oracledb.getConnection(dbconfig);
      let sd2 = conn1.getSodaDatabase();

      let t_collname = "soda_test_165_2";
      let coll = await sd1.createCollection(t_collname);

      let cNames = await sd2.getCollectionNames();
      should.deepEqual(cNames, [ t_collname ] );

      await coll.drop();
    } catch(err) {
      should.not.exist(err);
    } finally {
      if (conn1) {
        try {
          await conn1.close();
        } catch(err) {
          should.not.exist(err);
        }
      }
      if (conn2) {
        try {
          await conn2.close();
        } catch(err) {
          should.not.exist(err);
        }
      }
    }
  }); // 165.2

  it('165.3 will open this collection when creating a collection with the existing name', async () => {
    let conn;
    try {
      conn = await oracledb.getConnection(dbconfig);
      let sd = conn.getSodaDatabase();

      let t_collname = "soda_test_165_3";
      await sd.createCollection(t_collname);
      let coll = await sd.createCollection(t_collname);

      let cNames = await sd.getCollectionNames();
      should.deepEqual(cNames, [ t_collname ] );

      await coll.drop();
    } catch(err) {
      should.not.exist(err);
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch(err) {
          should.not.exist(err);
        }
      }
    }
  }); // 165.3

  it('165.4 Negative - createCollection() when collection name is empty string', async () => {
    let conn, coll;
    try {
      conn = await oracledb.getConnection(dbconfig);
      let sd = conn.getSodaDatabase();

      let collName = "";
      await sodaUtil.assertThrowsAsync(
        async () => await sd.createCollection(collName),
        /ORA-40658:/
      );
      // ORA-40658: Collection name cannot be null for this operation.

    } catch(err) {
      should.not.exist(err);
    } finally {
      if (coll) {
        try {
          await coll.drop();
        } catch(err) {
          should.not.exist(err);
        }
      }

      if (conn) {
        try {
          await conn.close();
        } catch(err) {
          should.not.exist(err);
        }
      }
    }
  }); // 165.4

});