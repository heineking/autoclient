import ncp from 'ncp';
import { resolve } from 'path';

ncp(resolve(__dirname, './assets'), resolve(__dirname, '../bin/assets'), (err) => {
  if (err) {
    throw err;
  }
});
